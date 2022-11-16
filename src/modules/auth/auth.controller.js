const bcrypt = require('bcrypt')

const db = require('#common/database/index.js')

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
        const resultUser = { id: addUser.id, name: addUser.name, email: addUser.email }
        res.status(201).json({
            data: resultUser,
            message: 'Đăng ký thành công',
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const login = async (req, res) => {
    const loginUser = req.body
    try {
        const { errors } = await loginBodyValidation(loginUser)

        if (errors) return res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { email: loginUser.email },
            raw: true,
        })
        if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại' })

        const verifiedPassword = await bcrypt.compare(loginUser.password, user.password)
        if (!verifiedPassword) return res.status(400).json({ message: 'Sai mật khẩu' })

        const loggedUser = await User.findByPk(user.id, {
            attributes: ['id', 'name', 'email'],
            raw: true,
        })
        const { accessToken, refreshToken } = await generateTokens(loggedUser)

        res.status(200).json({
            accessToken,
            refreshToken,
            name: loggedUser.name,
            email: loggedUser.email,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getNewToken = async (req, res) => {
    const token = req.body

    const { errors } = await refreshTokenBodyValidation(token)
    if (errors) return res.status(400).json({ message: errors[0] })

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

const logout = async (req, res) => {
    const token = req.body

    try {
        const { errors } = await refreshTokenBodyValidation(token)
        if (errors) return res.status(400).json({ message: errors[0] })

        const user = await User.findOne({
            where: { refresh_token: token.refreshToken },
            raw: true,
        })
        if (!user) return res.status(200).json({ message: 'Đăng xuất thành công' })

        await User.update({ refresh_token: '' }, { where: { id: user.id } })
        res.status(200).json({ message: 'Đăng xuất thành công' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { register, login, getNewToken, logout }
