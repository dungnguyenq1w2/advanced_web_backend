const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const Presentation_Group = db.Presentation_Group
const Slide = db.Slide
const Group = db.Group
const Choice = db.Choice
const User_Choice = db.User_Choice
const User_Group = db.User_Group

// Main work

const getAllPresentaionOfOneUser = async (req, res) => {
    try {
        const userId = req.user.id
        const presentations = await Presentation.findAll({
            where: {
                owner_id: userId,
            },
        })

        return res.status(200).json({ data: presentations })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getAllPresentationOfGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId

        if (!groupId) return res.status(400).json({ message: 'Invalid group id' })

        const presentations = await Presentation_Group.findAll({
            where: {
                group_id: groupId,
            },
            include: {
                model: Presentation,
                as: 'presentation',
                attributes: ['id', 'name', 'code', 'is_presenting'],
            },
        })
        return res.status(200).json({ data: presentations })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getPresentationById = async (req, res) => {
    try {
        const { presentationId } = req.params
        if (!presentationId) return res.status(400)

        const presentation = await Presentation.findOne({
            where: { id: presentationId },
            raw: true,
        })

        if (presentation) return res.status(200).json({ data: presentation })
        return res.status(400).json({ data: { status: false } })
    } catch (error) {
        console.log('Error getPresentationById: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getPresentationForHostById = async (req, res) => {
    try {
        const presentationId = parseInt(req.params?.presentationId)
        const presentationGroupId = parseInt(req.query?.presentationGroupId)
        const userId = parseInt(req?.user?.id)

        if (!(presentationId && userId)) return res.status(400)

        const presentation = await Presentation.findByPk(presentationId, {
            attributes: ['id', 'owner_id', 'code'],
            include: {
                model: Slide,
                as: 'slides',
                attributes: ['id', 'type'],
            },
        })

        //#region Check permission
        presentation.dataValues.permission = {
            isAllowed: false,
        }
        if (userId === parseInt(presentation.dataValues.owner_id)) {
            presentation.dataValues.permission.isAllowed = true
        } else {
            // Check permission for presenting in group
            if (presentationGroupId) {
                const group = await Group.findAll({
                    where: {
                        '$presentation_groups.id$': presentationGroupId,
                    },
                    include: [
                        {
                            model: Presentation_Group,
                            as: 'presentation_groups',
                            required: true,
                        },
                    ],
                })
                const co_owners = await User_Group.findAll({
                    where: {
                        group_id: group[0].dataValues.id,
                        role_id: 2,
                    },
                    attributes: ['id', 'user_id'],
                })
                if (co_owners.find((co_owner) => co_owner.user_id === userId)) {
                    presentation.dataValues.permission.isAllowed = true
                } else {
                    // presenting in public
                    presentation.dataValues.permission.message =
                        'You are not co-owner of this presentation in group'
                }
            } else {
                // presenting in public
                presentation.dataValues.permission.message = 'You are not host of this presentation'
            }
        }
        //#endregion

        return res.status(200).json({ data: presentation })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getPresentationForMemberById = async (req, res) => {
    try {
        const presentationId = parseInt(req.params?.presentationId)
        const presentationGroupId = parseInt(req.query?.presentationGroupId)
        const userId = parseInt(req.query?.userId)

        if (!presentationId) return res.status(400)

        //#region Check permission
        const permission = {
            isAllowed: false,
        }
        // Check permission for presenting in group
        if (presentationGroupId) {
            if (!userId) {
                permission.message = 'You must be a member in group to access this presentation'
            } else {
                // Phải dùng findAll khi tìm kiếm quan hệ
                const group = await Group.findAll({
                    where: {
                        '$presentation_groups.id$': presentationGroupId,
                    },
                    include: [
                        {
                            model: Presentation_Group,
                            as: 'presentation_groups',
                            required: true,
                        },
                    ],
                })
                const user = await User_Group.findOne({
                    where: {
                        group_id: group[0].dataValues.id,
                        user_id: userId,
                    },
                    attributes: ['id', 'user_id'],
                })
                if (user?.dataValues?.id) {
                    permission.isAllowed = true
                } else {
                    permission.message = 'You are not a member of this presentation'
                }
            }
        } else {
            permission.isAllowed = true
        }
        //#endregion

        if (permission.isAllowed === false) {
            return res.status(200).json({ data: { permission } })
        } else {
            const presentation = await Presentation.findByPk(presentationId, {
                attributes: ['id', 'owner_id', 'code'],
                include: {
                    model: Slide,
                    as: 'slides',
                    attributes: ['id', 'type'],
                },
            })
            presentation.dataValues.permission = permission

            return res.status(200).json({ data: presentation })
        }
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const checkCode = async (req, res) => {
    try {
        const { code } = req.body
        if (!code) return res.status(400)

        const presentation = await Presentation.findOne({ where: { code: code }, raw: true })
        if (presentation) return res.status(200).json({ data: presentation })
        return res.status(400).json({ data: { status: false } })
    } catch (error) {
        console.log('Error checkCode: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addPresentation = async (req, res) => {
    try {
        const { hostId, name } = req.body
        if (!hostId || !name) return res.status(400)

        const codes = await Presentation.findAll({
            attributes: ['code'],
            raw: true,
        })
        var code = null
        do {
            code = '' + Math.floor(Math.random() * 100000000)
            while (code.length < 8) code = '0' + code
        } while (codes.includes(code))

        const presentation = await Presentation.create({ owner_id: hostId, code: code, name: name })

        return res.status(200).json({ data: presentation })
    } catch (error) {
        console.log('Error addPresentation: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const deletePresentationById = async (req, res) => {
    try {
        const presentationId = parseInt(req.params.presentationId)
        if (!presentationId) return res.status(400)

        const presentation = await Presentation.findByPk(presentationId, {
            attributes: ['id'],
            include: {
                model: Slide,
                as: 'slides',
                attributes: ['id', 'presentation_id'],
                raw: true,
                include: {
                    model: Choice,
                    as: 'choices',
                    attributes: ['id', 'slide_id'],
                    raw: true,
                },
            },
        })

        if (presentation && presentation.slides != null) {
            for (let slide of presentation.slides) {
                if (slide.choices != null)
                    for (let choice of slide.choices)
                        await User_Choice.destroy({
                            where: {
                                choice_id: choice.id,
                            },
                        })

                await Choice.destroy({
                    where: {
                        slide_id: slide.id,
                    },
                })
            }

            await Slide.destroy({
                where: {
                    presentation_id: presentation.id,
                },
            })
        }

        if (presentation) {
            await Presentation.destroy({
                where: {
                    id: presentation.id,
                },
            })
            return res.status(200).json({ data: { status: true } })
        } else return res.status(403).json({ data: { status: false } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const updatePresentationName = async (req, res) => {
    try {
        const { presentationId, name } = req.body
        if (!presentationId || !name) return res.status(400)

        const [row] = await Presentation.update({ name: name }, { where: { id: presentationId } })
        if (row > 0) return res.status(200).json({ data: name })
        return res.status(400).json()
    } catch (error) {
        console.log('Error updatePresentationName: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const createPresentationCode = async (req, res) => {
    try {
        const presentationId = parseInt(req.params.presentationId)
        if (!presentationId) return res.status(400)

        const codes = await Presentation.findAll({
            attributes: ['code'],
            raw: true,
        })
        var code = null
        do {
            code = '' + Math.floor(Math.random() * 100000000)
            while (code.length < 8) code = '0' + code
        } while (codes.includes(code))

        const [row] = await Presentation.update({ code: code }, { where: { id: presentationId } })

        if (row > 0) return res.status(200).json({ data: code })
        return res.status(400)
    } catch (error) {
        console.log('Error createPresentationCode: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const addPresentationToGroup = async (req, res) => {}

const getActivePresentationsOfGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId

        if (!groupId) return res.status(400).json({ message: 'Invalid group id' })

        const presentations = await Presentation_Group.findAll({
            where: {
                group_id: groupId,
            },
            include: {
                model: Presentation,
                as: 'presentation',
                attributes: ['id', 'name', 'code', 'is_presenting'],
                where: {
                    is_presenting: 1,
                },
            },
        })

        console.log(presentations)

        return res.status(200).json({ data: presentations })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getAllPresentaionOfOneUser,
    getAllPresentationOfGroup,
    getPresentationForHostById,
    getPresentationForMemberById,
    deletePresentationById,
    checkCode,
    addPresentation,
    getPresentationById,
    updatePresentationName,
    createPresentationCode,
    getActivePresentationsOfGroup,
}
