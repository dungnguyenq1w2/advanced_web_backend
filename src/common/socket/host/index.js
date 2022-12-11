const hostJoinSlideRoom = (socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', function (slideId) {
        try {
            const room = `slide${slideId}`
            console.log('[socket]', 'host join room :', room)
            socket.join(room)
            // socket.to(room).emit('user joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

const hostLeaveSlideRoom = (socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', function (slideId) {
        try {
            const room = `slide${slideId}`
            console.log('[socket]', 'host leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('user left', socket.id)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

module.exports = { hostJoinSlideRoom, hostLeaveSlideRoom }
