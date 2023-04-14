const db = require('#common/database/index.js')
// Create main Model
const Notification = db.Notification

// Main work

const getAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id

        const notifications = await Notification.findAll({
            where: {
                user_id: userId,
            },
            order: [['created_at', 'DESC']],
            limit: 5,
        })

        return res.status(200).json({ data: notifications })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addNotification = async (req, res) => {
    try {
        const addNotification = req.body

        const notification = await Notification.create(addNotification)

        return res.status(201).json({ data: notification })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const readNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.user.id)
        if (!userId) return res.status(400).json({ message: 'Invalid user id' })
        await Notification.update({ is_read: true }, { where: { user_id: userId } })

        return res.status(204)
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
module.exports = { getAllNotifications, addNotification, readNotifications }
