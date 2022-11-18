const bcrypt = require('bcrypt')

const db = require('#common/database/index.js')
const mailer = require('#root/utils/mailer.js')
const { htmlContent } = require('../../common/config/mailConfig')
const { generateAccessToken, generateTokens, verifyRefreshToken } = require('#root/utils/token.js')
const {
    loginBodyValidation,
    refreshTokenBodyValidation,
    registerBodyValidation,
} = require('#root/utils/validation.js')

const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})
// create main Model
const User = db.User

// main work

const register = async (req, res) => {
    const userRegister = req.body
    try {
        const { errors } = await registerBodyValidation(userRegister)

        if (errors) res.status(400).json({ message: errors[0] })

        const user = await User.findOne({ where: { email: userRegister.email } })
        if (user) res.status(409).json({ message: 'Tài khoản đã tồn tại' })

        const salt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(userRegister.password, salt)

        const addUser = await User.create({ ...userRegister, password: hashPassword })
        if (addUser) {
            const resultUser = { id: addUser.id, name: addUser.name, email: addUser.email }
            bcrypt.hash(addUser.email, parseInt(process.env.SALT)).then((hashedEmail) => {
                console.log(
                    `${process.env.APP_URL}/verify?email=${user.email}&token=${hashedEmail}`
                )
                mailer.sendMail(user.email, 'Verify Email', htmlContent(addUser.email, hashedEmail))
            })
            res.status(201).json({
                data: resultUser,
                message: 'Đăng ký thành công',
            })
        } else res.status(500).json({ message: 'Internal Server Error' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const login = async (req, res) => {
    const loginUser = req.body
    try {
        const { errors } = await loginBodyValidation(loginUser)

        if (errors) res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { email: loginUser.email },
            raw: true,
        })
        if (!user) res.status(400).json({ message: 'Tài khoản không tồn tại' })

        const verifiedPassword = await bcrypt.compare(loginUser.password, user.password)
        if (!verifiedPassword) res.status(400).json({ message: 'Sai mật khẩu' })

        delete user.password
        const { accessToken, refreshToken } = await generateTokens(loggedUser)

        if (!user.is_auth) res.status(401).json({ message: 'Chưa xác thực tài khoản' })

        res.status(200).json({
            accessToken,
            refreshToken,
            id: user.id,
            name: user.name,
            email: user.email,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getNewToken = async (req, res) => {
    const token = req.body

    const { errors } = await refreshTokenBodyValidation(token)
    if (errors) res.status(400).json({ message: errors[0] })

    verifyRefreshToken(token.refreshToken)
        .then(async ({ tokenDetails }) => {
            const user = { id: tokenDetails.id, name: tokenDetails.name }
            const accessToken = await generateAccessToken(user)

            res.status(200).json({
                accessToken,
                message: 'Access token created successfully',
            })
        })
        .catch((err) => res.status(400).json(err)) // Refresh token was expired
}

const verify = async (req, res) => {}

const logout = async (req, res) => {
    const token = req.body

    try {
        const { errors } = await refreshTokenBodyValidation(token)
        if (errors) res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { refresh_token: token.refreshToken },
            raw: true,
        })
        if (!user) res.status(200).json({ message: 'Đăng xuất thành công' })

        await User.update({ refresh_token: '' }, { where: { id: user.id } })
        res.status(200).json({ message: 'Đăng xuất thành công' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const googleLogin = async (req, res) => {
    const { token } = req.body

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    let user = await User.findOne({ email: payload?.email })
    if (!user) {
        //     user = await new User({
        //         name: payload?.name,
        //         image: payload?.picture,
        //         email: payload?.email,
        //     })
        // await user.save()
        user = await User.create({
            name: payload?.name,
            image: payload?.picture,
            email: payload?.email,
        })
    }

    res.status(200).json({
        user: { name: user.name, email: user.email, image: user.image },
        token,
    })
}

module.exports = { register, login, getNewToken, verify, logout, googleLogin }
