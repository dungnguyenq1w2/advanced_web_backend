const Router = require('express')
const messageController = require('./message.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', messageController.getAllMessagesOfPage)
router.get('/totalMessage', messageController.getTotalMessage)
router.post('/', 
//authMiddleware.authenticateToken,
 messageController.addMessage)

module.exports = router
