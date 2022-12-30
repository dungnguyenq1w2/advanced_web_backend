const db = require('#common/database/index.js')

// Create main Model
const User = db.User
const Question = db.Question
const Answer = db.Answer

// Main work

const getAllQuestions = async (req, res) => {
    try {
        const presentationId = parseInt(req.query?.presentationId)
        const presentationGroupId = parseInt(req.query?.presentationGroupId)

        if (!presentationId) return res.status(400).json({ message: 'Invalid presentation id' })

        const questions = await Question.findAll({
            attributes: ['id', 'content', 'vote', 'is_marked', 'created_at'],
            where: {
                presentation_id: presentationId,
                presentation_group_id: presentationGroupId ? presentationGroupId : null,
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
                    attributes: ['id', 'content', 'created_at'],
                    include: {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'image'],
                    },
                },
            ],
        })
        return res.status(200).json({ data: questions })
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
module.exports = {
    getAllQuestions,
    addQuestion,
}
