const db = require('#common/database/index.js')
// Create main Model
const Presentation = db.Presentation
const User = db.User

// Main work

const getAllPresentaionOfOneUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId)
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

module.exports = { getAllPresentaionOfOneUser }
