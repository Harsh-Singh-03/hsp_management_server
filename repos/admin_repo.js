const Appointment = require("../modals/appointment");
const Doctor = require("../modals/doctor");

const admin_repo = {
    getOverview: async (req) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
        
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
        
            const aggregationPipeline = [
                {
                    $facet: {
                        totalAppointmentsToday: [
                            { 
                                $match: {
                                    from: { $gte: today, $lt: tomorrow }
                                }
                            },
                            { $count: "count" }
                        ],
                        totalAppointmentsOverall: [
                            { $count: "count" }
                        ],
                        totalAppointmentsCompleted: [
                            {
                                $match: { status: "completed" }
                            },
                            { $count: "count" }
                        ],
                        totalDoctors: [
                            {
                                $lookup: {
                                    from: "doctors", // Make sure this matches your doctors collection name
                                    localField: "doctor",
                                    foreignField: "_id",
                                    as: "doctorDetails"
                                }
                            },
                            { $unwind: "$doctorDetails" },
                            { $group: { _id: null, count: { $sum: 1 } } }
                        ],
                        totalActiveDoctors: [
                            {
                                $lookup: {
                                    from: "doctors",
                                    localField: "doctor",
                                    foreignField: "_id",
                                    as: "doctorDetails"
                                }
                            },
                            { $unwind: "$doctorDetails" },
                            {
                                $match: { "doctorDetails.status": "approved" }
                            },
                            { $group: { _id: null, count: { $sum: 1 } } }
                        ]
                    }
                },
                {
                    $project: {
                        today_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsToday.count", 0] }, 0] },
                        total_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsOverall.count", 0] }, 0] },
                        total_complete_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsCompleted.count", 0] }, 0] },
                        total_doctors: { $ifNull: [{ $arrayElemAt: ["$totalDoctors.count", 0] }, 0] },
                        total_active_doctors: { $ifNull: [{ $arrayElemAt: ["$totalActiveDoctors.count", 0] }, 0] },
                    }
                }
            ];
        
            const [overview] = await Appointment.aggregate(aggregationPipeline);
            return overview;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = admin_repo;