const db = require('#common/database/index.js')

const Choice = db.Choice
const Presentation = db.Presentation
const User_Choice = db.User_Choice
const Slide = db.Slide

const hostJoinSlideRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (slideId, presentationGroupId = null) {
        try {
            const room = `slide-${slideId}-${presentationGroupId}`
            socket.join(room)
            // console.log('[socket]', 'host join room :', room)
            // Send permission to member that waiting in room
            io.of('/member').to(room).emit('server-send-permission', true)
            // socket.to(room).emit('user joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const hostLeaveSlideRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', async function (slideId, presentationGroupId = null) {
        try {
            const room = `slide-${slideId}-${presentationGroupId}`
            // console.log('[socket]', 'host leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('user left', socket.id)
            io.of('/member').to(room).emit('server-send-permission', false)
            // io.of('/member').socketsLeave(room)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const memberJoinSlideRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (slideId, presentationGroupId = null) {
        try {
            const room = `slide-${slideId}-${presentationGroupId}`

            socket.join(room)
            // console.log('[socket]', 'member join room :', room)
            const sockets = await io.of('/host').in(room).fetchSockets()
            // Check host in room
            if (sockets.length > 0) {
                socket.emit('server-send-permission', true)
                // socket.to(room).emit('member joined', socket.id)
            } else {
                socket.emit('server-send-permission', false)
            }
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const memberLeaveSlideRoom = (io, socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', function (slideId, presentationGroupId = null) {
        try {
            const room = `slide-${slideId}-${presentationGroupId}`
            // console.log('[socket]', 'member leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('member left', socket.id)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const control = (io, socket) => {
    socket.on(
        'client-send-choices',
        async (slideId, presentationGroupId = null, member, choices) => {
            io.of('/member')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-choices', member, choices)
            io.of('/host')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-choices', member, choices)

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

    //
    socket.on(
        'client-send-changeSlide',
        async (slideId, slideIndex, presentationGroupId = null) => {
            io.of('/member')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-changeSlide', slideIndex)
        }
    )

    socket.on(
        'client-save-slide',
        async (
            slideId,
            // isPresenting,
            // isSlideChange,
            // isChoicesChange,
            updateSlideData = {}
        ) => {
            try {
                await Slide.update(updateSlideData, { where: { id: slideId } })
            } catch (error) {
                console.log('🚀 ~ error', error)
            }
        }
    )

    socket.on('client-save-slideChoices', async (slideChoices = []) => {
        try {
            for (const choice of slideChoices) {
                if (choice?.action) {
                    const { action, id, ...choiceData } = choice
                    switch (choice?.action) {
                        case 'ADD':
                            await Choice.create(choiceData)
                            break
                        case 'UPDATE':
                            await Choice.update(choiceData, { where: { id: id } })
                            break
                        case 'DELETE':
                            await Choice.destroy({ where: { id: id } })
                            break
                        default:
                            break
                    }
                }
            }
        } catch (error) {
            console.log('🚀 ~ error', error)
        }
    })
}

// session slide data
// slides = {
//      slideId-presentationGroupId: {
//          dataValues: {
//              id, question,...,
//              choices: [
//                  {
//                      dataValues: {
//                          id, ...,
//                          n_choices,
//                          user_choices: [
//                              {
//                                  member: {
//                                      id, name, image
//                                  }
//                               }
//                          ]
//                      }
//                  }
//              ]
//           }
//      }
// }
const slides = {}

const controlSession = (io, socket) => {
    socket.on(
        'client-send-choices-session',
        async (slideId, presentationGroupId = null, member, choices) => {
            // console.log('slides', slides[`${slideId}-${presentationGroupId}`])
            io.of('/member')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-choices-session', member, choices)
            io.of('/host')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-choices-session', member, choices)

            for (const choice of choices) {
                const choiceIndex = slides[
                    `${slideId}-${presentationGroupId}`
                ].dataValues.choices.findIndex(
                    (e) => parseInt(e.dataValues.id) === parseInt(choice)
                )
                if (choiceIndex > -1) {
                    slides[`${slideId}-${presentationGroupId}`].dataValues.choices[choiceIndex]
                        .dataValues.n_choices++
                    slides[`${slideId}-${presentationGroupId}`].dataValues.choices[
                        choiceIndex
                    ].dataValues.user_choices.push({ member })
                }
            }
        }
    )

    socket.on('client-get-slideForHost-session', async (slideId, presentationGroupId = null) => {
        if (!slideId) return

        if (slides[`${slideId}-${presentationGroupId}`] === undefined) {
            const slideResult = await Slide.findByPk(slideId, {
                include: {
                    model: Choice,
                    as: 'choices',
                },
            })

            if (slideResult && slideResult.dataValues.type === 3) {
                slideResult.dataValues.choices?.forEach((e) => {
                    e.dataValues.user_choices = []
                    e.dataValues.n_choices = 0
                })
                slideResult.dataValues['isChosen'] = false
            }

            slides[`${slideId}-${presentationGroupId}`] = slideResult
        }

        socket.emit('server-send-slideForHost-session', slides[`${slideId}-${presentationGroupId}`])
    })

    socket.on(
        'client-get-slideForMember-session',
        async (slideId, presentationGroupId = null, member) => {
            if (!slideId) return

            if (slides[`${slideId}-${presentationGroupId}`] === undefined) {
                const slideResult = await Slide.findByPk(slideId, {
                    include: {
                        model: Choice,
                        as: 'choices',
                    },
                })

                if (slideResult && slideResult.dataValues.type === 3) {
                    slideResult.dataValues.choices?.forEach((e) => {
                        e.dataValues.user_choices = []
                        e.dataValues.n_choices = 0
                    })
                }

                slides[`${slideId}-${presentationGroupId}`] = slideResult
            } else {
                slides[`${slideId}-${presentationGroupId}`].dataValues.choices?.forEach(
                    (choice) => {
                        const index = choice.dataValues.user_choices.findIndex(
                            (e) => e.member.id === member.id
                        )
                        if (index > -1) {
                            choice.dataValues.isMyChoice = true
                        } else {
                            choice.dataValues.isMyChoice = false
                        }
                    }
                )

                slides[`${slideId}-${presentationGroupId}`].dataValues['isChosen'] = slides[
                    `${slideId}-${presentationGroupId}`
                ].dataValues.choices.find((e) => e.dataValues.isMyChoice === true)
                    ? true
                    : false
            }

            socket.emit(
                'server-send-slideForMember-session',
                slides[`${slideId}-${presentationGroupId}`]
            )
        }
    )

    socket.on(
        'client-stop-presentation-session',
        async (presentationId, presentationGroupId = null) => {
            if (!presentationId) return

            const presentation = await Presentation.findByPk(presentationId, {
                include: {
                    model: Slide,
                    as: 'slides',
                },
            })
            presentation.dataValues.slides.forEach((e) => {
                delete slides[`${e.dataValues.id}-${presentationGroupId}`]
            })
        }
    )

    socket.on(
        'client-send-changeSlide',
        async (slideId, slideIndex, presentationGroupId = null) => {
            io.of('/member')
                .to(`slide-${slideId}-${presentationGroupId}`)
                .emit('server-send-changeSlide', slideIndex)
        }
    )
}

module.exports = {
    hostJoinSlideRoom,
    hostLeaveSlideRoom,
    memberJoinSlideRoom,
    memberLeaveSlideRoom,
    control,
    controlSession,
}
