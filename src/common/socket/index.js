const slideSocket = require('#modules/slide/slide.socket.js')
const messageSocket = require('#modules/message/message.socket.js')
const questionSocket = require('#modules/question/question.socket.js')
const presentationSocket = require('#modules/presentation/presentation.socket.js')
const notificationSocket = require('#modules/notification/notification.socket.js')

const socketConnection = (io) => {
    // Slide_Host socket
    io.of('/host').on('connection', (socket) => {
        // console.log('Host connected')
        // Subscribe Slide room
        slideSocket.hostJoinSlideRoom(io, socket)

        // Unsubscribe Slide room
        slideSocket.hostLeaveSlideRoom(io, socket)

        slideSocket.control(io, socket)
        slideSocket.controlSession(io, socket)
    })

    // Slide_Member socket
    io.of('/member').on('connection', (socket) => {
        // console.log('Member connected')
        // Subscribe Slide room
        slideSocket.memberJoinSlideRoom(io, socket)

        // Unsubscribe Slide room
        slideSocket.memberLeaveSlideRoom(io, socket)

        slideSocket.control(io, socket)
        slideSocket.controlSession(io, socket)
    })

    // Message socket
    io.of('/message').on('connection', (socket) => {
        // Subscribe Message room
        messageSocket.joinMessageRoom(io, socket)

        // Unsubscribe Message room
        messageSocket.leaveMessageRoom(io, socket)

        messageSocket.control(io, socket)
        messageSocket.controlSession(io, socket)
    })

    // Question socket
    io.of('/question').on('connection', (socket) => {
        // Subscribe Question room
        questionSocket.joinQuestionRoom(io, socket)

        // Unsubscribe Question room
        questionSocket.leaveQuestionRoom(io, socket)

        questionSocket.control(io, socket)
        questionSocket.controlSession(io, socket)
    })

    // Presentation socket
    io.of('/presentation').on('connection', (socket) => {
        presentationSocket.control(io, socket)
    })

    // Presentation socket
    io.of('/presentation').on('connection', (socket) => {
        presentationSocket.control(io, socket)
    })

    // Notification socket
    io.of('/notification').on('connection', (socket) => {
        // Subscribe Notification room
        notificationSocket.joinNotificationRoom(io, socket)

        // Unsubscribe Notification room
        notificationSocket.leaveNotificationRoom(io, socket)

        notificationSocket.joinPublicPresentationNotificationRoom(io, socket)

        notificationSocket.leavePublicPresentationNotificationRoom(io, socket)

        notificationSocket.control(io, socket)
    })
}

module.exports = socketConnection
