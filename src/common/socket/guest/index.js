const guestJoinSlideRoom = (socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', function (slideId) {
        try {
            const room = `slide${slideId}`
            // console.log('[socket]', 'guest join room :', room)
            socket.join(room)
            // socket.to(room).emit('guest joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}
const guestLeaveSlideRoom = (socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', function (slideId) {
        try {
            const room = `slide${slideId}`
            // console.log('[socket]', 'guest leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('guest left', socket.id)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

module.exports = { guestJoinSlideRoom, guestLeaveSlideRoom }
