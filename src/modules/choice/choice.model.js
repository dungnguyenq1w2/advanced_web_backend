module.exports = (Sequelize, DataTypes) => {
    const Choice = Sequelize.define(
        'Choice',
        {
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            question_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'choice',
        },
        {
            freezeTableName: true,
        }
    )

    Choice.associate = (models) => {
        // Associate Question(1) - Choice(*)
        Choice.belongsTo(models.Question, {
            foreignKey: 'question_id',
            as: 'question',
        })

        // Associate Choice(1) - User_Choice(*)
        Choice.hasMany(models.User_Choice, {
            foreignKey: 'choice_id',
            as: 'user_choices',
        })
    }

    return Choice
}
