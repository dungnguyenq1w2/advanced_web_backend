module.exports = (Sequelize, DataTypes) => {
    const Answer = Sequelize.define(
        'Answer',
        {
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            question_id: {
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
            tableName: 'answer',
        }
    )
    Answer.associate = (models) => {
        // Associate User(1) - Answer(*)
        Answer.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            constraints: false,
        })
        // Associate Question(1) - Answer(*)
        Answer.belongsTo(models.Question, {
            foreignKey: 'question_id',
            as: 'question',
        })
    }
    return Answer
}
