const express = require('express');
const patient = require('../controllers/patient');
const checkAuth = require('../utilities/auth');
const appointment = require('../controllers/appointment');
const router = express.Router()

router.post('/patient/register', patient.registration)
router.post('/patient/login', patient.login)

router.post('/patient/appointment/list', checkAuth.patient, appointment.appointment_list)
router.post('/patient/appointment/create', checkAuth.patient, appointment.newAppointment)
router.post('/patient/validate', checkAuth.patient, (req, res) => {
    res.status(200).json({
        message: `Welcome ${req.user.name}`,
        success: true,
        data: req.user
    })
})

module.exports = router