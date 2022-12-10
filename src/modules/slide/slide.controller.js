const db = require('#common/database/index.js')
const sequelize = require('sequelize')

// Create main Model
const Slide = db.Slide
const Choice = db.Choice
const User_Choice = db.User_Choice

// Main work

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
        res.status(200).json({ data: slideResult })
    } catch (error) {
        console.log('🚀 ~ error', error)
    }
}

const getSlideResultForGuest = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)
        const guestId = req.body.guestId

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
                        user_id: guestId,
                    },
                },
            },
        })
        res.status(200).json({ data: slideResult })
    } catch (error) {
        console.log('🚀 ~ error', error)
    }
}
module.exports = { getSlideResultForHost, getSlideResultForGuest }
