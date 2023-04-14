const Router = require('express')
const notificationController = require('./notification.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', authMiddleware.authenticateToken, notificationController.getAllNotifications)

router.post('/', authMiddleware.authenticateToken, notificationController.addNotification)

router.put('/', authMiddleware.authenticateToken, notificationController.readNotifications)

module.exports = router
