const bcrypt = require('bcryptjs')
const Patient = require('../modals/patient');
const jwt = require('jsonwebtoken')
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
                    let saveUser = await Patient.create(req.body);
                    if (!_.isEmpty(saveUser)) {
                        res.status(200).send({ success: true, message: 'Patient Registration Successful', data: saveUser });
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
            if(!email){
                return res.status(400).send({success: false, data: {}, message: 'Invalid email'})
            }
            if(!password){
                return res.status(400).send({success: false, data: {}, message: 'Invalid password'})
            }
            let user = await Patient.findOne({ email, isDeleted: {$ne: true} })
            if (_.isEmpty(user) || !user) {
                return res.status(404).send({success: false, data: {}, message: "email is not registered"})
            }
            const passCompare = await bcrypt.compare(password, user.password)
            if (!passCompare) {
                return res.status(400).send({success: false, data: {}, message: "Invalid password"})
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
            const deletedPatient = await Patient.findByIdAndUpdate(req.params.id, {isDeleted: true});
            if(!deletedPatient){
                return res.status(500).send({success: false, message: 'Failed to delete patient'})
            }
            res.send({success: true, message: 'Patient deleted successfully', data: deletedPatient})
        } catch (e) {
            res.status(500).send({ success: false, message: e.message })
        }
    }
    // async login(req, res) {
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

    // async forgetPassword(req, res) {
    //     try {
    //         const transporter = nodemailer.createTransport({
    //             service: "gmail",
    //             auth: {
    //                 user: process.env.NODEMAILER_USER,
    //                 pass: process.env.PASSWORD
    //             }
    //         });

    //         const mailOptions = {
    //             from: process.env.FROM,
    //             to: req.body.email,
    //             subject: "Forget Password",
    //             html: `<h1>Your Password Reset Link - http://13.201.212.185:4200/</h1> <br />`,
    //         }

    //         transporter.sendMail(mailOptions, (error, info) => {
    //             if (error) {
    //                 console.log(error);
    //             } else {
    //                 res.status(201).send({ success: true, message: "Password Update Link Sent To Your Email", info })
    //                 console.log(info.response)
    //             }
    //         });
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

    // async updateProfile(req, res) {
    //     try {
    //         let userInfo = await User.findById(req.user._id);

    //         if (req.files && req.files.length > 0) {
    //             const uploadResult = await cloudinary.v2.uploader.upload(req.files[0].path);
    //             req.body.image = uploadResult.secure_url;
    //         }
    //         else {
    //             req.body.image = userInfo.image;
    //         }

    //         let updateUser = await userRepo.updateById(req.body, req.user._id);
    //         if (!_.isEmpty(updateUser) && updateUser._id) {
    //             res.status(200).send({ status: 200, data: updateUser, message: 'Profile details updated successfully' });
    //         }
    //         else {
    //             res.status(400).send({ success: false, data: {}, message: 'Profile details could not be updated' });
    //         }
    //     } catch (e) {
    //         res.status(500).send({ status: 500, message: e.message });
    //     }
    // };

    // async changePassword(req, res) {
    //     try {
    //         let userInfo = await User.findById(req.user._id);
    //         if (!bcrypt.compareSync(req.body.currentPassword, userInfo.password)) {
    //             res.status(400).send({ success: false, message: 'Wrong Current Password' });
    //         }
    //         req.body.password = userInfo.generateHash(req.body.newPassword);
    //         let updatePassword = await userRepo.updateById(req.body, req.user._id);
    //         if (!_.isEmpty(updatePassword)) {
    //             res.status(200).send({ status: 200, data: updatePassword, message: 'Password updated successfully' });
    //         }
    //         else {
    //             res.status(400).send({ success: false, message: 'Password could not be updated' });
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