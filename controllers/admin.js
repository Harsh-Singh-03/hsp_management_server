const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Admin = require('../modals/admin');
const doctors_repo = require('../repos/doctors.repo');
const patient_repo = require('../repos/patient.repo');
const Patient = require('../modals/patient');
const admin_repo = require('../repos/admin_repo');
const mail_template = require('../utilities/mail-template');
const sendEmail = require('../utilities/mail');
const crypto = require('crypto');
require('dotenv/config')

class adminController {
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
            else {
                const userExist = await Admin.exists({
                    $or: [
                        { email: req.body.email },
                        { phone: req.body.phone }
                    ]
                });
                if (!_.isEmpty(userExist) && userExist) {
                    res.status(400).send({ success: false, message: 'Manager Already Registered' });;
                }
                else {
                    const salt = await bcrypt.genSalt(10)
                    const securePass = await bcrypt.hash(req.body.password, salt);
                    req.body.password = securePass;
                    let saveUser = await Admin.create(req.body);
                    if (!_.isEmpty(saveUser)) {
                        res.status(200).send({ success: true, message: 'Manager created Successful', data: saveUser });
                    }
                    else {
                        res.status(400).send({ success: false, data: {}, message: 'Manager Registration Unsuccessful' });
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
            let user = await Admin.findOne({ email })
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

            res.cookie(`authtoken`, `${authToken}`, {
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
    };

    async forgetPassword(req, res) {
        try {
            let user = await Admin.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            }

            const token = crypto.randomBytes(32).toString("hex")
            const newUserData = { forget_pass_token: token }
            await Admin.findByIdAndUpdate(user._id, newUserData, { new: true });

            const redirect_url = req.body.redirect || process.env.DOMAIN

            const url = `${redirect_url}/new-pass/admin/${user._id}/${token}`

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
            const userInfo = await Admin.findOne({ _id: req.body.id, forget_pass_token: req.body.token });
            if (_.isEmpty(userInfo) || !userInfo._id) {
                return res.status(404).send({ success: false, message: 'User Not Found' });
            } else {
                let hashedPassword = bcrypt.hashSync(password, 10);
                let updatedUser = await Admin.findByIdAndUpdate(userInfo._id, { password: hashedPassword, forget_pass_token: '' }, { new: true });
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

    async doctorsList(req, res) {
        try {
            const doctors_list = await doctors_repo.list(req)
            if(_.isEmpty(doctors_list) || !doctors_list){
                res.send({success: false, message: 'doctors not found', data: []});
            }else{
                res.send({success: true, message: 'doctors found', data: doctors_list});
            }
        } catch (e) {
          res.status(500).send({ success: false, message: e.message });  
        }
    }

    async patientList(req, res) {
        try {
            const patients_list = await patient_repo.list(req)
            if(_.isEmpty(patients_list) || !patients_list){
                res.send({success: false, message: 'patient not found', data: []});
            }else{
                res.send({success: true, message: 'patients found', data: patients_list});
            }
        } catch (e) {
          res.status(500).send({ success: false, message: e.message });  
        }
    }

    async adminOverview (req, res) {
        try {
            const data = await admin_repo.getOverview(req)
            if(data){
                res.send({success: true, message: 'Admin Overview', data: data});
            }else{
                res.send({success: false, message: 'Admin Overview not found', data: {}});
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({ success: false, message: error.message });
        }
    }

}

module.exports = new adminController();