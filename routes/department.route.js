const express = require('express')
const department = require('../controllers/department')
const checkAuth = require('../utilities/auth')

const router = express.Router()

router.post('/department/create', checkAuth.admin, department.create)

router.post('/department/list', department.list)

router.put('/department/update/:id', checkAuth.admin, department.update)

router.delete('/department/delete/:id', checkAuth.admin, department.delete)

module.exports = router