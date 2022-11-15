const db = require('#common/database/index.js')

// Create main Model
const User = db.User

// Main work

const getAllUser = async (req, res) => {
    const users = await User.findAll({ attributes: ['id', 'name', 'phone', 'image', 'email'] })

    res.status(200).send({ data: users })
}

const getUser = async (req, res) => {
    const id = req.params.id
    if (id != '0') {
        const user = await User.findByPk(id, {
            include: {
                model: Account,
                as: 'account',
            },
        })

        res.status(200).send({
            data: {
                id: user.dataValues.id,
                name: user.dataValues.name,
                username: user.dataValues.account.dataValues.username,
            },
        })
    }
}

const addUser = async (req, res) => {
    const addUser = req.body

    const user = await User.create(addUser)

    res.status(201).send({ data: user })
}

const updateUser = async (req, res) => {
    const id = req.params.id
    const updatedUser = req.body

    const user = await User.update(updatedUser, { where: { id: id } })

    res.status(200).send({ data: user })
}

const deleteUser = async (req, res) => {
    const id = req.params.id

    await User.destroy({ where: { id: id } })

    res.status(200).send({ message: `User is deleted` })
}

module.exports = { getAllUser, getUser, addUser, updateUser, deleteUser }
