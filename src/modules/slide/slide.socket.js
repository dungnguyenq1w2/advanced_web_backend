const db = require('#common/database/index.js')

const User_Choice = db.User_Choice

const slideSocket = (io, socket) => {
    socket.on('client-send-choices', async (slideId, memberId, choices) => {
        io.of('/member').to(`slide${slideId}`).emit('server-send-choices', memberId, choices)
        io.of('/host').to(`slide${slideId}`).emit('server-send-choices', memberId, choices)

        for (const choiceId of choices) {
            const newUserChoice = {
                user_id: memberId,
                choice_id: choiceId,
            }
            await User_Choice.create(newUserChoice)
        }
    })
}

module.exports = slideSocket
