const jwt = require('jsonwebtoken')

const db = require('#common/database/index.js')

const User = db.User

// Generate only access token
const generateAccessToken = async (user) => {
    delete user.exp
    delete user.iat
    try {
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
        })

        return Promise.resolve(accessToken)
    } catch (err) {
        console.log('🚀 ~ err', err)
        return Promise.reject(err)
    }
}

// Generate only reset password token
const generateResetPasswordToken = async (user) => {
    delete user.exp
    delete user.iat
    try {
        const reserPasswordToken = jwt.sign(user, process.env.RESET_PASSWORD_TOKEN_SECRET, {
            expiresIn: '15m', //900
        })

        return Promise.resolve(reserPasswordToken)
    } catch (err) {
        console.log('🚀 ~ err', err)
        return Promise.reject(err)
    }
}

// Generate both access token and refresh token
const generateTokens = async (user) => {
    try {
        const accessToken = await generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '30d',
        })

        await User.update({ refresh_token: refreshToken }, { where: { id: user.id } })

        return Promise.resolve({ accessToken, refreshToken })
    } catch (err) {
        return Promise.reject(err)
    }
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({ where: { refresh_token: refreshToken } })
        if (!user) return reject({ error: true, message: 'Invalid refresh token' })

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, tokenDetails) => {
            if (err) return reject({ error: true, message: 'Invalid refresh token' })
            resolve({
                tokenDetails,
                error: false,
                message: 'Valid refresh token',
            })
        })
    })
}

module.exports = {
    generateAccessToken,
    generateTokens,
    verifyRefreshToken,
    generateResetPasswordToken,
}
