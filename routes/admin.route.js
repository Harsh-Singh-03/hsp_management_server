const express = require('express');
const admin = require('../controllers/admin');
const checkAuth = require('../utilities/auth');
const doctor = require('../controllers/doctor');
const patient_controller = require('../controllers/patient');
const appointment = require('../controllers/appointment');
const router = express.Router()

router.post('/admin/register', admin.registration)
router.post('/admin/login', admin.login)
router.post('/admin/doctors/list', checkAuth.admin, admin.doctorsList)
router.post('/admin/patients/list', checkAuth.admin, admin.patientList)
router.post('/admin/doctor/onboard', checkAuth.admin, doctor.registration)
router.post('/admin/patient/create', checkAuth.admin, patient_controller.registration)
router.put('/admin/doctor/update/:id', checkAuth.admin, doctor.updateDoctor)
router.delete('/admin/doctor/delete/:id', checkAuth.admin, doctor.deleteDoctor)
router.delete('/admin/patient/delete/:id', checkAuth.admin, patient_controller.deletePatient)
router.post('/admin/appointment/create', checkAuth.admin, appointment.newAppointment)
router.post('/admin/appointment/list', checkAuth.admin, appointment.appointment_list)
router.get('/admin/appointment/detail/:id', checkAuth.admin, appointment.appointment_details)
router.put('/admin/appointment/update/:id', checkAuth.admin, appointment.appointment_update)
router.post('/admin/validate', checkAuth.admin, (req, res) => {
    res.status(200).json({
        message: `Welcome ${req.user.name}`,
        success: true,
        data: req.user
    })
})

module.exports = router