require('dotenv').config()

const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')
const { ALL } = require('dns')

// const { createServer } = require('https')
const { createServer } = require('http')
const { Server } = require('socket.io')

const db = require('#common/database/index.js')

const authApi = require('#modules/auth/auth.api.js')
const userApi = require('#modules/user/user.api.js')
const groupApi = require('#modules/group/group.api.js')
const presentationApi = require('#modules/presentation/presentation.api.js')

const app = express()

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(
    cors({
        credentials: 'true',
    })
)

const httpsServer = createServer(app)

const io = new Server(httpsServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ALL,
    },
})

//#region Database
// -----> Production Environment
// db.sequelize
//     .sync()
//     .then(() => {
//         console.log('Synced db.')
//     })
//     .catch((err) => {
//         console.log('Failed to sync db: ' + err.message)
//     })

// ----> Development Environment
db.sequelize.sync().then(() => {
    console.log('Drop and re-sync db.')
})
//#endregion

//#region APIs
app.use('/api/auth', authApi)
app.use('/api/users', userApi)
app.use('/api/groups', groupApi)
app.use('/api/presentations', presentationApi)

app.get('/', (req, res) => {
    res.send('Advanced Web')
})
//#endregion

//#region Socket
// Host socket
io.of('/host').on('connection', (socket) => {
    console.log('Host connected')
    // Subscribe Presentation room
    hostJoinPresentationRoom(socket)

    // Unsubscribe Presentation room
    hostLeavePresentationRoom(socket)

    // progressSocket(io, socket)
    // matchSocket(io, socket)
})

// Member socket
io.of('/member').on('connection', (socket) => {
    console.log('Member connected')
    // Subscribe Presentation room
    userJoinPresentationRoom(socket)

    // Unsubscribe Presentation room
    userLeavePresentationRoom(socket)

    // matchSocket(io, socket)
    // progressSocket(socket)
})
//#endregion

httpsServer.listen(process.env.PORT || 5000, function () {
    console.log(
        'Express server listening on port %d in %s mode',
        this.address().port,
        app.settings.env
    )
})
