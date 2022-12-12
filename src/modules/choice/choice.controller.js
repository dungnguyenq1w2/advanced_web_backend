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

const addChoice = async (req, res) => {
    try {
        const newChoice = req.body
        const choice = await Choice.create(newChoice)

        return res.status(201).send({ data: choice })
    } catch (error) {
        console.log('🚀 ~ error', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const updateChoice = async (req, res) => {
    try {
        const choiceId = parseInt(req.params.choiceId)
        const newChoice = req.body

        const choice = await Choice.update(newChoice, { where: { id: choiceId } })

        res.status(200).send({ data: choice })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const deleteChoice = async (req, res) => {
    try {
        const choiceId = req.params.choiceId

        await Choice.destroy({ where: { id: choiceId } })

        res.status(200).send({ message: `Choice is deleted` })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getAllChoices,
    getChoiceById,
    addChoice,
    updateChoice,
    deleteChoice,
}
