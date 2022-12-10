const db = require('#common/database/index.js')

const User_Choice = db.User_Choice

const slideSocket = (io, socket) => {
    socket.on('client-send-choice', async (slideId, userId, choiceId) => {
        io.of('/guest').to(`presentation${slideId}`).emit('server-send-choice', choiceId)
        io.of('/host').to(`presentation${slideId}`).emit('server-send-choice', choiceId)

        const newUserChoice = {
            user_id: userId,
            choice_id: choiceId,
        }
        await User_Choice.create(newUserChoice)
    })
}

module.exports = slideSocket
