const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const department_schema = new Schema({
    title: { type: String, index: true, trim: true, required: [true, 'title required']},
    description: { type: String, index: true, trim: true }
}, { timestamps: true, versionKey: false });

department_schema.plugin(mongooseAggregatePaginate);

const Department = mongoose.model('Department', department_schema);

module.exports = Department;