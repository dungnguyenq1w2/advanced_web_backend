const db = require('#common/database/index.js')

const Question = db.Question
const Answer = db.Answer
const Group = db.Group
const Presentation = db.Presentation
const Notification = db.Notification
const Presentation_Group = db.Presentation_Group

const joinQuestionRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (presentationId, presentaionGroupId = null) {
        try {
            const room = `question-${presentationId}-${presentaionGroupId}`
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
    socket.on('unsubscribe', async function (presentationId, presentaionGroupId = null) {
        try {
            const room = `question-${presentationId}-${presentaionGroupId}`
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
        'client-send-question',
        async (presentationId, presentationGroupId = null, question) => {
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
                    presentation_group_id: presentationGroupId,
                    user_id: question.user.id,
                }
                const res = await Question.create(newQuestion)
                if (res) {
                    question.id = res.id
                }
            }

            let noti = null
            const presentation = await Presentation.findByPk(presentationId)
            if (presentationGroupId) {
                const presentationGroup = await Presentation_Group.findByPk(presentationGroupId, {
                    include: { model: Group, as: 'group', attribute: ['id', 'name'] },
                })
                if (presentation && presentationGroup) {
                    noti = {
                        user_id: question.user.id,
                        content: `${question.user.name} ${
                            question.isAnswer ? 'answer your question of' : 'post a new question to'
                        } ${presentation.name} in ${presentationGroup.group.name}`,
                        link: `/group/${presentationGroup.group.id}?id=${presentationGroupId}`,
                        is_read: false,
                        created_at: new Date(),
                    }
                }
            } else if (presentation) {
                {
                    noti = {
                        user_id: question.user.id,
                        content: `${question.user.name} ${
                            question.isAnswer ? 'answer your question of' : 'post a new question to'
                        } ${presentation.name}`,
                        link: `/presentation-slide/${presentationId}`,
                        is_read: false,
                        created_at: new Date(),
                    }
                }
            }
            const newNoti = {
                ...noti,
                user_id: question.user.id,
                is_read: false,
                created_at: new Date(),
                userAnsweredId: question?.userAnsweredId ?? null,
            }

            io.of('/notification')
                .to(`notification-${presentationId}-${presentationGroupId}`)
                .emit('server-send-question-noti', newNoti)

            // delete newNoti.userAnsweredId
            // await Notification.create(newNoti)

            io.of('/question')
                .to(`question-${presentationId}-${presentationGroupId}`)
                .emit('server-send-question', question)
        }
    )
}

module.exports = { joinQuestionRoom, leaveQuestionRoom, control }
