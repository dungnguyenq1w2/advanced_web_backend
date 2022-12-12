const Router = require('express')
const choiceController = require('./choice.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.post('/', choiceController.getAllChoices)

router.get('/:choiceId', choiceController.getChoiceById)

module.exports = router
