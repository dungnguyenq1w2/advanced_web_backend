const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const Slide = db.Slide
const User = db.User
const Choice = db.Choice
const User_Choice = db.User_Choice

// Main work

const getAllPresentaionOfOneUser = async (req, res) => {
    try {
        const userId = req.user.id
        const presentations = await Presentation.findAll({
            where: {
                host_id: userId,
            },
        })
        return res.status(200).json({ data: presentations })
    } catch (error) {
        console.log(error)
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

        const presentation = await Presentation.create({ host_id: hostId, code: code, name: name })

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

const getAllSlides = async (req, res) => {
    try {
        const presentationId = parseInt(req.params.presentationId)
        if (!presentationId) return res.status(400)

        const slides = await Presentation.findByPk(presentationId, {
            attributes: ['id', 'host_id', 'code'],
            include: {
                model: Slide,
                as: 'slides',
                attributes: ['id'],
            },
        })

        return res.status(200).json({ data: slides })
    } catch (error) {
        console.log('🚀 ~ error', error)
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

const updatePresentationName = async (req, res) => {
    try {
        const { presentationId, name } = req.body
        if (!presentationId || !name) return res.status(400)

        const [row] = await Presentation.update({ name: name }, { where: { id: presentationId } })
        if (row > 0) 
            return res.status(200).json({ data: name })
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

module.exports = {
    getAllPresentaionOfOneUser,
    getAllSlides,
    deletePresentationById,
    checkCode,
    addPresentation,
    getPresentationById,
    updatePresentationName,
    createPresentationCode,
}
