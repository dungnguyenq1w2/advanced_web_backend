const db = require('#common/database/index.js')

const Notification = db.Notification
const User_Group = db.User_Group
const Group = db.Group
const Presentation_Group = db.Presentation_Group

const joinNotificationRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (userId) {
        try {
            // console.log('🚀 ~ userId', userId)
            userId = parseInt(userId)
            if (!userId) return

            const userGroups = await User_Group.findAll({
                attributes: ['id'],
                where: {
                    user_id: userId,
                },
                include: {
                    model: Group,
                    as: 'group',
                    attributes: ['id'],
                    include: {
                        model: Presentation_Group,
                        as: 'presentation_groups',
                        attributes: ['id', 'presentation_id'],
                        require: true,
                    },
                },
                raw: true,
            })
            for (const userGroup of userGroups) {
                if (userGroup['group.presentation_groups.presentation_id']) {
                    const room = `notification-${userGroup['group.presentation_groups.presentation_id']}-${userGroup['group.presentation_groups.id']}`
                    // console.log('[socket]', 'join room :', room)
                    socket.join(room)
                }
            }

            // const sockets = await io.of('/notification').fetchSockets()
            // console.log('🚀 ~ sockets', sockets)
            // socket.to(room).emit('user joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const leaveNotificationRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', async function (userId) {
        try {
            // const room = `message-${presentationId}-${presentationGroupId}`
            // console.log('[socket]', 'leave room :', room)
            console.log('[socket]', 'disconnect :')
            // socket.leave(room)
            socket.disconnect()
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const joinPublicPresentationNotificationRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe-presentation', async function (presentationId) {
        try {
            presentationId = parseInt(presentationId)
            if (!presentationId) return

            const room = `notification-${presentationId}-null`
            socket.join(room)
            console.log('🚀 ~ socket', socket.id)
            console.log('[socket]', 'join room :', room)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const leavePublicPresentationNotificationRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe-presentation', async function (presentationId) {
        try {
            // const room = `message-${presentationId}-${presentationGroupId}`
            // console.log('[socket]', 'leave room :', room)
            console.log('[socket]', 'disconnect :')
            // socket.leave(room)
            socket.disconnect()
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const control = (io, socket) => {
    // socket.on(
    //     'client-send-message',
    //     async (presentationId, presentationGroupId = null, message) => {
    //         io.of('/message')
    //             .to(`message-${presentationId}-${presentationGroupId}`)
    //             .emit('server-send-message', message)
    //         const newNotification = {
    //             content: message.content,
    //             presentation_id: presentationId,
    //             presentation_group_id: presentationGroupId,
    //             user_id: message.user.id,
    //         }
    //         await Notification.create(newNotification)
    //     }
    // )
}

module.exports = {
    joinNotificationRoom,
    leaveNotificationRoom,
    joinPublicPresentationNotificationRoom,
    leavePublicPresentationNotificationRoom,
    control,
}
