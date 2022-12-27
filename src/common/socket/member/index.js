const memberJoinSlideRoom = (io, socket) => {
    //:JOIN:Client Supplied Room
    socket.on('subscribe', async function (slideId) {
        try {
            const room = `slide${slideId}`

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
    socket.on('unsubscribe', function (slideId) {
        try {
            const room = `slide${slideId}`
            // console.log('[socket]', 'member leave room :', room)
            socket.leave(room)
            // socket.to(room).emit('member left', socket.id)
        } catch (e) {
            console.log('[error]', 'leave room :', e)
            socket.emit('error', 'couldnt perform requested action')
        }
    })
}

module.exports = { memberJoinSlideRoom, memberLeaveSlideRoom }
