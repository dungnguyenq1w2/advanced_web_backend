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
const slideApi = require('#modules/slide/slide.api.js')
const choiceApi = require('#modules/choice/choice.api.js')
const notificationApi = require('#modules/notification/notification.api.js')
const messageApi = require('#modules/message/message.api.js')
const questionApi = require('#modules/question/question.api.js')
const answerApi = require('#modules/answer/answer.api.js')

const { hostSocket, memberSocket } = require('./src/common/socket')
const slideSocket = require('#modules/slide/slide.socket.js')
const socketConnection = require('./src/common/socket')

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
        origin: process.env.APP_FRONT_END_URL,
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
app.use('/api/slides', slideApi)
app.use('/api/choices', choiceApi)
app.use('/api/notifications', notificationApi)
app.use('/api/messages', messageApi)
app.use('/api/questions', questionApi)
app.use('/api/answers', answerApi)

app.get('/', (req, res) => {
    res.send('Advanced Web')
})
//#endregion

//#region Socket
socketConnection(io)
//#endregion

httpsServer.listen(process.env.PORT || 5000, function () {
    console.log(
        'Express server listening on port %d in %s mode',
        this.address().port,
        app.settings.env
    )
})
