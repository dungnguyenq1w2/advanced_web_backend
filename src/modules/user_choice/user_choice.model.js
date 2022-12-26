module.exports = (Sequelize, DataTypes) => {
    const User_Choice = Sequelize.define(
        'User_Choice',
        {
            member_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            choice_id: {
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
            tableName: 'user_choice',
        }
    )

    User_Choice.associate = (models) => {
        // Associate User(1) - User_Choice(*)
        User_Choice.belongsTo(models.User, {
            foreignKey: 'member_id',
            as: 'member',
            constraints: false,
        })
        // Associate Choice(1) - User_Choice(*)
        User_Choice.belongsTo(models.Choice, {
            foreignKey: 'choice_id',
            as: 'choice',
        })
    }

    return User_Choice
}
