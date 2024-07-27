const Department = require("../modals/department");
const department_repo = require("../repos/department.repo");
_ = require("underscore")

class department_controller {
    constructor () {}

    async create (req, res) {
        try {
            if(!req.body.title) {
                return res.status(400).send({success: false, message: 'title required', data: {}});
            }
            const department = await Department.create(req.body)
            if(_.isEmpty(department) || !department._id){
                return res.status(400).send({success: false, message: 'department not created', data: {}});
            }else{
                return res.status(200).send({success: true, message: 'department created', data: department});
            }
        } catch (error) {
            return res.status(500).send({success: false, message: error.message || 'server error'});
        }
    }

    async list (req, res) {
        try {
            const departments = await department_repo.list(req)
            if(_.isEmpty(departments) || !departments || departments.length === 0) {
                res.send({success: false, message: 'departments not found', data: []});
            }else{
                res.send({success: true, message: 'departments not found', data: departments});
            }
        } catch (error) {
            return res.status(500).send({success: false, message: error.message || 'server error'});
        }
    }

    async update (req, res) {
        try {
            const department = await department_repo.update({_id: req.params.id}, req.body)
            if(_.isEmpty(department) || !department._id){
                return res.status(400).send({success: false, message: 'department not updated', data: {}});
            }else{
                return res.status(200).send({success: true, message: 'department updated', data: department});
            }
        } catch (error) {
            res.send({success: false, message: error.message || 'server error'});
        }
    }

    async delete (req, res) {
        try {
            const department = await Department.findByIdAndDelete(req.params.id);
            if(_.isEmpty(department) || !department._id){
                return res.status(400).send({success: false, message: 'department not deleted', data: {}});
            }else{
                return res.status(200).send({success: true, message: 'department deleted', data: department});
            }
        } catch (error) {
            return res.status(500).send({success: false, message: error.message || 'server error'});
        }
    }
}

module.exports = new department_controller()