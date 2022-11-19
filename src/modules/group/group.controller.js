const db = require('#common/database/index.js')

// Create main Model
const Group = db.Group
const User_Group = db.User_Group
const User = db.User
// Main work

const getAllGroup = async (req, res) => {
    const groups = await Group.findAll({ attributes: ['id', 'name', 'phone', 'image', 'email'] })

    res.status(200).send({ data: groups })
}

const getGroup = async (req, res) => {
    try {
        const id = req.params.id
        const isGroup = await Group.findOne({
            where: { id: id },
        })
        if (!isGroup) return res.status(404).json({ status: 404, message: "Group doesn't existed" })
        const group = await Group.findByPk(id, {
            include: {
                model: User_Group,
                as: 'participants',
                required: true,
                right: true,
                attributes: ['id', 'role_id'],
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'image'],
                    raw: true,
                },
                raw: true,
            },
        })

        const meInGroup = group.dataValues.participants.find(
            (participant) => participant.user.id === req.user.id
        )
        group.dataValues['role'] = meInGroup.dataValues.role_id
        return res.status(200).send({
            data: group,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
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
