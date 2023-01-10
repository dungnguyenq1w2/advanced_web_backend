const db = require('#common/database/index.js')

const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group
const User_Group = db.User_Group
const Notification = db.Notification

// Session presentations
const presentations = {}

const control = (io, socket) => {
    socket.on(
        'client-present-presentation',
        async (presentationId, presentationName, groupId, groupName) => {
            try {
                const noti = {
                    content: `Presentation [${presentationName}] is presenting in group [${groupName}]`,
                    link: `/group/${groupId}`,
                    presentationId,
                }
                io.of('/notification')
                    .to(`notification-group-${groupId}`)
                    .emit('server-present-presentation-noti', noti)

                await Presentation_Group.update(
                    { is_presenting: 1 },
                    {
                        where: {
                            presentation_id: presentationId,
                            group_id: groupId,
                        },
                    }
                )

                //#region add notification db
                const userGroup = await User_Group.findAll({
                    where: {
                        group_id: groupId,
                    },
                })

                const users = userGroup.map((e) => e.dataValues.user_id)
                delete noti.presentationId
                for (const user_id of users) {
                    await Notification.create({ ...noti, user_id: user_id })
                }
                //#endregion
            } catch (error) {
                console.log('🚀 ~ error', error)
            }
        }
    )

    socket.on('client-stop-presentation', async (presentationId, presentationGroupId) => {
        try {
            const presentationGroup = await Presentation_Group.findByPk(presentationGroupId)
            io.of('/notification')
                .to(`notification-group-${presentationGroup.dataValues.group_id}`)
                .emit('server-stop-presentation-noti', {
                    presentationId,
                    groupId: presentationGroup.dataValues.group_id,
                })

            await Presentation_Group.update(
                { is_presenting: 0 },
                {
                    where: {
                        id: presentationGroupId,
                    },
                }
            )
        } catch (error) {
            console.log('🚀 ~ error', error)
        }
    })

    socket.on('client-edit-presentation', async (presentationId) => {
        try {
            await Presentation.update(
                { is_editing: 1 },
                {
                    where: {
                        id: presentationId,
                    },
                }
            )
        } catch (error) {
            console.log('🚀 ~ error', error)
        }
    })

    socket.on('client-stopedit-presentation', async (presentationId) => {
        try {
            await Presentation.update(
                { is_editing: 0 },
                {
                    where: {
                        id: presentationId,
                    },
                }
            )
        } catch (error) {
            console.log('🚀 ~ error', error)
        }
    })
}

module.exports = {
    control,
}
