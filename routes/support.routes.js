const express = require('express')
const support = require('../controllers/support')
const checkAuth = require('../utilities/auth')
const router = express.Router()

router.post('/support/new-req', support.newRequest)
router.post('/support/reply/:id', checkAuth.admin, support.reply)

module.exports = router