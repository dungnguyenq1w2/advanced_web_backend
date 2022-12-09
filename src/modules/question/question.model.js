module.exports = (Sequelize, DataTypes) => {
    const Question = Sequelize.define(
        'Question',
        {
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slide_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'question',
        }
    )

    Question.associate = (models) => {
        // Associate Slide(1) - Question(*)
        Question.belongsTo(models.Slide, {
            foreignKey: 'slide_id',
            as: 'slide',
        })

        // Associate Question(1) - Choice(*)
        Question.hasMany(models.Choice, {
            foreignKey: 'question_id',
            as: 'choices',
        })
    }

    return Question
}
