const Help_Support = require("../modals/support");
const sendEmail = require("../utilities/mail");
const mail_template = require("../utilities/mail-template");
// const mail_template = require("../utilities/mail-template");


class support_controller {
    constructor() { }

    async newRequest(req, res) {
        try {
            const newRequest = await Help_Support.create(req.body)
            if (newRequest && newRequest._id) {
                return res.status(200).send({ success: true, data: newRequest, message: 'Request submitted successfully' });
            } else {
                return res.status(400).send({ success: false, message: 'Failed to submit request' });
            }
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message || 'Server error' });
        }
    };

    async reply(req, res) {
        try {
            const supportInfo = await Help_Support.findById(req.params.id)
            if (supportInfo && supportInfo._id) {
                const obj = { name: supportInfo.name, query: supportInfo.query }
                const mail = mail_template.support(obj, req.body.remarks)
                const isSend = await sendEmail(supportInfo.email, "Reply To Your Query", mail)
                if (isSend) {
                    res.status(200).send({ success: true, message: 'Reply has been sent' });
                } else {
                    res.status(500).send({ success: false, message: 'Failed to send verification email' });
                }
            } else {
                return res.status(400).send({ success: false, message: 'Failed to find request' });
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message || 'Server error' });
        }
    };

    async list(req, res) {
        try {
            var conditions = {}
            var and_clauses = [];
            and_clauses.push({})
            if (req.body.search && req.body.search !== '') {
                and_clauses.push(
                    {
                        $or: [
                            { name: new RegExp(req.body.search?.trim(), 'i') },
                            { phone: new RegExp(req.body.search?.trim(), 'i') },
                            { email: new RegExp(req.body.search?.trim(), 'i') },
                        ]
                    }
                )
            }
            conditions['$and'] = and_clauses
            const request = Help_Support.aggregate([
                { $match: conditions },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        phone: { $first: '$phone' },
                        email: { $first: '$email' },
                        query: { $first: '$query' },
                        createdAt: { $first: '$createdAt' },
                        updatedAt: { $first: '$updatedAt' },
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
            const options = { page: req.body.page || 1, limit: req.body.limit || 20 }
            const req_list = await Help_Support.aggregatePaginate(request, options)
            res.status(200).send({ success: true, message: "Help & Support list fetched", data: req_list })
        } catch (error) {
            res.status(500).send({ success: false, message: error.message || 'Server error' });
        }
    }

}

module.exports = new support_controller();