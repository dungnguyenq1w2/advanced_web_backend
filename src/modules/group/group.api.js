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

router.post('/:id/invite-email', authMiddleware.authenticateToken, groupController.joinGroupByEmail)

router.post(
    '/:id/send-email',
    authMiddleware.authenticateToken,
    groupController.sendInvitationByEmail
)

router.put('/:id/promote', authMiddleware.authenticateToken, groupController.promoteParticipant)

router.put('/:id/demote', authMiddleware.authenticateToken, groupController.demoteParticipant)

router.delete('/:id/kick-out', authMiddleware.authenticateToken, groupController.kickOutParticipant)

router.put('/:id/set-owner', authMiddleware.authenticateToken, groupController.setOwner)

module.exports = router
