const express = require('express')
const checkAuth = require('../utilities/auth')
const appointment = require('../controllers/appointment')
const router = express.Router()

router.post('/appointment/create', checkAuth.patient, appointment.newAppointment)

module.exports = router