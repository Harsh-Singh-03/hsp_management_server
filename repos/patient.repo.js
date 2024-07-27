const Patient = require("../modals/patient");


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
            }else{
                and_clauses.push({ isDeleted: {$ne: true} })
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
                {$sort: {createdAt: -1}}
            ])

            if(!pipline){
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
    }
}

module.exports = patient_repo;