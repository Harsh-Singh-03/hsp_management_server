const express = require('express');
const doctor = require('../controllers/doctor');
const checkAuth = require('../utilities/auth');
const appointment = require('../controllers/appointment');
const router = express.Router()

router.post('/doctor/register', doctor.registration)
router.post('/doctor/profile/update', checkAuth.doctor, doctor.updateDoctor)
router.post('/doctor/login', doctor.login)
router.post('/doctor/appointment/list', checkAuth.doctor, appointment.appointment_list)
router.put('/doctor/appointment/update/:id', checkAuth.doctor, appointment.appointment_update)

router.post('/doctor/validate', checkAuth.doctor, (req, res) => {
    res.status(200).json({
        message: `Welcome ${req.user.name}`,
        success: true,
        data: req.user
    })
})

module.exports = router