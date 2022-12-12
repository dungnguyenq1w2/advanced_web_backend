const db = require('#common/database/index.js')
const sequelize = require('sequelize')

// Create main Model
const Choice = db.Choice
const User_Choice = db.User_Choice

// Main work

const getAllChoices = async (req, res) => {
    try {
        const slideId = parseInt(req.body.slideId)

        const choices = await Choice.findAll({
            where: {
                slide_id: slideId,
            },
        })

        return res.status(200).json({ data: choices })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getChoiceById = async (req, res) => {
    try {
        const choiceId = parseInt(req.params.choiceId)

        const choice = await Choice.findByPk(choiceId)

        return res.status(200).json({ data: choice })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getAllChoices,
    getChoiceById,
}
