const Router = require('express')
const userController = require('./user.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', userController.getAllUser)

router.get('/:id', authMiddleware.authenticateToken, userController.getUser)

router.post('/', authMiddleware.authenticateToken, userController.addUser)

router.put('/:id', authMiddleware.authenticateToken, userController.updateUser)

router.delete('/:id', authMiddleware.authenticateToken, userController.deleteUser)

module.exports = router
