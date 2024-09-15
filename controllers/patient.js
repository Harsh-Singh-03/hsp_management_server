const bcrypt = require('bcryptjs')
const Patient = require('../modals/patient');
const jwt = require('jsonwebtoken');
const patient_repo = require('../repos/patient.repo');
const crypto = require('crypto');
const mail_template = require('../utilities/mail-template');
const sendEmail = require('../utilities/mail');
const cloudinary = require("cloudinary")
require('dotenv/config')

class patientContoller {
    constructor() { }

    async registration(req, res) {
        try {
            if (!_.has(req.body, 'name')) {
                res.status(400).send({ success: false, data: {}, message: 'Name is required' });
            }
            else if (!_.has(req.body, 'email')) {
                res.status(400).send({ success: false, data: {}, message: 'Email is required' });
            }
            else if (!_.has(req.body, 'phone')) {
                res.status(400).send({ success: false, data: {}, message: 'Phone is required' });
            }
            else if (!_.has(req.body, 'password')) {
                res.status(400).send({ success: false, data: {}, message: 'Password is required' });
            }
            else if (!_.has(req.body, 'age')) {
                res.status(400).send({ success: false, data: {}, message: 'age is required' });
            }
            else if (!_.has(req.body, 'gender')) {
                res.status(400).send({ success: false, data: {}, message: 'gender is required' });
            }
            else {
                const userExist = await Patient.exists({
                    $or: [
                        { email: req.body.email },
                        { phone: req.body.phone }
                    ]
                });
                if (!_.isEmpty(userExist) && userExist) {
                    res.status(400).send({ success: false, message: 'Patient Already Registered' });;
                }
                else {
                    const salt = await bcrypt.genSalt(10)
                    const securePass = await bcrypt.hash(req.body.password, salt);
                    req.body.password = securePass;
                    if(req?.user?.role === 'admin'){
                        req.body.isEmailVerified = true
                    }
                    let saveUser = await Patient.create(req.body);
                    if (!_.isEmpty(saveUser)) {
                        if(!saveUser.isEmailVerified) {
                            const token = crypto.randomBytes(32).toString("hex")
                            saveUser.email_verification_token = token
                            await saveUser.save()
    
                            const redirect_url = req.body.redirect || process.env.DOMAIN
                
                            const url = `${redirect_url}/verify-email/patient/${saveUser._id}/${token}`
                            console.log(url)
                            const emailContent = mail_template.email_verification(saveUser, url);
                
                            const isSend = await sendEmail(saveUser.email, "Email Verification", emailContent)
                            if(isSend){
                                res.status(200).send({ success: true, message: 'Verification email sent successfully. Please check your inbox.' });
                            }else{
                                res.status(500).send({ success: false, message: 'Failed to send verification email' });
                            }
                        }else {
                            res.status(200).send({ success: true, message: 'Patient Registration Successful', data: saveUser });
                        }
                    }
                    else {
                        res.status(400).send({ success: false, data: {}, message: 'Patient Registration Unsuccessful' });
                    }
                }
            }
        } catch (err) {
            res.status(500).send({ success: false, data: {}, message: err?.message })
        }
    };

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email) {
                return res.status(400).send({ success: false, data: {}, message: 'Invalid email' })
            }
            if (!password) {
                return res.status(400).send({ success: false, data: {}, message: 'Invalid password' })
            }
            let user = await Patient.findOne({ email, isDeleted: { $ne: true } })
            if (_.isEmpty(user) || !user) {
                return res.status(404).send({ success: false, data: {}, message: "email is not registered" })
            }
            const passCompare = await bcrypt.compare(password, user.password)
            if (!passCompare) {
                return res.status(400).send({ success: false, data: {}, message: "Invalid password" })
            }

            const data = {
                user: {
                    id: user._id,
                }
            }

            const authToken = jwt.sign(data, process.env.JWT_SIGN);

            res.cookie(`patient_token`, `${authToken}`, {
                maxAge: Math.floor((Date.now() / 1000) + (60 * 86400) * 1000),
                secure: true,
                httpOnly: true,
                sameSite: "none",
                path: "/",
            });

            res.status(200).json({
                success: true,
                message: "Welcome " + user.name
            })

        } catch (error) {
            return res.status(500).send({ success: false, data: {}, message: error.message });
        }
    }

    async deletePatient(req, res) {
        try {
            const deletedPatient = await Patient.findByIdAndUpdate(req.params.id, { isDeleted: true });
            if (!deletedPatient) {
                return res.status(500).send({ success: false, message: 'Failed to delete patient' })
            }
            res.send({ success: true, message: 'Patient deleted successfully', data: deletedPatient })
        } catch (e) {
            res.status(500).send({ success: false, message: e.message })
        }
    }

    async analytics(req, res) {
        try {
            const analytics = await patient_repo.get_analytics(req)
            if (!analytics) {
                return res.status(404).send({ success: false, message: "Patient analytics not available" })
            }
            res.send({ success: true, message: 'Analytics fetched successfully', data: analytics || {} });
        } catch (error) {
            console.log(error)
            res.status(500).send({ success: false, message: error.message })
        }
    }

    async forgetPassword(req, res) {
        try {
            let user = await Patient.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            }

            const token = crypto.randomBytes(32).toString("hex")
            const newUserData = { forget_pass_token: token }
            await Patient.findByIdAndUpdate(user._id, newUserData, { new: true });

            const redirect_url = req.body.redirect || process.env.DOMAIN

            const url = `${redirect_url}/new-pass/patient/${user._id}/${token}`

            const emailContent = mail_template.forget_pass(user, url);

            const isSend = await sendEmail(user.email, "Forget Password", emailContent)

            if (isSend) {
                res.status(200).json({ success: true, message: "Email Sent" });
            } else {
                res.status(400).json({ success: false, message: "Failed to Send Email" });
            }
        } catch (e) {
            res.status(500).send({ message: e.message, success: false });
        }
    };

    async newPassword(req, res) {
        try {
            let password = req.body.password;
            const userInfo = await Patient.findOne({ _id: req.body.id, forget_pass_token: req.body.token });
            if (_.isEmpty(userInfo) || !userInfo._id) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            } else {
                let hashedPassword = bcrypt.hashSync(password, 10);
                let updatedUser = await Patient.findByIdAndUpdate(userInfo._id, { password: hashedPassword, forget_pass_token: '' }, { new: true });
                if (!_.isEmpty(updatedUser) && updatedUser._id) {
                    res.status(200).send({ success: true, data: updatedUser, message: 'Password Updated Successfully' });
                }
                else {
                    res.status(400).send({ success: false, message: 'Password could not be updated' });
                }
            }
        } catch (e) {
            res.status(500).send({ message: e.message, success: false });
        }
    }

    async updateProfile(req, res) {
        try {
            let updateUser = await Patient.findByIdAndUpdate(req.user._id, req.body, { new: true, upsert: true }).exec()
            if (!_.isEmpty(updateUser) && updateUser._id) {
                res.status(200).send({ success: true, data: updateUser, message: 'Profile details updated successfully' });
            }
            else {
                res.status(400).send({ success: false, data: {}, message: 'Profile details could not be updated' });
            }
        } catch (e) {
            res.status(500).send({ success: false, message: e.message });
        }
    };

    async changePassword(req, res) {
        try {
            let userInfo = await Patient.findById(req.user._id);
            if (!bcrypt.compare(req.body.password, userInfo.password)) {
                res.status(400).send({ success: false, message: 'Wrong Current Password' });
            }
            const salt = await bcrypt.genSalt(10)
            const securePass = await bcrypt.hash(req.body.new_password, salt);

            let updatePassword = await Patient.findByIdAndUpdate(req.user._id, { password: securePass });
            if (!_.isEmpty(updatePassword)) {
                res.status(200).send({ success: true, data: updatePassword, message: 'Password updated successfully' });
            }
            else {
                res.status(400).send({ success: false, message: 'Password could not be updated' });
            }
        } catch (e) {
            res.status(500).send({ success: false, message: e.message });
        }
    };

    async email_verify_req(req, res){
        try {
            const saveUser = await Patient.findById(req.user._id)
            const token = crypto.randomBytes(32).toString("hex")
            saveUser.email_verification_token = token
            await saveUser.save()

            const redirect_url = req.body.redirect || process.env.DOMAIN

            const url = `${redirect_url}/verify-email/patient/${saveUser._id}/${token}`

            const emailContent = mail_template.email_verification(saveUser, url);

            const isSend = await sendEmail(saveUser.email, "Email Verification", emailContent)
            if(isSend){
                res.status(200).send({ success: true, message: 'Verification email sent successfully. Please check your inbox.' });
            }else{
                res.status(500).send({ success: false, message: 'Failed to send verification email' });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    }
    async verify_email(req, res) {
        try {
            const userInfo = await Patient.findOne({ _id: req.body.id, email_verification_token: req.body.token });
            if(!_.isEmpty(userInfo) && userInfo._id){
                userInfo.isEmailVerified = true;
                userInfo.email_verification_token = null;
                await userInfo.save()
                res.status(200).send({success: true, message: 'Email verified successfully'});
            }else{
                res.status(404).send({ success: false, message: 'User Not Found' });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: 'Error while verifying' })
        }
    }



    //     try {
    //         if (!_.has(req.body, 'email')) {
    //             res.status(400).send({ success: false, data: {}, message: 'Email is required' });
    //         }
    //         else if (!_.has(req.body, 'password')) {
    //             res.status(400).send({ success: false, data: {}, message: 'Password is required' });
    //         }
    //         else {
    //             let password = req.body.password;
    //             let userDetails = await User.findOne({ email: req.body.email });

    //             if (!_.isEmpty(userDetails)) {
    //                 let isPasswordMatched = await bcrypt.compareSync(password, userDetails.password);
    //                 if (!isPasswordMatched) {
    //                     res.status(400).send({ success: false, data: {}, message: 'Password not matched' });
    //                 }
    //                 else {
    //                     let token = jsonwebtoken.sign({ email: userDetails.email, id: userDetails._id }, process.env.JWTSECERT, { expiresIn: process.env.JWTTIME });
    //                     res.status(200).send({ status: 200, data: userDetails, token: token, isLoggedIn: true, message: 'Logged In Successfully' });
    //                 }
    //             }
    //             else {
    //                 res.status(400).send({ success: false, data: {}, isLoggedIn: false, message: 'User not Registered!' });
    //             }
    //         }
    //     } catch (err) {
    //         return { status: 500, message: err.message };
    //     }
    // };

    // async profileDetails(req, res) {
    //     try {
    //         let userInfo = await userRepo.getUserDetails(req);
    //         if (!_.isEmpty(userInfo) && userInfo._id) {
    //             res.status(200).send({ status: 200, data: userInfo, message: 'Profile details fetched successfully' });
    //         }
    //         else {
    //             res.status(400).send({ success: false, message: 'User not found' });
    //         }
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

    // async logout(req, res) {
    //     try {
    //         let user_id = req.user._id;
    //         let userInfo = await User.findById(user_id);
    //         if (!_.isEmpty(userInfo)) {
    //             const payload = { id: user_id };
    //             const token = jsonwebtoken.sign(payload, process.env.JWTSECERT, { expiresIn: 0 });
    //             res.status(200).send({ status: 200, isLoggedIn: false, message: 'Logout Successfully' });
    //         } else {
    //             res.status(400).send({ success: false, message: 'User not found' });
    //         }
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

    // async userList(req, res) {
    //     try {
    //         let allUsers = await User.find();
    //         if (!_.isEmpty(allUsers)) {
    //             res.send({ status: 200, data: allUsers, message: 'Users list has been fetched successfully' });
    //         }
    //         else {
    //             res.send({ success: false, data: {}, message: 'No Users found' });
    //         }
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

    // async userBioAddressUpdate(req, res) {
    //     try {
    //         const userUpdate = await User.updateMany({}, { $set: { bio: '', address: '' } });
    //         res.status(200).send({ status: 200, data: userUpdate, message: 'User bio added updated successfully' });
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

}

module.exports = new patientContoller();