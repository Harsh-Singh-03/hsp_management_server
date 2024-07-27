const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'name required'], trim: true },
    profile_image: { type: String , trim: true },
    email: { type: String, required: [true, 'email required'], unique: true },
    password: { type: String, required: [true, 'password required'] },
    phone: { type: String, required: [true, 'phone required'], unique: true },
    role: { type: String, enum: ['manager', 'admin', 'superadmin'], default: 'manager'}
}, { timestamps: true, versionKey: false });

AdminSchema.plugin(mongooseAggregatePaginate);

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
