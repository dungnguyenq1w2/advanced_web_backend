const Router = require('express')
const presentationController = require('./presentation.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get(
    '/:userId',
    authMiddleware.authenticateToken,
    presentationController.getAllPresentaionOfOneUser
)
router.delete(
    '/:presentationId',
    authMiddleware.authenticateToken,
    presentationController.deletePresentationById
)
router.post('/checkCode', presentationController.checkCode)
router.get('/:presentationId/slides', presentationController.getAllSlides)

module.exports = router
