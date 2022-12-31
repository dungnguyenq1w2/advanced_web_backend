const db = require('#common/database/index.js')

const Message = db.Message

const joinMessageRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (presentationId, presentationGroupId = null) {
        try {
            const room = `message-${presentationId}-${presentationGroupId}`
            // console.log('[socket]', 'join room :', room)
            socket.join(room)
            // socket.to(room).emit('user joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const leaveMessageRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', async function (presentationId, presentationGroupId = null) {
        try {
            const room = `message-${presentationId}-${presentationGroupId}`
            // console.log('[socket]', 'leave room :', room)
            socket.leave(room)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const control = (io, socket) => {
    socket.on(
        'client-send-message',
        async (presentationId, presentationGroupId = null, message) => {
            io.of('/message')
                .to(`message-${presentationId}-${presentationGroupId}`)
                .emit('server-send-message', message)

            const newMessage = {
                content: message.content,
                presentation_id: presentationId,
                presentation_group_id: presentationGroupId,
                user_id: message.user.id,
            }

            await Message.create(newMessage)
        }
    )
}

module.exports = { joinMessageRoom, leaveMessageRoom, control }
