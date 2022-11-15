const Router = require('express')
const authController = require('./auth.controller.js')

const router = Router()

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/refresh-token', authController.getNewToken)

router.post('/logout', authController.logout)

module.exports = router
