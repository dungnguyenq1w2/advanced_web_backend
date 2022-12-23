const { Sequelize, DataTypes } = require('sequelize')

const { DB, USER, PASSWORD, PORT, HOST, dialect, pool } = require('#common/config/db.config.js')

const sequelize = new Sequelize(DB, USER, PASSWORD, {
    host: HOST,
    dialect: dialect,
    operatorAliases: false,
    logging: false,
    port: PORT,
    pool: {
        max: pool.max,
        min: pool.min,
        acquire: pool.acquire,
        idle: pool.idle,
    },
    define: {
        freezeTableName: true,
    },
})

sequelize
    .authenticate()
    .then(() => {
        console.log('DB connected')
    })
    .catch((err) => {
        console.log(err)
    })

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

const User = require('#modules/user/user.model.js')
const Group = require('#modules/group/group.model.js')
const User_Group = require('#modules/user_group/user_group.model.js')
const Role = require('#modules/role/role.model.js')

const Presentation = require('#modules/presentation/presentation.model.js')
const Slide = require('#modules/slide/slide.model.js')
const Slide_Type = require('#modules/slide_type/slide_type.model.js')

const Choice = require('#modules/choice/choice.model.js')
const User_Choice = require('#modules/user_choice/user_choice.model.js')

const Message = require('#modules/message/message.model.js')
const Question = require('#modules/question/question.model.js')
const Answer = require('#modules/answer/answer.model.js')
const Vote = require('#modules/vote/vote.model.js')

const Notification = require('#modules/notification/notification.model.js')

db.User = User(sequelize, DataTypes)
db.Group = Group(sequelize, DataTypes)
db.User_Group = User_Group(sequelize, DataTypes)
db.Role = Role(sequelize, DataTypes)

db.Presentation = Presentation(sequelize, DataTypes)
db.Slide = Slide(sequelize, DataTypes)
db.Slide_Type = Slide_Type(sequelize, DataTypes)

db.Choice = Choice(sequelize, DataTypes)
db.User_Choice = User_Choice(sequelize, DataTypes)

db.Message = Message(sequelize, DataTypes)
db.Question = Question(sequelize, DataTypes)
db.Answer = Answer(sequelize, DataTypes)
db.Vote = Vote(sequelize, DataTypes)

db.Notification = Notification(sequelize, DataTypes)

db.sequelize
    //.sync({ force: false, match: /_test$/ }) // important, chạy chỉ khi tên DB kết thúc bằng test
    .sync({ alter: true })
    .then(() => {
        console.log('yes re-sync done!')
    })
    .catch((err) => {
        console.log('Error: ' + err)
    })

// Setup association
Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        // call the associate function and pass reference to all other models
        db[modelName].associate(db)
    }
})

module.exports = db
