const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const Slide = db.Slide
const User = db.User
const Choice = db.Choice
const User_Choice = db.User_Choice

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

const checkCode = async (req, res) => {
    try {
        const {code} = req.body
        const presentation = await Presentation.findOne({ where: { code: code } })
        if(presentation)
        return res.status(200).json({ data: presentation })
        return res.status(403).json({ data: {status: false} })
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const deletePresentationById = async (req, res) => {
    try {
        const presentationId = parseInt(req.params.presentationId)
        const presentation = await Presentation.findByPk(presentationId, {
            attributes: ['id'],
            include: {
                model: Slide,
                as: 'slides',
                attributes: ['id', 'presentation_id'],
                raw: true,
                include: {
                    model: Choice,
                    as: 'choices',
                    attributes: ['id', 'slide_id'],
                    raw: true,
                },
            },
        })

        if (presentation && presentation.slides != null) {
            for (let slide of presentation.slides) {
                if (slide.choices != null)
                    for (let choice of slide.choices)
                        await User_Choice.destroy({
                            where: {
                                choice_id: choice.id,
                            },
                        })

                await Choice.destroy({
                    where: {
                        slide_id: slide.id,
                    },
                })
            }

            await Slide.destroy({
                where: {
                    presentation_id: presentation.id,
                },
            })
        }

        if (presentation) {
            await Presentation.destroy({
                where: {
                    id: presentation.id,
                },
            })
            return res.status(200).json( { data: {status: true} })
        } else return res.status(403).json({ data: {status: false }})
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

module.exports = {
    getAllPresentaionOfOneUser,
    getAllSlides,
    deletePresentationById,
    checkCode,
}
