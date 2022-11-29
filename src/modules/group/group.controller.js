const db = require('#common/database/index.js')

const bcrypt = require('bcrypt')

const mailer = require('#root/utils/mailer.js')
const { htmlContent } = require('#common/config/mail.config.js')
const { htmlContentInviteGroup } = require('#common/config/mail.config.js')
const { encryptString, decryptString } = require('#root/utils/crypto.js')

// Create main Model
const Group = db.Group
const User_Group = db.User_Group
const User = db.User
const Role = db.Role

// Main work

const getAllGroup = async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: {
                model: User_Group,
                as: 'participants',
                where: { user_id: req.user.id },
            },
        })
        for (const group of groups) {
            const size = await User_Group.count({
                where: { group_id: group.dataValues.id },
            })

            group.dataValues['my_role'] = group.dataValues.participants[0].role_id
            group.dataValues['group_size'] = size
        }
        return res.status(200).send({ data: groups })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getGroup = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
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
        group.dataValues['my_role'] = meInGroup.dataValues.role_id
        return res.status(200).send({
            data: group,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addGroup = async (req, res) => {
    try {
        const addGroup = req.body
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
    try {
        const id = parseInt(req.params.id)
        const updatedGroup = req.body

        const group = await Group.update(updatedGroup, { where: { id: id } })

        res.status(200).send({ data: group })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const deleteGroup = async (req, res) => {
    try {
        const id = req.params.id

        await Group.destroy({ where: { id: id } })

        res.status(200).send({ message: `Group is deleted` })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const generateGroupInviteCode = (req, res) => {
    try {
        const groupId = req.params.id

        if (!groupId) {
            return res.status(400).json({ message: 'Cannot generate group-invite link' })
        }

        const encryptedString = encryptString(groupId)

        return res.status(200).json({ code: encryptedString })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
const joinGroupByLink = async (req, res) => {
    try {
        const userId = parseInt(req.user.id)
        const code = req.params.code

        const decryptedGroupId = parseInt(decryptString(code))

        const userGroup = await User_Group.findOne({
            where: {
                user_id: userId,
                group_id: decryptedGroupId,
            },
        })

        if (!userGroup) {
            const newUserGroup = await User_Group.create({
                user_id: userId,
                group_id: decryptedGroupId,
                role_id: 3,
            })
            return res.status(200).json({
                user: newUserGroup,
                groupId: decryptedGroupId,
            })
        }

        return res.status(200).json({
            user: userGroup,
            groupId: decryptedGroupId,
        })
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

const joinGroupByEmail = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id)
        const userId = parseInt(req.user.id)
        const userEmail = req.user.email
        const { email, token } = req.body

        if (userEmail !== email) {
            return res.status(400).json({
                message: 'You are not the user invited',
            })
        } else {
            await bcrypt.compare(
                email + process.env.REFRESH_TOKEN_SECRET,
                token,
                async (err, result) => {
                    if (result) {
                        const userGroup = await User_Group.findOne({
                            where: {
                                user_id: userId,
                                group_id: groupId,
                            },
                        })

                        if (!userGroup) {
                            const newUserGroup = await User_Group.create({
                                user_id: userId,
                                group_id: groupId,
                                role_id: 3,
                            })
                            return res.status(200).json({
                                user: newUserGroup,
                            })
                        }

                        return res.status(200).json({
                            user: userGroup,
                        })
                    } else {
                        console.log(err)
                        return res.status(404).json({ status: 404, message: 'Error token' })
                    }
                }
            )
        }
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

const sendInvitationByEmail = async (req, res) => {
    try {
        const emails = req.body.emails
        const groupId = parseInt(req.params.id)

        const group = await Group.findByPk(groupId)
        for (const email of emails) {
            await bcrypt
                .hash(email.email + process.env.REFRESH_TOKEN_SECRET, parseInt(process.env.SALT))
                .then(async (hashedEmail, error) => {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({ message: 'Bcrypt failed' })
                    }
                    await mailer.sendMail(
                        email.email,
                        `Invite Group [${group.dataValues.name}]`,
                        htmlContentInviteGroup(groupId, email.email, hashedEmail)
                    )
                })
        }
    } catch (error) {
        console.log('Error:', error)
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

const promoteParticipant = async (req, res) => {
    try {
        const userId = parseInt(req.body.userId)
        const groupId = parseInt(req.params.id)
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
                },
                {
                    where: { id: userGroup.dataValues.id },
                }
            )

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
    try {
        const userId = parseInt(req.body.userId)
        const groupId = parseInt(req.params.id)
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
    try {
        const userId = parseInt(req.body.userId)
        const groupId = parseInt(req.params.id)

        await User_Group.destroy({
            where: {
                user_id: userId,
                group_id: groupId,
            },
        })

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

const setOwner = async (req, res) => {
    try {
        const currentOwnerId = parseInt(req.body.currentOwnerId)
        const selectedUserId = parseInt(req.body.selectedUserId)
        const groupId = parseInt(req.params.id)

        // selected participant become owner
        await User_Group.update(
            { role_id: 1 },
            {
                where: {
                    user_id: selectedUserId,
                    group_id: groupId,
                },
            }
        )
        // owner become co-owner
        await User_Group.update(
            { role_id: 2 },
            {
                where: {
                    user_id: currentOwnerId,
                    group_id: groupId,
                },
            }
        )
        return res.status(200).json({
            message: 'Set owner successfully',
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
    sendInvitationByEmail,
    joinGroupByEmail,
    demoteParticipant,
    promoteParticipant,
    kickOutParticipant,
    setOwner,
    generateGroupInviteCode,
}
