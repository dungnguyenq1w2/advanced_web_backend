const db = require('#common/database/index.js')

// Create main Model
const Group = db.Group
const User_Group = db.User_Group
const User = db.User
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

const joinGroupByLink = async (req, res) => {
    const userId = req.user.id
    const groupId = req.params.id

    try {
        const [userGroup, created] = await User_Group.findOrCreate({
            where: {
                user_id: userId,
                group_id: groupId,
            },
            default: {
                user_id: userId,
                group_id: groupId,
                role_id: 3,
            },
        })

        // is_created:
        //      + true: user NOT JOINED group before --> Now user JOINED
        //      + false: user JOINED group before
        return res.status(200).json({
            is_created: created,
        })
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

const promoteParticipant = async (req, res) => {
    const userId = req.body.userId
    const groupId = req.params.id

    try {
        const userGroup = await User_Group.findOne({
            where: {
                user_id: userId,
                group_id: groupId,
            },
        })

        if (userGroup.dataValues.role_id == 3) {
            const promotedUserGroup = await User_Group.update(
                {
                    ...userGroup,
                    role_id: userGroup.dataValues.role_id - 1,
                    // role_id: Math.min(2, userGroup.dataValues.role_id - 1),
                },
                {
                    where: { id: userGroup.dataValues.id },
                }
            )
            // await userGroup.update({})

            return res.status(200).json({
                message: 'Promoted successfully',
            })
        } else {
            return res.status(400).json({
                message: 'Can not promote this participant',
            })
        }
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}
const demoteParticipant = async (req, res) => {
    const userId = req.body.userId
    const groupId = req.params.id

    try {
        const userGroup = await User_Group.findOne({
            where: {
                user_id: userId,
                group_id: groupId,
            },
        })

        if (userGroup.dataValues.role_id == 2) {
            const demotedUserGroup = await User_Group.update(
                {
                    ...userGroup,
                    role_id: userGroup.dataValues.role_id + 1,
                },
                {
                    where: { id: userGroup.dataValues.id },
                }
            )
            // await userGroup.update({})
            return res.status(200).json({
                message: 'Demoted successfully',
            })
        } else if (userGroup.dataValues.role_id == 3) {
            await User_Group.destroy({
                where: { id: userGroup.dataValues.id },
            })
            return res.status(200).json({
                message: 'Kicked out successfully',
            })
        } else {
            return res.status(400).json({
                message: 'Can not demote this participant',
            })
        }
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

const kickOutParticipant = async (req, res) => {
    const userId = req.body.userId
    const groupId = req.params.id

    try {
        await User_Group.destroy({
            where: {
                user_id: userId,
                group_id: groupId,
            },
        })
        // await userGroup.update({})

        return res.status(200).json({
            message: 'Kicked out successfully',
        })
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

module.exports = {
    getAllGroup,
    getGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    joinGroupByLink,
    demoteParticipant,
    promoteParticipant,
    kickOutParticipant,
}
