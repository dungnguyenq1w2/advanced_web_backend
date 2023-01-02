const db = require('#common/database/index.js')
const jwt = require('jsonwebtoken')

// Create main Model
const Blacklist_Token = db.Blacklist_Token

// Main work

const refreshBlaclistToken = async () => {
    try {
        const blacklist = await Blacklist_Token.findAll({
            attributes: ['id', 'token'],
            raw: true,
        })

        blacklist.forEach(async (element) => {
            jwt.verify(
                element.token,
                process.env.RESET_PASSWORD_TOKEN_SECRET,
                async (err, user) => {
                    if (err) {
                        await Blacklist_Token.destroy({
                            where: {
                                id: element.id,
                            },
                        })
                    }
                }
            )
        })
    } catch (error) {
        console.log(error)
    }
}

const addToken = async (strToken) => {
    try {
        const token = await Blacklist_Token.create({
            token: strToken,
        })

        if (token instanceof Blacklist_Token) return true

        return false
    } catch (error) {
        console.log(error)
        return false
    }
}

const isTokenInBlackList = async (strToken) => {
    try {
        const token = await Blacklist_Token.findOne({ where: { token: strToken } })

        if (token) return true

        return false
    } catch (error) {
        console.log(error)
        return true
    }
}

module.exports = {
    refreshBlaclistToken,
    addToken,
    isTokenInBlackList,
}
