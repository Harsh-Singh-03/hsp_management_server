const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

let SupportSchema = new mongoose.Schema({
    name: {type: String, trim: true, index: true, required: [true, 'name is required']},
    email: { type: String, required: [true, 'email required'] },
    phone: { type: String, required: [true, 'phone required'] },
    query:{ type: String, required: [true, 'query required']},
  }, {timestamps: true, versionKey: false});

  SupportSchema.plugin(mongooseAggregatePaginate);
  
 const Help_Support = mongoose.model('Help_Support', SupportSchema);

 module.exports = Help_Support;
  