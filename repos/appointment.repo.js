const { default: mongoose } = require("mongoose");
const Appointment = require("../modals/appointment");


const appointment_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push({})

            if (_.has(req.body, 'search') && req.body.search !== "") {
                and_clauses.push({
                    $or: [
                        { ref: { $regex: req.body.search, $options: 'i' } },
                    ]
                })
            }

            if (_.has(req.body, 'status') && req.body.status !== "") {
                and_clauses.push({ status: req.body.status })
            }

            if(_.has(req.body, 'doctor_id') && req.body.doctor_id !== "") {
                and_clauses.push({ doctor: new mongoose.Types.ObjectId(req.body.doctor_id) })
            } 
            if(_.has(req.body, 'patient_id') && req.body.patient_id !== "") {
                and_clauses.push({ patient: new mongoose.Types.ObjectId(req.body.patient_id) })
            } 

            conditions['$and'] = and_clauses

            const appointments = Appointment.aggregate([
                {$match: conditions},
                {
                    $lookup: {
                        from: "departments",
                        localField: "department",
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
                {$unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true
                }},
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctor",
                        pipeline: [
                            {
                                $group: {
                                     _id: "$_id",
                                     name: { $first: "$name" },
                                     phone: { $first: "$phone" },
                                     profile_image: { $first: "$profile_image" },
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "doctor"
                    }
                },
                {$unwind: {
                    path: "$doctor",
                    preserveNullAndEmptyArrays: true
                }},
                {
                    $lookup: {
                        from: "patients",
                        localField: "patient",
                        pipeline: [
                            {
                                $group: {
                                     _id: "$_id",
                                     name: { $first: "$name" },
                                     phone: { $first: "$phone" },
                                     profile_image: { $first: "$profile_image" },
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "patient"
                    }
                },
                {$unwind: '$patient'},
                {
                    $group: {
                        _id: "$_id",
                        ref: { $first: "$ref" },
                        status: { $first: "$status" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        department: { $first: "$department.title" },
                        departmentId: { $first: "$department._id" },
                        doctor: { $first: "$doctor" },
                        patient: { $first: "$patient" },
                        from: { $first: "$from" },
                        to: { $first: "$to" },
                        reason: { $first: "$reason" },
                    }
                },
                {$sort: {updatedAt: -1}}
            ])

            var options = {
                page: req.body?.page || 1,
                limit: req.body?.limit || 20
            };

            const data = await Appointment.aggregatePaginate(appointments, options)
            return data
        } catch (e) {
            throw e;
        }
    },
    getDetails: async (id) => {
        try {
            const data = await Appointment.aggregate([
                {$match: {
                    _id: new mongoose.Types.ObjectId(id)
                }},
                {
                    $lookup: {
                        from: "departments",
                        localField: "department",
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
                    $unwind: {
                        path: "$department",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'doc_reviews',
                        let: {doctorId: '$doctor', patientId: '$patient'},
                        pipeline: [
                            {$match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$doctor", "$$doctorId" ]},
                                        {$eq: ["$patient", "$$patientId" ]},
                                    ]
                                }
                            }},
                            {
                                $group: {
                                     _id: "$_id",
                                    rating: { $first: "$rating" },
                                    review: { $first: "$review" },
                                    createdAt: { $first: "$createdAt" },   
                                }
                            }
                        ],
                        as: "review"
                    }
                },  
                {$unwind: {
                    path: "$review",
                    preserveNullAndEmptyArrays: true
                }},
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctor",
                        pipeline: [
                            {
                                $group: {
                                    _id: "$_id",
                                    name: { $first: "$name" },
                                    phone: { $first: "$phone" },
                                    avg_rating: { $first: '$avg_rating' },
                                    total_rating: { $first: '$total_rating'},
                                    profile_image: { $first: "$profile_image" },
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "doctor"
                    }
                },
                {
                    $unwind: {
                        path: "$doctor",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "patients",
                        localField: "patient",
                        pipeline: [
                            {
                                $group: {
                                     _id: "$_id",
                                     name: { $first: "$name" },
                                     phone: { $first: "$phone" },
                                     profile_image: { $first: "$profile_image" },
                                }
                            }
                        ],
                        foreignField: "_id",
                        as: "patient"
                    }
                },
                {
                    $unwind: '$patient'
                },
                {
                    $lookup: {
                        from: "appointmenthistories",
                        localField: "_id",
                        pipeline: [
                            {
                                $group: {
                                    _id: "$_id",
                                    status: {$first: "$status"},
                                    remarks: {$first: "$remarks"},
                                    createdAt: {$first: "$createdAt"}
                                }
                            }
                        ],
                        foreignField: "appointment",
                        as: "logs"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        ref: { $first: "$ref" },
                        current_status: { $first: "$status" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        department: { $first: "$department.title" },
                        departmentId: { $first: "$department._id" },
                        doctor: { $first: "$doctor" },
                        patient: { $first: "$patient" },
                        review: {$first: "$review" },
                        from: { $first: "$from" },
                        to: { $first: "$to" },
                        reason: { $first: "$reason" },
                        logs: { $first: "$logs" },
                    }
                }
            ])

            return data[0];
        } catch (error) {
            throw error;
        }
    },
    updateOne: async (field, value) => {
        try {
            const updateAppointment = await Appointment.findOneAndUpdate(field, value, { new: true, upsert: true }).exec()
            return updateAppointment;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = appointment_repo;