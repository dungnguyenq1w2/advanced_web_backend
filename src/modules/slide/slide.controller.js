const db = require('#common/database/index.js')
const sequelize = require('sequelize')
const { QueryTypes } = require('sequelize')

// Create main Model
const User = db.User
const Slide = db.Slide
const Choice = db.Choice
const User_Choice = db.User_Choice
const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group

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

const getFirstSlide = async (req, res) => {
    try {
        const presentationId = parseInt(req.body.presentationId)

        const slide = await Slide.findOne({
            where: {
                presentation_id: presentationId,
            },
            order: [['id', 'ASC']],
        })

        return res.status(200).json({ data: { id: slide.id } })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getLastSlide = async (req, res) => {
    try {
        const presentationId = parseInt(req.body.presentationId)

        const slide = await Slide.findOne({
            where: {
                presentation_id: presentationId,
            },
            order: [['id', 'DESC']],
        })

        return res.status(200).json({ data: { id: slide.id } })
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

const addSlide = async (req, res) => {
    try {
        const newSlide = req.body

        const slide = await Slide.create(newSlide)

        return res.status(200).json({ data: slide })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const updateSlide = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)
        const newSlide = req.body

        const slide = await Slide.update(newSlide, { where: { id: slideId } })

        return res.status(200).json({ data: slide })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const deleteSlide = async (req, res) => {
    try {
        const slideId = req.params.slideId

        await Slide.destroy({ where: { id: slideId } })

        res.status(200).send({ message: `Slide is deleted` })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getSlideResultForHost = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)
        const presentationGroupId = parseInt(req.query?.presentationGroupId)

        if (!slideId) return res.status(400).json({ message: 'Invalid slide id' })
        // let presentation_group = null
        // if (groupId) {
        //     // Phải dùng findAll khi tìm kiếm quan hệ
        //     const presentation = await Presentation.findAll({
        //         where: {
        //             '$slides.id$': slideId,
        //         },
        //         include: [
        //             {
        //                 model: Slide,
        //                 as: 'slides',
        //                 required: true,
        //             },
        //         ],
        //     })

        //     if (presentation[0]) {
        //         presentation_group = await Presentation_Group.findOne({
        //             where: {
        //                 presentation_id: presentation[0].dataValues.id,
        //                 group_id: groupId,
        //             },
        //         })
        //     }
        // }

        const slideResult = await Slide.findByPk(slideId, {
            include: {
                model: Choice,
                as: 'choices',
                // attributes: [[sequelize.fn('COUNT', sequelize.col('choice_id')), 'n_choices']],
                // attributes: {
                //     include: [
                //         [
                //             sequelize.literal(`(
                //                 SELECT COUNT(*)
                //                 FROM user_choice
                //                 WHERE
                //                     user_choice.choice_id = choices.id
                //             )`),
                //             'n_choices',
                //         ],
                //     ],
                // },
                include: {
                    model: User_Choice,
                    as: 'user_choices',
                    attributes: ['id', 'choice_id', 'created_at'],
                    where: {
                        presentation_group_id: presentationGroupId ? presentationGroupId : null,
                    },
                    required: false,
                    include: {
                        model: User,
                        as: 'member',
                        attributes: ['id', 'name', 'image'],
                        required: false,
                    },
                },
            },
        })
        return res.status(200).json({ data: slideResult })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getSlideResultForMember = async (req, res) => {
    try {
        const slideId = parseInt(req.params.slideId)
        const presentationGroupId = parseInt(req.query?.presentationGroupId)
        const memberId = req.query.memberId

        if (!(slideId && memberId))
            return res.status(400).json({ message: 'Invalid slide id or member id' })

        // let presentation_group = null
        // if (groupId) {
        //     // Phải dùng findAll khi tìm kiếm quan hệ
        //     const presentation = await Presentation.findAll({
        //         where: {
        //             '$slides.id$': slideId,
        //         },
        //         include: [
        //             {
        //                 model: Slide,
        //                 as: 'slides',
        //                 required: true,
        //             },
        //         ],
        //     })

        //     if (presentation[0]) {
        //         presentation_group = await Presentation_Group.findOne({
        //             where: {
        //                 presentation_id: presentation[0].dataValues.id,
        //                 group_id: groupId,
        //             },
        //         })
        //     }
        // }
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
                                    user_choice.choice_id = choices.id and
                                    presentation_group_id = ${
                                        presentationGroupId ? presentationGroupId : null
                                    }
                            )`),
                            'n_choices',
                        ],
                    ],
                },
                include: {
                    model: User_Choice,
                    as: 'user_choices',
                    attributes: ['id', 'choice_id'],
                    where: {
                        presentation_group_id: presentationGroupId ? presentationGroupId : null,
                        member_id: memberId,
                    },
                    required: false,
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
    getFirstSlide,
    getLastSlide,
    getSlideById,
    addSlide,
    updateSlide,
    deleteSlide,
    getSlideResultForHost,
    getSlideResultForMember,
}
