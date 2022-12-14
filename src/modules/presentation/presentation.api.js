const Router = require('express')
const presentationController = require('./presentation.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.get(
    '/',
    authMiddleware.authenticateToken,
    presentationController.getAllPresentaionOfOneUser
)
router.delete(
    '/:presentationId',
    authMiddleware.authenticateToken,
    presentationController.deletePresentationById
)
router.get(
    '/:presentationId',
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
router.post(
    '/createCode/:presentationId',
    authMiddleware.authenticateToken,
    presentationController.createPresentationCode
)

module.exports = router
