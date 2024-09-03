const express = require('express');
const patient = require('../controllers/patient');
const checkAuth = require('../utilities/auth');
const appointment = require('../controllers/appointment');
const router = express.Router()

router.get('/patient/analytics', checkAuth.patient, patient.analytics)
router.post('/patient/register', patient.registration)
router.post('/patient/login', patient.login)
router.post('/patient/forget-password', patient.forgetPassword);
router.post('/patient/new-password', patient.newPassword);
router.post('/patient/appointment/list', checkAuth.patient, appointment.appointment_list)
router.post('/patient/appointment/create', checkAuth.patient, appointment.newAppointment)
router.get('/patient/appointment/detail/:id', checkAuth.patient, appointment.appointment_details)
router.post('/patient/validate', checkAuth.patient, (req, res) => {
    res.status(200).json({
        message: `Welcome ${req.user.name}`,
        success: true,
        data: req.user
    })
})

router.post('/patient/sign-out', async (req, res, next) =>{
    res.clearCookie('patient_token');
    res.status(200).json({success: true, message: "Successfully Log Out"})
})


module.exports = router