const db = require('#common/database/index.js')

// Create main Model
const Group = db.Group
const User_Group = db.User_Group

// Main work

const getAllGroup = async (req, res) => {
    const groups = await Group.findAll({ attributes: ['id', 'name', 'phone', 'image', 'email'] })

    res.status(200).send({ data: groups })
}

const getGroup = async (req, res) => {
    const id = req.params.id
    if (id != '0') {
        const group = await Group.findByPk(id, {
            include: {
                model: User_Group,
                as: 'participants',
            },
        })
        const meInGroup = group.dataValues.participants.find(
            (participant) => participant.user_id === req.user.id
        )
        group.dataValues['role'] = meInGroup.dataValues.role_id
        res.status(200).send({
            data: group,
        })
    }
}

const addGroup = async (req, res) => {
    const addGroup = req.body
    try {
        const group = await Group.create(addGroup)
        const addUserGroup = {
            user_id: req.user.id,
            role_id: 1,
            group_id: group.dataValues.id,
        }
        await User_Group.create(addUserGroup)
        return res.status(201).send({ data: group })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
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
