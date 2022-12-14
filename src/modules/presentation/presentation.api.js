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
router.get(
    '/presentationId/:presentationId',
    authMiddleware.authenticateToken,
    presentationController.getPresentationById
)
router.post('/checkCode', presentationController.checkCode)
router.get('/:presentationId/slides', presentationController.getAllSlides)
router.post('/add', authMiddleware.authenticateToken, presentationController.addPresentation)
router.put(
    '/updateName',
    authMiddleware.authenticateToken,
    presentationController.updatePresentationName
)

module.exports = router
