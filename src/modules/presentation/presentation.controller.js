const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const User = db.User

// Main work

const getAllPresentaion = async (req, res) => {
    const presentation = await Presentation.findAll({
        include: {
            model: User,
            as: 'host',
        },
    })
    res.status(200).json({ data: presentation })
}

module.exports = { getAllPresentaion }
