
const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

let appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null, index: true },
    ref: { type: String, unique: true, required: true },
    from: { type: Date, default: null, index: true },
    to: { type: Date, default: null, index: true },
    reason: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
    status: { type: String, required: true, enum: ['requested', 'scheduled', 're_scheduled', "admitted", 'completed', 'cancelled'], default: 'requested' },
  }, {timestamps: true, versionKey: false});

  appointmentSchema.plugin(mongooseAggregatePaginate);
  
 const Appointment = mongoose.model('Appointment', appointmentSchema);

 module.exports = Appointment;
  