const HOST = process.env.DB_HOST
const USER = process.env.DB_USER
const PASSWORD = process.env.DB_PASSWORD
const DB = process.env.DB_NAME
const PORT = process.env.DB_PORT
const dialect = 'mysql'
const logging = false
const pool = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 100000,
}

module.exports = { HOST, USER, PASSWORD, DB, PORT, dialect, logging, pool }
