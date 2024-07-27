require('dotenv').config();
const jwt = require('jsonwebtoken')
const Patient = require('../modals/patient')
const Doctor = require('../modals/doctor');
const Admin = require('../modals/admin');
require('dotenv/config')

const checkAuth = {
    patient: async function (req, res, next) {
        try {
            const tokens = req.cookies.patient_token || req.headers.patient_token;
            if (tokens) {
                const checktoken = await jwt.verify(tokens, process.env.JWT_SIGN);
                if(!checktoken || !checktoken?.user){
                    return res.status(401).send({success: false, message: "You are Unauthorized. Please Login again."})
                }
                let checkUser = await Patient.findOne({ _id: checktoken?.user?.id, isDeleted: {$ne: true} }).select('-password');
                if (checkUser != null) {
                    req.user = checkUser;
                    req.user.role = 'patient';
                    next();
                } else {
                    res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
                }
            } else {
                res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
            }
        } catch (error) {
            res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
        }
    },

    doctor: async function (req, res, next) {
        try {
            const tokens = req.cookies.doctor_token || req.headers.doctor_token;
            if (tokens) {
                const checktoken = await jwt.verify(tokens, process.env.JWT_SIGN);
                if(!checktoken || !checktoken?.user){
                    return res.status(401).send({success: false, message: "You are Unauthorized. Please Login again."})
                }
                let checkUser = await Doctor.findOne({ _id: checktoken?.user?.id, isDeleted: {$ne: true} }).select('-password');
                if (checkUser != null && checkUser.status === "approved") {
                    req.user = checkUser;
                    req.user.role = 'doctor';
                    next();
                } else {
                    res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
                }
            } else {
                res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
            }
        } catch (error) {
            res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
        }
    },

    admin: async function (req, res, next) {
        try {
            const tokens = req.cookies.authtoken || req.headers.authtoken;
            if (tokens) {
                const checktoken = await jwt.verify(tokens, process.env.JWT_SIGN);
                if(!checktoken || !checktoken?.user){
                    return res.status(401).send({success: false, message: "You are Unauthorized. Please Login again."})
                }
                let checkUser = await Admin.findOne({ _id: checktoken?.user?.id }).select('-password');
                if (!_.isEmpty(checkUser) && checkUser._id) {
                    req.user = checkUser;
                    req.user.role = 'admin';
                    next();
                } else {
                    res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
                }
            } else {
                res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
            }
        } catch (error) {
            res.status(401).send({ success: false, message: "You are Unauthorized. Please Login again." })
        }
    },
}

module.exports = checkAuth;