const db = require('#common/database/index.js')

const Presentation_Group = db.Presentation_Group

const control = (io, socket) => {
    socket.on(
        'client-send-presentingPresentation',
        async (presentationId, presentationName, groupId, groupName) => {
            try {
                const noti = {
                    content: `Presentation [${presentationName}] is presenting in group [${groupName}]`,
                    link: `/group/${groupId}`,
                }
                io.of('/notification')
                    .to(`notification-group-${groupId}`)
                    .emit('server-send-presentingPresentation-noti', noti)

                await Presentation_Group.update(
                    { is_presenting: 1 },
                    {
                        where: {
                            presentation_id: presentationId,
                            group_id: groupId,
                        },
                    }
                )
            } catch (error) {
                console.log('🚀 ~ error', error)
            }
        }
    )
}

module.exports = {
    control,
}
