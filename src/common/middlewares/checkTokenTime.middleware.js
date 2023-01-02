const jwt = require('jsonwebtoken')
const blacklistTokenController = require('../../modules/blacklist_token/blacklist_token.controller')

const checkTokenTime = async (req, res, next) => {
    const token = req.body.token

    if (token == null)
        return res.sendStatus(404)

    await blacklistTokenController.refreshBlaclistToken()

    const isTokenInBlacklist = await blacklistTokenController.isTokenInBlackList(token)
    if (isTokenInBlacklist) 
        return res.sendStatus(404)
   
    jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log('err', err)
            return res.sendStatus(404)
        }

        req.user = user

        next()
    })
}

module.exports = { checkTokenTime }
