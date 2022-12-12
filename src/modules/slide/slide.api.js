const Router = require('express')
const slideController = require('./slide.controller.js')
const authMiddleware = require('#common/middlewares/auth.middleware.js')

const router = Router()

router.post('/', slideController.getAllSlides)

router.post('/first-slide', slideController.getFirstSlide)

router.get('/:slideId', slideController.getSlideById)

router.post('/add', slideController.addSlide)

router.put('/:slideId', slideController.updateSlide)

router.delete('/:slideId', slideController.deleteSlide)

router.get('/:slideId/host', slideController.getSlideResultForHost)

router.get('/:slideId/guest', slideController.getSlideResultForGuest)

module.exports = router
