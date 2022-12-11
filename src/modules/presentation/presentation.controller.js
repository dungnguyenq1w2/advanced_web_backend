const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const User = db.User
const Choice = db.Choice
const User_Choice = db.User_Choice
const Slide = db.Slide

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
module.exports = { getAllPresentaionOfOneUser, deletePresentationById }
