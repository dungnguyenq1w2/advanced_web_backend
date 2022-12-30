const Router = require('express')
const answerController = require('./answer.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.post('/', authMiddleware.authenticateToken, answerController.addAnswer)

module.exports = router
