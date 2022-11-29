const db = require('#common/database/index.js')
const cloudinary = require('../../utils/cloudinary')
// Create main Model
const User = db.User

// Main work

const getAllUser = async (req, res) => {
    const users = await User.findAll({ attributes: ['id', 'name', 'phone', 'image', 'email'] })

    res.status(200).json({ data: users })
}

const getUser = async (req, res) => {
    const id = req.params.id
    if (id != '0') {
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'phone', 'image', 'email'],
        })

        res.status(200).json({
            data: user,
        })
    }
}

const addUser = async (req, res) => {
    const addUser = req.body

    const user = await User.create(addUser)

    res.status(201).json({ data: user })
}

const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        const dataUser = req.body

        if (dataUser.image) dataUser.image = await cloudinary.uploadImage(dataUser.image)
        const [row] = await User.update(dataUser, { where: { id: id } })
        if (row > 0) {
            const user = await User.findByPk(id, { attributes: ['id', 'name', 'image', 'email'] })
            return res.status(200).json({ data: user })
        } else {
            return res.status(400).json({ message: 'failed' })
        }
    } catch (error) {
        console.log('err: ', error)
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id

    await User.destroy({ where: { id: id } })

    res.status(200).send({ message: `User is deleted` })
}

module.exports = { getAllUser, getUser, addUser, updateUser, deleteUser }
