const express = require('express');
const doctor = require('../controllers/doctor');
const checkAuth = require('../utilities/auth');
const appointment = require('../controllers/appointment');
const router = express.Router()

router.get('/doctor/analytics', checkAuth.doctor, doctor.analytics)
router.post('/doctor/register', doctor.registration)
router.post('/doctor/profile/update', checkAuth.doctor, doctor.updateDoctor)
router.post('/doctor/login', doctor.login)
router.post('/doctor/forget-password', doctor.forgetPassword);
router.post('/doctor/new-password', doctor.newPassword);
router.post('/doctor/appointment/list', checkAuth.doctor, appointment.appointment_list)
router.put('/doctor/appointment/update/:id', checkAuth.doctor, appointment.appointment_update)
router.get('/doctor/appointment/detail/:id', checkAuth.doctor, appointment.appointment_details)

router.post('/doctor/validate', checkAuth.doctor, (req, res) => {
    res.status(200).json({
        message: `Welcome ${req.user.name}`,
        success: true,
        data: req.user
    })
})

router.post('/doctor/sign-out', async (req, res, next) =>{
    res.clearCookie('doctor_token');
    res.status(200).json({success: true, message: "Successfully Log Out"})
})


module.exports = router