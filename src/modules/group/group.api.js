const Router = require('express')
const groupController = require('./group.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get('/', authMiddleware.authenticateToken, groupController.getAllGroup)

router.get('/:id', authMiddleware.authenticateToken, groupController.getGroup)

router.post('/', authMiddleware.authenticateToken, groupController.addGroup)

router.put('/:id', authMiddleware.authenticateToken, groupController.updateGroup)

router.delete('/:id', authMiddleware.authenticateToken, groupController.deleteGroup)

router.post('/:id/invite', authMiddleware.authenticateToken, groupController.joinGroupByLink)

router.put('/:id/promote', authMiddleware.authenticateToken, groupController.promoteParticipant)

router.put('/:id/demote', authMiddleware.authenticateToken, groupController.demoteParticipant)

router.put('/:id/kick-out', authMiddleware.authenticateToken, groupController.kickOutParticipant)

module.exports = router
