module.exports = (Sequelize, DataTypes) => {
    const User_Group = Sequelize.define(
        'User_Group',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'user_group',
        }
    )
    return User_Group
}
