const db = require('#common/database/index.js')

// Create main Model
const Group = db.Group
const User = db.User

// Main work

const getAllGroup = async (req, res) => {
    const groups = await Group.findAll({ attributes: ['id', 'name'] })

    res.status(200).send({ data: groups })
}

const getUserGroups = async (req, res) => {
    const userId = req.params.userId
    const userGroups = await Group.findAll({ include: [User] })
}

const getGroup = async (req, res) => {
    const id = req.params.id
    if (id != '0') {
        const group = await Group.findByPk(id, {
            include: {
                model: Account,
                as: 'account',
            },
        })

        res.status(200).send({
            data: {
                id: group.dataValues.id,
                name: group.dataValues.name,
                groupname: group.dataValues.account.dataValues.groupname,
            },
        })
    }
}

const addGroup = async (req, res) => {
    const addGroup = req.body

    const group = await Group.create(addGroup)

    res.status(201).send({ data: group })
}

const updateGroup = async (req, res) => {
    const id = req.params.id
    const updatedGroup = req.body

    const group = await Group.update(updatedGroup, { where: { id: id } })

    res.status(200).send({ data: group })
}

const deleteGroup = async (req, res) => {
    const id = req.params.id

    await Group.destroy({ where: { id: id } })

    res.status(200).send({ message: `Group is deleted` })
}

module.exports = { getAllGroup, getGroup, addGroup, updateGroup, deleteGroup }
