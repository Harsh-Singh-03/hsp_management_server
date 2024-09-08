const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'name required'], trim: true },
    profile_image: { type: String},
    age: { type: Number, required: [true, 'age required'], min: 1, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: [true, 'gender required'] },  
    email: { type: String, required: [true, 'email required'], unique: true },
    password: { type: String, required: [true, 'password required'] },
    forget_pass_token: { type: String, default: null },
    email_verification_token: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, unique: true },
    address: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

patientSchema.plugin(mongooseAggregatePaginate);

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
