
const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

let ReviewsSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 5
    },
    review:{
        type: String
    }
  }, {timestamps: true, versionKey: false});

  ReviewsSchema.plugin(mongooseAggregatePaginate);
  
 const Doc_Review = mongoose.model('Doc_Review', ReviewsSchema);

 module.exports = Doc_Review;
  