// require('dotenv').config()
const crypto = require('crypto')

const secret_key = process.env.CRYPTO_SECRET_KEY
const secret_iv = process.env.CRYPTO_SECRET_IV
const algorithm = 'AES-256-CBC'

const key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substring(0, 32)
const iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substring(0, 16)

const encryptString = (stringData) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = cipher.update(stringData, 'utf8', 'base64') + cipher.final('base64') // encrypt and convert to base64
    return Buffer.from(encrypted).toString('base64')
}

const decryptString = (encryptedString) => {
    const decodedString = Buffer.from(encryptedString, 'base64').toString('utf-8')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    return decipher.update(decodedString, 'base64', 'utf8') + decipher.final('utf8')
}

module.exports = { encryptString, decryptString }
