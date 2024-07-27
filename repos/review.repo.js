
const review_repo = {
    list: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            
            if(!_.has(req.body, 'isArchived') &&!req.body.isArchived){
                and_clauses.push({isDeleted: {$ne: true}})
            }
        }catch(e) {
            throw e
        }
    }
}

module.exports = review_repo