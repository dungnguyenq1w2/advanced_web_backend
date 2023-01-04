const db = require('#common/database/index.js')

const Message = db.Message
const Group = db.Group
const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group
const Notification = db.Notification

const joinMessageRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (presentationId) {
        try {
            const room = `message-${presentationId}`
            // console.log('[socket]', 'join room :', room)
            socket.join(room)
            // socket.to(room).emit('user joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
        }
    })
}

const leaveMessageRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', async function (presentationId) {
        try {
            const room = `message-${presentationId}`
            // console.log('[socket]', 'leave room :', room)
            socket.leave(room)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
        }
    })
}

const control = (io, socket) => {
    socket.on('client-send-message', async (presentationId, message) => {
        try {
            if (!presentationId) return
            io.of('/message').to(`message-${presentationId}`).emit('server-send-message', message)

            let noti = null
            const presentation = await Presentation.findByPk(presentationId)
            if (presentation) {
                noti = {
                    content: `${message.user.name} send a new message to ${presentation.name}`,
                    link: `/presentation-slide/${presentationId}`,
                }
            }
            const newNoti = {
                ...noti,
                user_id: message.user.id,
                is_read: false,
                created_at: new Date(),
            }

            io.of('/notification')
                .to(`notification-${presentationId}`)
                .emit('server-send-message-noti', newNoti)

            // await Notification.create(newNoti)

            const newMessage = {
                content: message.content,
                presentation_id: presentationId,
                user_id: message.user.id,
            }

            await Message.create(newMessage)
        } catch (error) {
            console.log('[error]', 'noti message:', error)
        }
    })
}

module.exports = { joinMessageRoom, leaveMessageRoom, control }
