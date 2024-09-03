const bcrypt = require('bcryptjs')
const Doctor = require('../modals/doctor');
const jwt = require('jsonwebtoken');
const doctors_repo = require('../repos/doctors.repo');
const mail_template = require('../utilities/mail-template');
const sendEmail = require('../utilities/mail');
const crypto = require('crypto');
require('dotenv/config')

class doctorContoller {
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
            else if (!_.has(req.body, 'specialization')) {
                res.status(400).send({ success: false, data: {}, message: 'specialization is required' });
            }
            else if (!_.has(req.body, 'experience')) {
                res.status(400).send({ success: false, data: {}, message: 'experience is required' });
            }
            else {
                const userExist = await Doctor.exists({
                    $or: [
                        { email: req.body.email },
                        { phone: req.body.phone }
                    ]
                });
                if (!_.isEmpty(userExist) && userExist) {
                    res.status(400).send({ success: false, message: 'Doctor Already Registered' });;
                }
                else {
                    const salt = await bcrypt.genSalt(10)
                    const securePass = await bcrypt.hash(req.body.password, salt);
                    req.body.password = securePass;
                    req.body.experience = Number(req.body.experience);
                    if (req?.user && req?.user?.role === 'admin') {
                        req.body.status = 'approved'
                    }
                    let saveUser = await Doctor.create(req.body);
                    if (!_.isEmpty(saveUser)) {
                        res.status(200).send({ success: true, message: 'Doctor Registration Successful', data: saveUser });
                    }
                    else {
                        res.status(400).send({ success: false, data: {}, message: 'Doctor Registration Unsuccessful' });
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
            let user = await Doctor.findOne({ email, isDeleted: { $ne: true } })
            if (_.isEmpty(user) || !user) {
                return res.status(404).send({ success: false, data: {}, message: "email is not registered" })
            }
            const passCompare = await bcrypt.compare(password, user.password)
            if (!passCompare) {
                return res.status(400).send({ success: false, data: {}, message: "Invalid password" })
            }
            if (user.status !== 'approved') {
                return res.status(400).send({ success: false, data: {}, message: "Please wait for admin approval" })
            }

            const data = {
                user: {
                    id: user._id,
                }
            }

            const authToken = jwt.sign(data, process.env.JWT_SIGN);

            res.cookie(`doctor_token`, `${authToken}`, {
                maxAge: Math.floor((Date.now() / 1000) + (60 * 86400) * 1000),
                secure: true,
                httpOnly: true,
                sameSite: "none",
                path: "/",
            });

            res.status(200).json({
                success: true,
                token: authToken,
                data: user,
                message: "Welcome " + user.name
            })

        } catch (error) {
            return res.status(500).send({ success: false, data: {}, message: error.message });
        }
    }

    async updateDoctor(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
            if (!_.isEmpty(updatedUser) && updatedUser) {
                res.status(200).send({ success: true, message: 'Doctor Profile Updated Successfully', data: updatedUser });
            }
            else {
                res.status(400).send({ success: false, data: {}, message: 'Doctor Profile Update Unsuccessful' });
            }
        } catch (err) {
            res.status(500).send({ success: false, data: {}, message: err?.message })
        }
    }

    async deleteDoctor(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await Doctor.findByIdAndUpdate(id, { isDeleted: true }, { $new: true });
            if (!_.isEmpty(deletedUser) && deletedUser) {
                res.status(200).send({ success: true, message: 'Doctor Profile Deleted Successfully', data: deletedUser });
            }
            else {
                res.status(400).send({ success: false, data: {}, message: 'Doctor Profile Delete Unsuccessful' });
            }
        } catch (err) {
            res.status(500).send({ success: false, data: {}, message: err?.message })
        }
    }

    async forgetPassword(req, res) {
        try {
            let user = await Doctor.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            }

            const token = crypto.randomBytes(32).toString("hex")
            const newUserData = { forget_pass_token: token }
            await Doctor.findByIdAndUpdate(user._id, newUserData, { new: true });

            const redirect_url = req.body.redirect || process.env.DOMAIN

            const url = `${redirect_url}/new-pass/doctor/${user._id}/${token}`

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
            const userInfo = await Doctor.findOne({ _id: req.body.id, forget_pass_token: req.body.token });
            if (_.isEmpty(userInfo) || !userInfo._id) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            } else {
                let hashedPassword = bcrypt.hashSync(password, 10);
                let updatedUser = await Doctor.findByIdAndUpdate(userInfo._id, { password: hashedPassword, forget_pass_token: '' }, { new: true });
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

    async analytics(req, res) {
        try {
            const analytics = await doctors_repo.get_analytics(req)
            if(!analytics){
                return res.status(500).send({ success: false, message: "Doctor analytics not available" })
            }
            res.send({ success: true, message: 'Analytics fetched successfully', data: analytics || {} });
        } catch (err) {
            res.status(500).send({ success: false, data: {}, message: err?.message })
        }
    }
}

module.exports = new doctorContoller();