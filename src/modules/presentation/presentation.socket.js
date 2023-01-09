const db = require('#common/database/index.js')

const User_Choice = db.User_Choice

const control = (io, socket) => {
    socket.on(
        'client-send-presentingPresentationId',
        async (presentationId, presentationName, groupId) => {
            const noti = {
                message: `${presentationName} is presenting`,
                presentationId,
            }

            io.of('/notification')
                .to(`notification-group-${presentationId}`)
                .emit('server-send-presentingPresentation-noti', noti)

            // db action
        }
    )
}

module.exports = {
    control,
}
