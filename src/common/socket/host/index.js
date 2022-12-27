const hostJoinSlideRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (slideId) {
        try {
            const room = `slide${slideId}`
            // console.log('[socket]', 'host join room :', room)
            socket.join(room)
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
    socket.on('unsubscribe', async function (slideId) {
        try {
            const room = `slide${slideId}`
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

module.exports = { hostJoinSlideRoom, hostLeaveSlideRoom }
