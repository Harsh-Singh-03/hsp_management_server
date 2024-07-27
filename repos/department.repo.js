const Department = require("../modals/department")

const department_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            
            if(_.has(req.body, 'search') && req.body.search !== "" ){
                and_clauses.push({
                    $or: [
                        {title: {$regex: req.body.search, $options: 'i'}},
                    ]
                })
            }

            // console.log(and_clauses)
            if(and_clauses.length > 0) {
                conditions['$and'] = and_clauses;
            }

            const pipline = await Department.aggregate([
                {$match: conditions},
                {
                    $group: {
                        _id: "$_id",
                        title: { $first: "$title" },
                        description: { $first: "$description" },
                        createdAt: { $first: "$createdAt" },
                    }
                },
                {$sort: {createdAt: -1}}
            ])

            if(!pipline){
                return null
            }

            var options = {
                page: req.body?.page || 1,
                limit: req.body?.limit || 20
            };
            
            return pipline

        } catch (error) {
            return null
        }
    },
    update: async (field, data) => {
        try {
            const updateDepartment = await Department.findOneAndUpdate(field, data, {$new: true})
            return updateDepartment || null
        } catch (error) {
            return null
        }
    },
}

module.exports = department_repo;