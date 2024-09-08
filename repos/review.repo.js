const { default: mongoose } = require("mongoose");
const Doc_Review = require("../modals/doctor-reviews");

const review_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({doctor: new mongoose.Types.ObjectId(req.body.doctor)});
            conditions['$and'] = and_clauses;

            const pipeline = Doc_Review.aggregate([
                { $match: conditions },
                { $lookup: {
                    from: "patients",
                    localField: "patient",
                    pipeline: [
                        {
                            $group: {
                                _id: "$_id",
                                name: { $first: "$name" },
                                profile_image: { $first: '$profile_image' }, 
                            }
                        }
                    ],
                    foreignField: "_id",
                    as: "patientDetails"
                } },
                {$unwind: '$patientDetails'},
                {
                    $group: {
                        _id: "$_id",
                        patient_name: { $first: "$patientDetails.name" },
                        patient_image: { $first: "$patientDetails.profile_image" },
                        doctor: { $first: "$doctor" },
                        rating: { $first: "$rating" },
                        review: { $first: "$review" },
                        createdAt: { $first: "$createdAt" },
                    }
                }
            ])

            const options = {page: req.body?.page || 1, limit: req.body?.limit || 15}
            const review_list = await Doc_Review.aggregatePaginate(pipeline, options)
            return review_list
        }catch(e) {
            throw e
        }
    }
}

module.exports = review_repo