const db = require('#common/database/index.js')
const { Op } = require('sequelize')

// Create main Model
const User = db.User
const Question = db.Question
const Answer = db.Answer

// Main work

const LIMIT = 10

const getPagingData = (data, page) => {
    const { count: totalItems, rows: questions } = data
    const currentPage = page ? +page : 0
    const totalPages = Math.ceil(totalItems / LIMIT)
    const nextPage = currentPage < totalPages ? currentPage + 1 : null

    return { data: questions, pagination: { totalItems, totalPages, currentPage, nextPage } }
}

const getAllQuestions = async (req, res) => {
    try {
        const presentationId = parseInt(req.query?.presentationId)
        const filter = req.query?.filter
        // console.log('🚀 ~ filter', filter)

        const page = req.query?.page || 1
        const offset = (page - 1) * LIMIT

        if (!presentationId) return res.status(400).json({ message: 'Invalid presentation id' })

        const data = await Question.findAndCountAll({
            attributes: ['id', 'content', 'vote', 'is_marked', 'user_id', 'created_at'],
            where: {
                presentation_id: presentationId,
                is_marked:
                    filter === 'all'
                        ? {
                              [Op.ne]: null,
                          }
                        : filter === 'answered'
                        ? {
                              [Op.eq]: true,
                          }
                        : {
                              [Op.eq]: false,
                          },
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'image'],
                },
                {
                    model: Answer,
                    as: 'answers',
                    include: {
                        model: User,
                        attributes: ['id', 'content', 'created_at'],
                        as: 'user',
                        attributes: ['id', 'name', 'image'],
                    },
                },
            ],
            offset: offset,
            limit: LIMIT,
            order: [['created_at', 'DESC']],
        })

        const result = getPagingData(data, page)
        return res.status(200).json(result)
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addQuestion = async (req, res) => {
    try {
        const userId = parseInt(req.user.id)

        const newQuestion = { ...req.body, user_id: userId }

        const result = await Question.create(newQuestion)
        if (result) {
            return res.status(201).json({ data: result })
        }
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const postVote = async (req, res) => {
    try {
        const questionId = parseInt(req.params.id)
        if (!questionId) return res.status(400).json({ message: 'Invalid question id' })

        const updateVote = await Question.increment('vote', { where: { id: questionId } })

        if (updateVote) return res.status(200).json({ data: { status: true } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const markQuestion = async (req, res) => {
    try {
        const questionId = parseInt(req.params.id)
        if (!questionId) return res.status(400).json({ message: 'Invalid question id' })

        await Question.update({ is_marked: true }, { where: { id: questionId } })

        return res.status(204)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getAllQuestions,
    addQuestion,
    postVote,
    markQuestion,
}
