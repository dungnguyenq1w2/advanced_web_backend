const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const Slide = db.Slide
const User = db.User

// Main work

const getAllPresentaionOfOneUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId)
        const presentations = await Presentation.findAll({
            where: {
                host_id: userId,
            },
        })
        return res.status(200).json({ data: presentations })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getAllSlides = async (req, res) => {
    try {
        const presentationId = parseInt(req.params.presentationId)
        if (!presentationId) return res.status(400)

        const slides = await Presentation.findByPk(presentationId, {
            attributes: ['id', 'host_id', 'code'],
            include: {
                model: Slide,
                as: 'slides',
                attributes: ['id'],
            },
        })

        return res.status(200).json({ data: slides })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { getAllPresentaionOfOneUser, getAllSlides }
