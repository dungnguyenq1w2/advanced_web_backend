const Router = require('express')
const choiceController = require('./choice.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.post('/', choiceController.getAllChoices)

router.get('/:choiceId', choiceController.getChoiceById)

router.post('/add', choiceController.addChoice)

router.put('/:choiceId', choiceController.updateChoice)

router.delete('/:choiceId', choiceController.deleteChoice)

module.exports = router
