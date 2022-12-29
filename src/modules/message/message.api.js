const Router = require('express')
const messageController = require('./message.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', authMiddleware.authenticateToken, messageController.getAllMessages)

module.exports = router
