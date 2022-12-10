module.exports = (Sequelize, DataTypes) => {
    const Choice = Sequelize.define(
        'Choice',
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
            tableName: 'choice',
        }
    )

    Choice.associate = (models) => {
        // Associate Slide(1) - Choice(*)
        Choice.belongsTo(models.Slide, {
            foreignKey: 'slide_id',
            as: 'slide',
        })

        // Associate Choice(1) - User_Choice(*)
        Choice.hasMany(models.User_Choice, {
            foreignKey: 'choice_id',
            as: 'user_choices',
        })
    }

    return Choice
}
