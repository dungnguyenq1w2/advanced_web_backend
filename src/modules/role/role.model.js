module.exports = (Sequelize, DataTypes) => {
    const Role = Sequelize.define(
        'Role',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'role',
        }
    )
    // Role.associate = (models) => {
    //     // Associate Role(1) - Account(1)
    //     Role.hasOne(models.Account, {
    //         foreignKey: 'user_id',
    //         as: 'account',
    //     })
    // }
    return Role
}
