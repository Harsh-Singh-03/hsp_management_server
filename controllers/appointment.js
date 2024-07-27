const Appointment = require("../modals/appointment");
const AppointmentHistory = require("../modals/appointment-history");
const appointment_repo = require("../repos/appointment.repo");
const { returnRef } = require("../utilities");
require('dotenv/config')

class AppointmentController {
    constructor () {}

    async newAppointment (req, res){
        try {
            if(req.query?.req_from === 'user'){
                req.body.patient = req.user._id
            }
            if(!_.has(req.body, 'reason')){
                return res.status(400).send({success: false, message: "reason required"});
            }
            req.body.ref = await returnRef()
            const newAppointment = await Appointment.create(req.body)
            if(_.isEmpty(newAppointment) || !newAppointment._id){
                return res.status(400).send({success: false, message: "appointment not created"});
            }else{
                await AppointmentHistory.create({
                    appointment: newAppointment._id,
                    remarks: newAppointment.reason,
                    status: newAppointment.status
                })
                return res.status(200).send({success: true, message: "appointment created", data: newAppointment});
            }
        } catch (error) {
            return res.status(500).send({success: false, message: error?.message});
        }
    }

    async appointment_list (req, res) {
        try {
            const appointments = await appointment_repo.list(req)
            if(_.isEmpty(appointments) ||!appointments.docs || appointments?.docs.length === 0) {
                res.send({success: false, message: 'appointments not found', data: []});
            }else{
                res.send({success: true, message: 'appointments found', data: appointments});
            }
        } catch (e) {
            res.status(500).send({ success: false, message: e.message });
        }
    }

    async appointment_details(req, res) {
        try {
            const appointment = await appointment_repo.getDetails(req.params.id)
            if(_.isEmpty(appointment) || !appointment._id) {
                res.send({success: false, message: 'appointment not found', data: []});
            }else{
                res.send({success: true, message: 'appointment found', data: appointment});
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    }

    async appointment_update (req, res) {
        try {
            const appointment = await appointment_repo.updateOne({_id: req.params.id}, req.body)
            if(_.isEmpty(appointment) || !appointment._id) {
                res.status(400).send({success: false, message: "Can not update appointment"})
            }else{
                if(req.body?.status && req.body.status !== '')(
                    await AppointmentHistory.create({
                        appointment: appointment._id,
                        remarks: req.body.remarks || '',
                        status: req.body.status
                    })
                )
                res.status(200).send({success: true, message: 'Appointment updated successfully', data: appointment });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new AppointmentController();