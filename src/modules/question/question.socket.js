const db = require('#common/database/index.js')

const Question = db.Question
const Answer = db.Answer

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

            io.of('/question')
                .to(`question-${presentationId}-${presentationGroupId}`)
                .emit('server-send-question', question)
        }
    )
}

module.exports = { joinQuestionRoom, leaveQuestionRoom, control }
