const bcrypt = require('bcrypt')

const db = require('#common/database/index.js')
const mailer = require('#root/utils/mailer.js')
const { htmlContent } = require('#common/config/mailConfig.js')
const { generateAccessToken, generateTokens, verifyRefreshToken } = require('#root/utils/token.js')
const {
    loginBodyValidation,
    refreshTokenBodyValidation,
    registerBodyValidation,
} = require('#root/utils/validation.js')

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
                .then(async (error, hashedEmail) => {
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
        if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại' })

        const verifiedPassword = await bcrypt.compare(loginUser.password, user.password)
        if (!verifiedPassword) return res.status(400).json({ message: 'Sai mật khẩu' })

        delete user.password
        const { accessToken, refreshToken } = await generateTokens({ ...user, image: '' })
        // console.log('🚀 ~ refreshToken', refreshToken)

        if (!user.is_auth) return res.status(401).json({ message: 'Chưa xác thực tài khoản' })

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

module.exports = { register, login, getNewToken, verify, logout }
