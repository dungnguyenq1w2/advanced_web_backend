module.exports = (Sequelize, DataTypes) => {
    const Question = Sequelize.define(
        'Question',
        {
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            vote: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            is_marked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            presentation_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_at: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'question',
        }
    )
    Question.associate = (models) => {
        // Associate User(1) - Question(*)
        Question.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        })
        // Associate Presentation(1) - Question(*)
        Question.belongsTo(models.Presentation, {
            foreignKey: 'presentation_id',
            as: 'presentation',
        })
        // Associate Question(1) - Answer(*)
        Question.hasMany(models.Answer, {
            foreignKey: 'question_id',
            as: 'answers',
        })
        // Associate Question(1) - Vote(*)
        Question.hasMany(models.Vote, {
            foreignKey: 'question_id',
            as: 'votes',
        })
    }
    return Question
}
