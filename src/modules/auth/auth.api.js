const Router = require('express')
const authController = require('./auth.controller.js')
const checkTokenTimeMiddleware = require('#common/middlewares/checkTokenTime.middleware.js')

const router = Router()

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/refresh-token', authController.getNewToken)

router.post('/verify', authController.verify)

router.post('/logout', authController.logout)

router.post('/google-login', authController.googleLogin)

router.post(
    '/reset-password',
    checkTokenTimeMiddleware.checkTokenTime,
    authController.resetPassword
)

router.post('/identify', authController.sendEmailResetPassword)

module.exports = router
