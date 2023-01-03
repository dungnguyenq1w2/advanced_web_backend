const db = require('#common/database/index.js')

const Message = db.Message
const Group = db.Group
const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group
const Notification = db.Notification

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
        }
    })
}

const control = (io, socket) => {
    socket.on(
        'client-send-message',
        async (presentationId, presentationGroupId = null, message) => {
            try {
                io.of('/message')
                    .to(`message-${presentationId}-${presentationGroupId}`)
                    .emit('server-send-message', message)

                let noti = null
                const presentation = await Presentation.findByPk(presentationId)
                if (presentationGroupId) {
                    const presentationGroup = await Presentation_Group.findByPk(
                        presentationGroupId,
                        {
                            include: { model: Group, as: 'group', attribute: ['id', 'name'] },
                        }
                    )
                    if (presentation && presentationGroup) {
                        noti = {
                            content: `${message.user.name} send a new message to ${presentation.name} in ${presentationGroup.group.name}`,
                            link: `/group/${presentationGroup.group.id}?id=${presentationGroupId}`,
                        }
                    }
                } else if (presentation) {
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
                    .to(`notification-${presentationId}-${presentationGroupId}`)
                    .emit('server-send-message-noti', newNoti)

                // await Notification.create(newNoti)

                const newMessage = {
                    content: message.content,
                    presentation_id: presentationId,
                    presentation_group_id: presentationGroupId,
                    user_id: message.user.id,
                }

                await Message.create(newMessage)
            } catch (error) {
                console.log('[error]', 'noti message:', e)
            }
        }
    )
}

module.exports = { joinMessageRoom, leaveMessageRoom, control }
