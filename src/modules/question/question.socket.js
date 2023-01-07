const db = require('#common/database/index.js')

const Question = db.Question
const Answer = db.Answer
const Group = db.Group
const User_Group = db.User_Group
const Presentation = db.Presentation
const Notification = db.Notification
const Presentation_Group = db.Presentation_Group

const joinQuestionRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (presentationId) {
        try {
            const room = `question-${presentationId}`
            // console.log('[socket]', 'join room :', room)
            socket.join(room)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const leaveQuestionRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', async function (presentationId) {
        try {
            const room = `question-${presentationId}}`
            // console.log('[socket]', 'leave room :', room)
            socket.leave(room)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const control = (io, socket) => {
    socket.on('client-send-question', async (presentationId, question) => {
        if (!presentationId) return
        // Case answer this question
        if (question.isAnswer) {
            const newAnswer = {
                content: question.content,
                question_id: question.id,
                user_id: question.user.id,
            }
            await Answer.create(newAnswer)
        } else {
            // Case question
            const newQuestion = {
                content: question.content,
                presentation_id: presentationId,
                user_id: question.user.id,
            }
            const res = await Question.create(newQuestion)
            if (res) {
                question.id = res.id
            }
        }

        let noti = null
        const presentation = await Presentation.findByPk(presentationId)

        if (presentation) {
            {
                noti = {
                    user_id: question.user.id,
                    content: `${question.user.name} ${
                        question.isAnswer ? 'answer your question in' : 'post a new question to'
                    } presentation [${presentation.name}]`,
                    link: `/presentation-slide/${presentationId}`,
                }
            }
        }

        const newNoti = {
            ...noti,
            userAnsweredId: question?.userAnsweredId ?? null,
        }

        io.of('/notification')
            .to(`notification-${presentationId}`)
            .emit('server-send-question-noti', newNoti)

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
            await Notification.create({ ...newNoti, user_id: user_id })
        }
        //#endregion

        io.of('/question').to(`question-${presentationId}`).emit('server-send-question', question)
    })
}

const controlSession = (io, socket) => {
    socket.on('client-send-question-session', async (presentationId, question) => {
        if (!presentationId) return

        io.of('/question')
            .to(`question-${presentationId}`)
            .emit('server-send-question-session', question)

        let noti = null
        const presentation = await Presentation.findByPk(presentationId)

        if (presentation) {
            {
                noti = {
                    user_id: question.user.id,
                    content: `${question.user.name} ${
                        question.isAnswer ? 'answer your question in' : 'post a new question to'
                    } presentation [${presentation.name}]`,
                    // link: `/presentation-slide-session/${presentationId}/member`,
                }
            }
        }

        const newNoti = {
            ...noti,
            userAnsweredId: question?.userAnsweredId ?? null,
        }

        io.of('/notification')
            .to(`notification-${presentationId}`)
            .emit('server-send-question-noti', newNoti)

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
            await Notification.create({ ...newNoti, user_id: user_id })
        }
        //#endregion
    })
}
module.exports = { joinQuestionRoom, leaveQuestionRoom, control, controlSession }
