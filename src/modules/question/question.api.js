const Router = require('express')
const questionController = require('./question.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', authMiddleware.authenticateToken, questionController.getAllQuestions)

module.exports = router
