const db = require('#common/database/index.js')
// Create main Model
const User = db.User
const Message = db.Message

// Main work

const getAllMessagesOfPage = async (req, res) => {
    try {
        const { presentationId, presentationGroupId } = req.query
        const page = req.query?.page || 1
        const limit = 10
        const offset = (page - 1) * limit

        if (!presentationId || !presentationGroupId)
            return res.status(400).json({ message: 'Bad request' })

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
            offset: offset,
            limit: limit,
            order: [['created_at', 'DESC']],
        })
        return res.status(200).json({ data: messages })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getTotalMessage = async (req, res) => {
    try {
        const { presentationId, presentationGroupId } = req.query

        if (!presentationId || !presentationGroupId)
            return res.status(400).json({ message: 'Bad request' })

        const total = await Message.count({
            where: {
                presentation_id: presentationId,
                presentation_group_id: presentationGroupId ? presentationGroupId : null,
            },
        })

        return res.status(200).json({ data: total })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addMessage = async (req, res) => {
    try {
        const userId = req.user.id || 1 // Nhớ code xong sửa lại@@
        if (!userId) return res.status(401).json({ message: 'Bad request' })

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
    getAllMessagesOfPage,
    addMessage,
    getTotalMessage,
}
