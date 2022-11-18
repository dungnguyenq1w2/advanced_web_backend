const { Sequelize, DataTypes } = require('sequelize')

const { DB, USER, PASSWORD, PORT, HOST, dialect, pool } = require('#common/config/dbConfig.js')

const sequelize = new Sequelize(DB, USER, PASSWORD, {
    host: HOST,
    dialect: dialect,
    operatorAliases: false,
    logging: true,
    port: PORT,
    pool: {
        max: pool.max,
        min: pool.min,
        acquire: pool.acquire,
        idle: pool.idle,
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

db.User = User(sequelize, DataTypes)
db.Group = Group(sequelize, DataTypes)
db.User_Group = User_Group(sequelize, DataTypes)
db.Role = Role(sequelize, DataTypes)

db.sequelize
    //.sync({ force: false, match: /_test$/ }) // important, chạy chỉ khi  tên DB kết thúc bằng test
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
