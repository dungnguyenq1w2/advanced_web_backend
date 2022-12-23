const Router = require('express')
const notificationController = require('./notification.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', authMiddleware.authenticateToken, notificationController.getAllNotifications)

router.post('/', notificationController.addNotification)

module.exports = router
