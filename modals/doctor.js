const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'name required'], trim: true },
    profile_image: { type: String , trim: true },
    email: { type: String, required: [true, 'email required'], unique: true },
    password: { type: String, required: [true, 'password required'] },
    phone: { type: String, required: [true, 'phone required'], unique: true },
    forget_pass_token: { type: String, default: null },
    specialization: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
        required: [true, 'specialization required'] 
    },
    departments: { 
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Department',
        index: true,
        default: []
    },
    experience: { type: Number, required: [true, 'experience required'] },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    work_status: {
        type: String,
        enum: ['available', 'not_available'],
        default: 'available'
    },
}, { timestamps: true, versionKey: false });

DoctorSchema.plugin(mongooseAggregatePaginate);

const Doctor = mongoose.model('Doctor', DoctorSchema);
module.exports = Doctor;
