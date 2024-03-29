const db = require('#common/database/index.js')

const User_Choice = db.User_Choice

const messageSocket = (io, socket) => {
    socket.on(
        'client-send-choices',
        async (slideId, member, choices, presentationGroupId = null) => {
            io.of('/member').to(`slide${slideId}`).emit('server-send-choices', member, choices)
            io.of('/host').to(`slide${slideId}`).emit('server-send-choices', member, choices)

            for (const choiceId of choices) {
                const newUserChoice = {
                    member_id: member.id,
                    choice_id: choiceId,
                    presentation_group_id: presentationGroupId,
                }
                await User_Choice.create(newUserChoice)
            }
        }
    )
}

module.exports = slideSocket
