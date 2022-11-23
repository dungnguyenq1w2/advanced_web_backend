require('dotenv').config()

const express = require('express')

const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const cors = require('cors')

const db = require('#common/database/index.js')

const authApi = require('#modules/auth/auth.api.js')
const userApi = require('#modules/user/user.api.js')
const groupApi = require('#modules/group/group.api.js')

const app = express()

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(
    cors({
        credentials: 'true',
    })
)
app.use(upload.array()) 

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

app.use('/api/auth', authApi)
app.use('/api/users', userApi)
app.use('/api/groups', groupApi)

app.get('/', (req, res) => {
    res.send('hello')
})

app.listen(process.env.PORT || 5000, function () {
    console.log(
        'Express server listening on port %d in %s mode',
        this.address().port,
        app.settings.env
    )
})
