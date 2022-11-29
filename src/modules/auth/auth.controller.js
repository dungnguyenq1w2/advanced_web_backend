const bcrypt = require('bcrypt')

const db = require('#common/database/index.js')
const mailer = require('#root/utils/mailer.js')
const { htmlContent } = require('#common/config/mail.config.js')
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('#common/config/googleOAuth2.config.js')
const { generateAccessToken, generateTokens, verifyRefreshToken } = require('#root/utils/token.js')
const {
    loginBodyValidation,
    refreshTokenBodyValidation,
    registerBodyValidation,
} = require('#root/utils/validation.js')

const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
})

// create main Model
const User = db.User

// main work

const register = async (req, res) => {
    const userRegister = req.body
    try {
        const { errors } = await registerBodyValidation(userRegister)

        if (errors) return res.status(400).json({ message: errors[0] })

        const user = await User.findOne({ where: { email: userRegister.email } })
        if (user) return res.status(409).json({ message: 'Tài khoản đã tồn tại' })

        const salt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(userRegister.password, salt)

        const addUser = await User.create({ ...userRegister, password: hashPassword })
        if (addUser) {
            const resultUser = { id: addUser.id, name: addUser.name, email: addUser.email }
            await bcrypt
                .hash(addUser.email + process.env.REFRESH_TOKEN_SECRET, parseInt(process.env.SALT))
                .then(async (hashedEmail, error) => {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({ message: 'Bcrypt failed' })
                    }
                    await mailer.sendMail(
                        addUser.email,
                        'Verify Email',
                        htmlContent(addUser.email, hashedEmail)
                    )
                })
            return res.status(201).json({
                data: resultUser,
                message: 'Đăng ký thành công',
            })
        } else return res.status(500).json({ message: 'Internal Server Error' })
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const login = async (req, res) => {
    const loginUser = req.body
    try {
        const { errors } = await loginBodyValidation(loginUser)

        if (errors) res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { email: loginUser.email },
            attributes: { exclude: ['refresh_token', 'phone'] },
            raw: true,
        })
        if (!user) return res.status(400).json({ message: 'Account does not exist' })

        const verifiedPassword = await bcrypt.compare(loginUser.password, user.password)
        if (!verifiedPassword) return res.status(400).json({ message: 'Password incorrect' })

        delete user.password
        const { accessToken, refreshToken } = await generateTokens({ ...user, image: '' })

        if (!user.is_auth) return res.status(401).json({ message: 'Unverified account' })

        return res.status(200).json({
            accessToken,
            refreshToken,
            id: user.id,
            image: user.image,
            name: user.name,
            email: user.email,
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getNewToken = async (req, res) => {
    const token = req.body

    const { errors } = await refreshTokenBodyValidation(token)
    if (errors) return res.status(400).json({ message: errors[0] })

    verifyRefreshToken(token.refreshToken)
        .then(async ({ tokenDetails }) => {
            // const user = { id: tokenDetails.id, name: tokenDetails.name }
            const accessToken = await generateAccessToken(tokenDetails)

            return res.status(200).json({
                accessToken,
                message: 'Access token created successfully',
            })
        })
        .catch((err) => res.status(400).json(err)) // Refresh token was expired
}

const verify = async (req, res) => {
    try {
        const { email, token } = req.body
        await bcrypt.compare(
            email + process.env.REFRESH_TOKEN_SECRET,
            token,
            async (err, result) => {
                if (result) {
                    const user = await User.findOne({
                        where: { email: email },
                        attributes: {
                            exclude: ['refresh_token', 'phone', 'password'],
                        },
                        raw: true,
                    })
                    if (user) {
                        if (user.is_auth == 1)
                            return res
                                .status(404)
                                .json({ status: 404, message: 'verified account' })

                        const resultAuth = await User.update(
                            { is_auth: true },
                            {
                                where: {
                                    email: email,
                                },
                            }
                        )
                        if (resultAuth) {
                            const { accessToken, refreshToken } = await generateTokens(user)
                            res.status(200).json({
                                accessToken,
                                refreshToken,
                                id: user.id,
                                image: user.image,
                                name: user.name,
                                email: user.email,
                            })
                        } else
                            return res
                                .status(500)
                                .json({ status: 500, message: 'Internal Server Error' })
                    } else {
                        return res.status(404).json({ status: 404, message: 'Invalid email' })
                    }
                } else {
                    console.log(err)
                    return res.status(404).json({ status: 404, message: 'Error token' })
                }
            }
        )
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const logout = async (req, res) => {
    const token = req.body

    try {
        const { errors } = await refreshTokenBodyValidation(token)
        if (errors) return res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { refresh_token: token.refreshToken },
            raw: true,
        })
        if (!user) return res.status(200).json({ message: 'Logout successfully' })

        await User.update({ refresh_token: '' }, { where: { id: user.id } })
        return res.status(200).json({ message: 'Logout successfully' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()

        let user = await User.findOne({
            where: { email: payload?.email },
            attributes: { exclude: ['refresh_token', 'phone'] },
            raw: true,
        })

        if (!user) {
            user = await User.create({
                name: payload?.name,
                image: payload?.picture,
                email: payload?.email,
                is_auth: 1,
            })
            user = user.get({ plain: true })

            if (!user) {
                return res.status(400).json({ message: 'Cannot register account for this email' })
            }
        }

        delete user.password
        const { accessToken, refreshToken } = await generateTokens({ ...user, image: '' })

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            accessToken,
            refreshToken,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { register, login, getNewToken, verify, logout, googleLogin }
