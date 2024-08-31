const { default: mongoose } = require("mongoose");
const Patient = require("../modals/patient");
const Appointment = require("../modals/appointment");


const patient_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];

            if (_.has(req.body, 'search') && req.body.search !== "") {
                and_clauses.push({
                    $or: [
                        { name: { $regex: req.body.search, $options: 'i' } },
                        { email: { $regex: req.body.search, $options: 'i' } },
                        { phone: { $regex: req.body.search, $options: 'i' } },
                    ]
                })
            }

            if (_.has(req.body, 'isArchived') && req.body.isArchived !== "") {
                and_clauses.push({ isDeleted: true })
            } else {
                and_clauses.push({ isDeleted: { $ne: true } })
            }

            conditions['$and'] = and_clauses

            const pipline = Patient.aggregate([
                {
                    $match: conditions.$and.length === 0 ? {} : conditions
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        email: { $first: "$email" },
                        gender: { $first: "$gender" },
                        age: { $first: "$age" },
                        phone: { $first: "$phone" },
                        createdAt: { $first: "$createdAt" },
                        dateOfBirth: { $first: "$dateOfBirth" },
                        address: { $first: "$address" },
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

            const patients = await Patient.aggregatePaginate(pipline, options)
            return patients

        } catch (e) {
            throw e;
        }
    },
    get_analytics: async (req) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.user._id)
            const analytics = await Appointment.aggregate([
                { $match: { patient: userId } },
                {
                    $lookup: {
                        from: "appointments",
                        let: { patient: userId },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$patient", "$$patient"] },
                                            { $ne: ['$doctor', null] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "doctors",
                                    localField: "doctor",
                                    foreignField: "_id",
                                    as: "doctor"
                                }
                            },
                            { $unwind: '$doctor' },
                            {
                                $group: {
                                    _id: "$_id",
                                    doctor_name: {$first: '$doctor.name'},
                                    doctor_image: {$first: '$doctor.profile_image'},
                                    doctor_phone: {$first: '$doctor.phone'},
                                    doctor_email: {$first: '$doctor.email'},
                                }
                            },
                            { $sort: { from: -1 } },
                            { $limit: 1 },
                        ],
                        as: 'last_appointment'
                    }
                },
                {$unwind: {
                    path: '$last_appointment',
                    preserveNullAndEmptyArrays: true
                }},
                {
                    $group: {
                        _id: "$patient",
                        total_appointments: { $sum: 1 },
                        consultant: { $first: '$last_appointment' },
                        upcoming_appointments: {
                            $sum: {
                                $cond: [
                                    { $gt: ["$from", new Date()] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        last_appointment_date: { $max: "$from" },
                    },
                },

                {
                    $project: {
                        total_appointments: 1,
                        upcoming_appointments: 1,
                        last_appointment_date: 1,
                        consultant: 1,
                    },
                },
            ]);
            return analytics[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = patient_repo;