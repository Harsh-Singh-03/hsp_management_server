const { default: mongoose } = require("mongoose");
const Doc_Review = require("../modals/doctor-reviews");

const review_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            const doctorId = req.body.doctor || req.user._id
            and_clauses.push({ doctor: new mongoose.Types.ObjectId(doctorId) });

            if (_.has(req.body, 'search') && req.body.search !== "") {
                and_clauses.push({
                    $or: [
                        { patient_name: { $regex: req.body.search, $options: 'i' } },
                    ]
                })
            }

            conditions['$and'] = and_clauses;

            const pipeline = Doc_Review.aggregate([
                {
                    $lookup: {
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
                    }
                },
                { $unwind: '$patientDetails' },
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
                },
                { $match: conditions },
                { $sort: { createdAt: -1 } }
            ])

            const options = { page: req.body?.page || 1, limit: req.body?.limit || 15 }
            const review_list = await Doc_Review.aggregatePaginate(pipeline, options)
            return review_list
        } catch (e) {
            throw e
        }
    }
}

module.exports = review_repo