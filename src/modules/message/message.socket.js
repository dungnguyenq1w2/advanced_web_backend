const db = require('#common/database/index.js')
const { Op } = require('sequelize')

const Message = db.Message
const Group = db.Group
const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group
const User_Group = db.User_Group
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
                    content: `${message.user.name} send a new message to presentation [${presentation.name}]`,
                    link: `/presentation-slide/${presentationId}`,
                }
            }

            io.of('/notification')
                .to(`notification-${presentationId}`)
                .emit('server-send-message-noti', noti)

            //#region add notification db
            const presentationGroup = await Presentation_Group.findAll({
                attributes: ['group_id'],
                where: {
                    presentation_id: presentationId,
                },
                include: {
                    model: Group,
                    as: 'group',
                    include: {
                        model: User_Group,
                        as: 'participants',
                        where: {
                            user_id: {
                                [Op.ne]: message.user.id,
                            },
                        },
                    },
                },
            })

            const users = presentationGroup
                .reduce((arr, cur) => {
                    return [...arr, ...cur.group.dataValues.participants]
                }, [])
                .map((e) => e.dataValues.user_id)

            const newUsers = [...new Set(users)]

            for (const user_id of newUsers) {
                await Notification.create({ ...noti, user_id: user_id })
            }
            //#endregion

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

const messages = {}
const controlSession = (io, socket) => {
    socket.on('client-get-messages-session', (presentationId) => {
        if (messages[presentationId] === undefined) messages[presentationId] = []

        socket.emit('server-send-messages-session', messages[presentationId])
    })

    socket.on('client-send-message-session', async (presentationId, message) => {
        try {
            if (!presentationId) return
            messages[presentationId].push(message)

            io.of('/message')
                .to(`message-${presentationId}`)
                .emit('server-send-message-session', message)

            let noti = null
            const presentation = await Presentation.findByPk(presentationId)
            if (presentation) {
                noti = {
                    content: `${message.user.name} send a new message to presentation [${presentation.name}]`,
                    link: `/presentation-slide/${presentationId}`,
                }
            }

            io.of('/notification')
                .to(`notification-${presentationId}`)
                .emit('server-send-message-noti', noti)

            //#region add notification db
            const presentationGroup = await Presentation_Group.findAll({
                attributes: ['group_id'],
                where: {
                    presentation_id: presentationId,
                },
                include: {
                    model: Group,
                    as: 'group',
                    include: {
                        model: User_Group,
                        as: 'participants',
                    },
                },
            })

            const users = presentationGroup
                .reduce((arr, cur) => {
                    return [...arr, ...cur.group.dataValues.participants]
                }, [])
                .map((e) => e.dataValues.user_id)

            const newUsers = [...new Set(users)]

            for (const user_id of newUsers) {
                await Notification.create({ ...noti, user_id: user_id })
            }
            //#endregion
        } catch (error) {
            console.log('[error]', 'noti message:', error)
        }
    })

    socket.on('client-stop-message-session', (presentationId) => {
        if (messages[presentationId] !== undefined) delete messages[presentationId]
    })
}

module.exports = { joinMessageRoom, leaveMessageRoom, control, controlSession }
