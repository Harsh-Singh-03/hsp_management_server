const Appointment = require("../modals/appointment");
const AppointmentHistory = require("../modals/appointment-history");
const Doctor = require("../modals/doctor");
const Patient = require("../modals/patient");
const appointment_repo = require("../repos/appointment.repo");
const { returnRef } = require("../utilities");
const sendEmail = require("../utilities/mail");
const mail_template = require("../utilities/mail-template");
require('dotenv/config')

const background_mail_service = async (req, newAppointment) => {
    try {
        var text = ''
        var email_content = ''
        var email = ''
        if (req?.query?.req_from === 'user') {
             text = 'New appointment request submitted successfully , Here is your appointment details.'
             email_content = mail_template.patient_appointment(req.user, newAppointment, null, text)
             email = req.user.email
        } else {
            const patientInfo = await Patient.findById(req.body.patient)
            email = patientInfo.email
            text = 'New appointment submitted successfully , Here is your appointment details.' 
            if(req.body.doctor){
                const doctorInfo = await Doctor.findById(req.body.doctor)
                email_content = mail_template.patient_appointment(patientInfo, newAppointment, doctorInfo, text)
                // for doctor
                let text1 = 'New appointment appointed by admin, Here is your appointment details'
                let email_content1 = mail_template.doctor_appointment(doctorInfo, newAppointment, patientInfo, text1)
                await sendEmail(doctorInfo.email, 'New appointment appointed', email_content1);
            }else{
                email_content = mail_template.patient_appointment(patientInfo, newAppointment, null, text)
            }
        }
        try {
            const isSend = await sendEmail(email, 'New appointment request', email_content);
            console.log(isSend);
        } catch (e) {
            console.log(e?.message)
        }
    } catch (error) {
        console.log(error?.message)
    }
}

const background_mail_service2 = async (req, appointment) => {
    try {
        const patientInfo = await Patient.findById(appointment.patient)
        const doctorInfo = await Doctor.findById(req?.body?.doctor || appointment?.doctor)
        if(req.body?.doctor){
            let text1 = 'New appointment appointed by admin, Here is your appointment details'
            let email_content1 = mail_template.doctor_appointment(doctorInfo, appointment, patientInfo, text1)
            const isSend1 = await sendEmail(doctorInfo.email, 'New appointment appointed', email_content1);
            console.log("doctor", isSend1)
        }

        var text = 'Your appointment status updated, Here is your appointment details'
        let email_content = mail_template.doctor_appointment(patientInfo, appointment, doctorInfo, text)
        const isSend = await sendEmail(patientInfo.email, `Status updated ${appointment?.ref}`, email_content);
        console.log("patient", isSend)
    } catch (error) {
        console.log(error?.message)
    }
}

class AppointmentController {
    constructor() { }

    async newAppointment(req, res) {
        try {
            if (req.query?.req_from === 'user') {
                req.body.patient = req.user._id
            }
            if (!_.has(req.body, 'reason')) {
                return res.status(400).send({ success: false, message: "reason required" });
            }
            req.body.ref = await returnRef()
            const newAppointment = await Appointment.create(req.body)
            if (_.isEmpty(newAppointment) || !newAppointment._id) {
                return res.status(400).send({ success: false, message: "appointment not created" });
            } else {
                await AppointmentHistory.create({
                    appointment: newAppointment._id,
                    remarks: newAppointment.reason,
                    status: newAppointment.status
                })
                // Email releated conditions
                background_mail_service(req, newAppointment)
                return res.status(200).send({ success: true, message: "appointment created", data: newAppointment });
            }
        } catch (error) {
            return res.status(500).send({ success: false, message: error?.message });
        }
    }

    async appointment_list(req, res) {
        try {
            const appointments = await appointment_repo.list(req)
            if (_.isEmpty(appointments) || !appointments.docs || appointments?.docs.length === 0) {
                res.send({ success: false, message: 'appointments not found', data: [] });
            } else {
                res.send({ success: true, message: 'appointments found', data: appointments });
            }
        } catch (e) {
            res.status(500).send({ success: false, message: e.message });
        }
    }

    async appointment_details(req, res) {
        try {
            const appointment = await appointment_repo.getDetails(req.params.id)
            if (_.isEmpty(appointment) || !appointment._id) {
                res.send({ success: false, message: 'appointment not found', data: [] });
            } else {
                res.send({ success: true, message: 'appointment found', data: appointment });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    }

    async appointment_update(req, res) {
        try {
            const appointment = await appointment_repo.updateOne({ _id: req.params.id }, req.body)
            if (_.isEmpty(appointment) || !appointment._id) {
                res.status(400).send({ success: false, message: "Can not update appointment" })
            } else {
                if (req.body?.status && req.body.status !== '') (
                    await AppointmentHistory.create({
                        appointment: appointment._id,
                        remarks: req.body.remarks || '',
                        status: req.body.status
                    })
                )
                background_mail_service2(req, appointment)
                res.status(200).send({ success: true, message: 'Appointment updated successfully', data: appointment });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new AppointmentController();