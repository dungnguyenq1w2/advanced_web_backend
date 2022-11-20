const db = require('#common/database/index.js')

// Create main Model
const Group = db.Group
const User_Group = db.User_Group
const Role = db.Role

// Main work

const getAllGroup = async (req, res) => {
    console.log('tests:', req.user.id)
    const groups = await Group.findAll({
        include: {
            model: User_Group,
            as: 'participants',
            // where: { user_id: req.user.id },
            where: { user_id: req.user.id },

            // include: ['role'],
            // include: {
            //     model: Role,
            //     as: 'role',
            // },
        },
    })
    for (const group of groups) {
        // const meInGroup = group.dataValues.participants.find(
        //     (participant) => participant.user_id === req.user.id
        // )
        // if (meInGroup) {
        //     group.dataValues['my_role'] = meInGroup.dataValues.role_id
        //     group.dataValues['group_size'] = group.dataValues.participants.length
        // }

        const size = await User_Group.count({
            where: { group_id: group.dataValues.id },
        })

        group.dataValues['my_role'] = group.dataValues.participants[0].role_id
        group.dataValues['group_size'] = size
        // console.log(group)
    }

    res.status(200).send({ data: groups })
}

// const getUserGroups = async (req, res) => {
//     const userId = req.params.userId
//     const userGroups = await Group.findAll({ include: [User] })
// }

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

const joinGroupByLink = async () => {
    const groupId = req.params.groupId
    const userId = req.params.userId
}

module.exports = { getAllGroup, getGroup, addGroup, updateGroup, deleteGroup }
