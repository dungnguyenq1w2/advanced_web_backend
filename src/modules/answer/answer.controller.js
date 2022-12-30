const db = require('#common/database/index.js')

// Create main Model
const User = db.User
const Question = db.Question
const Answer = db.Answer

// Main work
const addAnswer = async (req, res) => {
    try {
        const userId = parseInt(req.user.id)

        const newAnswer = { ...req.body, user_id: userId }

        const result = await Answer.create(newAnswer)
        if (result) {
            return res.status(201).json({ data: result })
        }
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    addAnswer,
}
