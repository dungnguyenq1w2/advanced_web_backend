const Router = require('express')
const messageController = require('./message.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', messageController.getAllMessages)
router.post('/', authMiddleware.authenticateToken, messageController.addMessage)

module.exports = router
