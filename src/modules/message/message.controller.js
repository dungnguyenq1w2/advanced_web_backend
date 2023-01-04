const db = require('#common/database/index.js')
// Create main Model
const User = db.User
const Message = db.Message

// Main work

const getAllMessages = async (req, res) => {
    try {
        const presentationId = parseInt(req.query?.presentationId)

        if (!presentationId) return res.status(400).json({ message: 'Invalid presentation id' })

        const messages = await Message.findAll({
            attributes: ['id', 'content', 'created_at', 'user_id'],
            where: {
                presentation_id: presentationId,
            },
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'image'],
            },
        })
        return res.status(200).json({ data: messages })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addMessage = async (req, res) => {
    try {
        const userId = parseInt(req.user.id)

        const newMessage = { ...req.body, user_id: userId }

        const result = await Message.create(newMessage)
        if (result) {
            return res.status(201).json({ data: result })
        }
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getAllMessages,
    addMessage,
}
