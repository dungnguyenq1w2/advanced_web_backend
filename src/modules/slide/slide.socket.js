const db = require('#common/database/index.js')

const User_Choice = db.User_Choice

const slideSocket = (io, socket) => {
    socket.on('client-send-choices', async (slideId, guestId, choices) => {
        console.log('🚀 ~ guestId', guestId)
        console.log('🚀 ~ choices', choices)
        io.of('/guest').to(`slide${slideId}`).emit('server-send-choices', choices)
        io.of('/host').to(`slide${slideId}`).emit('server-send-choices', choices)

        for (const choiceId of choices) {
            const newUserChoice = {
                guest_id: guestId,
                choice_id: choiceId,
            }
            await User_Choice.create(newUserChoice)
        }
    })
}

module.exports = slideSocket
