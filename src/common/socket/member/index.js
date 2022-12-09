const memberJoinPresentationRoom = (socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', function (presentationId) {
        try {
            const room = `presentation${presentationId}`
            // console.log('[socket]', 'member join room :', room)
            socket.join(room)
            // socket.to(room).emit('member joined', socket.id)
        } catch (e) {
            console.log('[error]', 'join room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}
const memberLeavePresentationRoom = (socket) => {
    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe', function (presentationId) {
        try {
            const room = `presentation${presentationId}`
            // console.log('[socket]', 'member leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('member left', socket.id)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

export { memberJoinPresentationRoom, memberLeavePresentationRoom }
