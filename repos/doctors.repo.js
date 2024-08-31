const { default: mongoose } = require("mongoose");
const Doctor = require("../modals/doctor");
const Appointment = require("../modals/appointment");


const doctors_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];

            if (!_.has(req.body, 'isArchived') && !req.body.isArchived) {
                and_clauses.push({ isDeleted: { $ne: true } })
            }

            if (_.has(req.body, 'search') && req.body.search !== "") {
                and_clauses.push({
                    $or: [
                        { name: { $regex: req.body.search, $options: 'i' } },
                        { email: { $regex: req.body.search, $options: 'i' } },
                        { phone: { $regex: req.body.search, $options: 'i' } },
                    ]
                })
            }

            if (_.has(req.body, 'status') && req.body.status !== '') {
                and_clauses.push({
                    status: req.body.status
                })
            }

            if (_.has(req.body, 'work_status') && req.body.work_status !== '') {
                and_clauses.push({
                    work_status: req.body.work_status
                })
            }

            conditions['$and'] = and_clauses

            const pipline = Doctor.aggregate([
                {
                    $match: conditions.$and.length === 0 ? {} : conditions
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "departments",
                        pipeline: [
                            {
                                $group: {
                                    _id: "$_id",
                                    title: { $first: "$title" }
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "department"
                    }
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "specialization",
                        pipeline: [
                            {
                                $group: {
                                    _id: "$_id",
                                    title: { $first: "$title" }
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "specialization"
                    }
                },
                {
                    $unwind: { path: '$specialization', preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        email: { $first: "$email" },
                        phone: { $first: "$phone" },
                        status: { $first: "$status" },
                        work_status: { $first: "$work_status" },
                        createdAt: { $first: "$createdAt" },
                        specialization: { $first: "$specialization" },
                        department: { $first: "$department" },
                        experience: { $first: "$experience" },
                        profile_image: { $first: "$profile_image" }
                    }
                },
                { $sort: { createdAt: -1 } }
            ])

            if (!pipline) {
                return null
            }

            var options = {
                page: req.body?.page || 1,
                limit: req.body?.limit || 10
            };

            const doctors = await Doctor.aggregatePaginate(pipline, options)
            return doctors

        } catch (e) {
            throw e;
        }
    },
    get_analytics: async (req) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.user._id)
            const analytics = await Appointment.aggregate([
                { $match: { doctor: userId } },
                {
                    $group: {
                        _id: "$doctor",
                        total_appointments: { $sum: 1 },
                        pending_appointments: {
                            $sum: {
                                $cond: [
                                    { $in: ["$status", ["requested", "scheduled", "re_scheduled"]] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        completetd_appointments: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                        },
                        total_patient: { $addToSet: "$patient" },
                    },
                },
                {
                    $project: {
                        total_appointments: 1,
                        pending_appointments: 1,
                        completetd_appointments: 1,
                        total_patient: { $size: "$total_patient" },
                    },
                },
            ]);

            return analytics[0]
        } catch (error) {
            throw error;
        }
    }
}

module.exports = doctors_repo;