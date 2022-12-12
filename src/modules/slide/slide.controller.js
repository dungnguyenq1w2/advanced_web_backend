const db = require('#common/database/index.js')
const sequelize = require('sequelize')

// Create main Model
const Slide = db.Slide
const Choice = db.Choice
const User_Choice = db.User_Choice

// Main work

const getAllSlides = async (req, res) => {
    try {
        const presentationId = parseInt(req.body.presentationId)

        const slides = await Slide.findAll({
            where: {
                presentation_id: presentationId,
            },
        })

        return res.status(200).json({ data: slides })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getSlideById = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)

        const slide = await Slide.findByPk(slideId)

        return res.status(200).json({ data: slide })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getSlideResultForHost = async (req, res) => {
    try {
        const slideId = req.params.slideId

        const slideResult = await Slide.findByPk(slideId, {
            include: {
                model: Choice,
                as: 'choices',
                // attributes: [[sequelize.fn('COUNT', sequelize.col('choice_id')), 'n_choices']],
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM user_choice
                                WHERE
                                    user_choice.choice_id = choices.id
                            )`),
                            'n_choices',
                        ],
                    ],
                },
                // include: {
                //     model: User_Choice.count(),
                //     as: 'user_choices',
                // },
            },
        })
        return res.status(200).json({ data: slideResult })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getSlideResultForGuest = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)
        const guestId = req.query.guestId

        if (!(slideId && guestId)) return res.status(400)

        const slideResult = await Slide.findByPk(slideId, {
            include: {
                model: Choice,
                as: 'choices',
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM user_choice
                                WHERE
                                    user_choice.choice_id = choices.id
                            )`),
                            'n_choices',
                        ],
                    ],
                },
                include: {
                    model: User_Choice,
                    as: 'user_choices',
                    required: false,
                    where: {
                        guest_id: guestId,
                    },
                },
            },
        })
        slideResult.dataValues['isChosen'] = slideResult.dataValues.choices.find(
            (e) => e.user_choices.length === 1
        )
            ? true
            : false
        return res.status(200).json({ data: slideResult })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
module.exports = {
    getAllSlides,
    getSlideById,
    getSlideResultForHost,
    getSlideResultForGuest,
}
