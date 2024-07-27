
const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

let appointmentHistorySchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    status: { type: String, required: true, enum: ['requested', 'scheduled', 're_scheduled', "admitted", 'completed', 'cancelled'], default: 'requested' },
    remarks: {
        type: String
    }
}, { timestamps: true, versionKey: false });

appointmentHistorySchema.plugin(mongooseAggregatePaginate);
const AppointmentHistory = mongoose.model('AppointmentHistory', appointmentHistorySchema)
module.exports = AppointmentHistory;
