const Appointment = require("../modals/appointment");
const Doctor = require("../modals/doctor");
const _ = require("underscore")

const getDateRangeAndGroupBy = (filterType) => {
    const now = new Date();
    let startDate, groupBy;
  
    switch (filterType) {
      case 'day':
        startDate = new Date();
        startDate.setDate(now.getDate() - 10); // Past 10 days
        groupBy = { $dayOfMonth: '$date' }; // Group by day of month
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7 * 10); // Past 10 weeks
        groupBy = { $week: '$date' }; // Group by week
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 12); // Past 12 months
        groupBy = { $month: '$date' }; // Group by month
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 10); // Past 10 years
        groupBy = { $year: '$date' }; // Group by year
        break;
      default:
        throw new Error('Invalid filter type');
    }
  
    return { startDate, endDate: now, groupBy };
};

const admin_repo = {
    getOverview: async (req) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const active_doctor = await Doctor.countDocuments({
                status: "approved",
            })
            const total_appointments_today = await Appointment.countDocuments({
                from: { $gte: today, $lt: tomorrow },
            })
            const total_appointments = await Appointment.countDocuments()
            const total_completed_appointment = await Appointment.countDocuments({
                status: "completed",
            })

            const data = {
                active_doctor,
                total_appointments_today,
                total_appointments,
                total_completed_appointment,
            }

            return data


            // const aggregationPipeline = [
            //     {
            //         $facet: {
            //             totalAppointmentsToday: [
            //                 {
            //                     $match: {
            //                         from: { $gte: today, $lt: tomorrow }
            //                     }
            //                 },
            //                 { $count: "count" }
            //             ],
            //             totalAppointmentsOverall: [
            //                 { $count: "count" }
            //             ],
            //             totalAppointmentsCompleted: [
            //                 {
            //                     $match: { status: "completed" }
            //                 },
            //                 { $count: "count" }
            //             ],
            //             totalActiveDoctors: [
            //                 {
            //                     $lookup: {
            //                         from: "doctors",
            //                         localField: "doctor",
            //                         foreignField: "_id",
            //                         as: "doctorDetails"
            //                     }
            //                 },
            //                 { $unwind: "$doctorDetails" },
            //                 {
            //                     $match: { "doctorDetails.status": "approved" }
            //                 },
            //                 { $group: { _id: null, count: { $sum: 1 } } }
            //             ]
            //         }
            //     },
            //     {
            //         $project: {
            //             today_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsToday.count", 0] }, 0] },
            //             total_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsOverall.count", 0] }, 0] },
            //             total_complete_appointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointmentsCompleted.count", 0] }, 0] },
            //             total_doctors: { $ifNull: [{ $arrayElemAt: ["$totalDoctors.count", 0] }, 0] },
            //             total_active_doctors: { $ifNull: [{ $arrayElemAt: ["$totalActiveDoctors.count", 0] }, 0] },
            //         }
            //     }
            // ];

            // const [overview] = await Appointment.aggregate(aggregationPipeline);
            // return overview;
            
        } catch (error) {
            throw error;
        }
    },
    department_analytics: async (req) => {
        try {
            var conditions = {}
            var and_clauses = []
            and_clauses.push({})

            if (_.has(req.body, 'day_count') && req.body.day_count !== '') {
                const days = new Date();
                days.setDate(days.getDate() - req.body.day_count);
                and_clauses.push({ 'createdAt': { $gte: days } });
            }

            conditions['$and'] = and_clauses;

            const topDepartments = await Appointment.aggregate([
                {
                    $match: conditions
                },
                {
                    $group: {
                        _id: '$department', // Group by department
                        totalAppointments: { $sum: 1 } // Count total appointments
                    }
                },
                {
                    $sort: { totalAppointments: -1 } // Sort by total appointments in descending order
                },
                {
                    $limit: 4
                },
                {
                    $lookup: {
                        from: 'departments',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'departmentInfo'
                    }
                },
                {
                    $unwind: '$departmentInfo'
                },
                {
                    $project: {
                        name: '$departmentInfo.title',
                        totalAppointments: 1
                    }
                }
            ]);

            return topDepartments;

        } catch (error) {
            throw error;
        }
    },
    test: async (req) => {
        try {
            var conditions = {}
            var and_clauses = []
        } catch (error) {
            throw error;
        }
    },
    patient_analytics: async (req) => {
        try {
            // var conditions = {}
            // var and_clauses = []

            // const { startDate, endDate, groupBy } = getDateRangeAndGroupBy(req.body?.filter || 'day');
            // and_clauses.push({ 'createdAt': { $gte: startDate, $lte: endDate } });
            // and_clauses.push({ 'status': {$in: ['completed', 'admitted']}})

            // conditions['$and'] = and_clauses;

            // const patientAnalytics = await Appointment.aggregate([
            //     {
            //       $match: conditions
            //     },
            //     {
            //       $group: {
            //         _id: groupBy, // Group by day/week/month/year
            //         admittedPatients: {
            //           $sum: {
            //             $cond: [{ $eq: ['$status', 'admitted'] }, 1, 0] // Count admitted patients
            //           }
            //         },
            //         recoveredPatients: {
            //           $sum: {
            //             $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] // Count recovered patients
            //           }
            //         }
            //       }
            //     },
            //     {
            //       $sort: { _id: 1 }
            //     }
            //   ]);
          
            //   // Format data to match chart structure
            //   const chartData = patientAnalytics.map((item) => ({
            //     name: item._id.toString(), 
            //     admitted: item.admittedPatients,
            //     recovered: item.recoveredPatients, 
            //   }));

            //   return chartData

            const data = [];

            for (let i = 0; i < 10; i++) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - i);
            
                const endDate = new Date();
                endDate.setDate(endDate.getDate() - (i + 1));

                const admitted = await Appointment.countDocuments({
                    updatedAt: { $gte: endDate, $lte: startDate },
                    status: 'admitted',
                });
                const completed = await Appointment.countDocuments({
                    updatedAt: { $gte: endDate, $lte: startDate },
                    status: 'completed',
                });

                data.push({
                    day: `Day ${i + 1}`,
                    Admitted: admitted,
                    Recovered: completed
                });
            }

            return data

        } catch (error) {
            throw error;
        }
    },
    appointment_analytics: async (req) => {
        try {
            // var conditions = {}
            // var and_clauses = []

            // const { startDate, endDate, groupBy } = getDateRangeAndGroupBy(req.body?.filter || 'day');
            // and_clauses.push({ 'createdAt': { $gte: startDate, $lte: endDate } });

            // conditions['$and'] = and_clauses;

            const data = [];

            for (let i = 0; i < 10; i++) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - i);
            
                const endDate = new Date();
                endDate.setDate(endDate.getDate() - (i + 1));
                const count = await Appointment.countDocuments({
                    createdAt: { $gte: endDate, $lte: startDate },
                });

                data.push({
                    day: `Day ${i + 1}`,
                    count
                });
            }
            
            return data

            // const appointmentAnalytics = await Appointment.aggregate([
            //     {
            //       $match: conditions
            //     },
            //     {
            //       $group: {
            //         _id: groupBy,
            //         totalAppointments: { $sum: 1 }
            //       }
            //     },
            //     {
            //       $sort: { _id: 1 }
            //     }
            //   ]);
            //   console.log(appointmentAnalytics)
            //   const chartData = appointmentAnalytics.map((item) => ({
            //     name: item._id?.toString(),
            //     appointment: item.totalAppointments,
            //   }));
            //   return chartData
        } catch (error) {
            throw error;
        }
    },
}

module.exports = admin_repo;