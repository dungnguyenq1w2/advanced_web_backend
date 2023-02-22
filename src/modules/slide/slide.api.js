const Router = require('express')
const slideController = require('./slide.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.post('/', authMiddleware.authenticateToken, slideController.getAllSlides)

router.post('/first-slide', authMiddleware.authenticateToken, slideController.getFirstSlide)

router.get('/:slideId', authMiddleware.authenticateToken, slideController.getSlideById)

router.post('/add', authMiddleware.authenticateToken, slideController.addSlide)

router.put('/:slideId', authMiddleware.authenticateToken, slideController.updateSlide)

router.delete('/:slideId', authMiddleware.authenticateToken, slideController.deleteSlide)

router.get(
    '/:slideId/host',
    authMiddleware.authenticateToken,
    slideController.getSlideResultForHost
)
router.get(
    '/:slideId/host1',
    authMiddleware.authenticateToken,
    slideController.getSlideResultForHost
)

router.get('/:slideId/guest', slideController.getSlideResultForGuest)

module.exports = router
