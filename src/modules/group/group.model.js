module.exports = (Sequelize, DataTypes) => {
    const Group = Sequelize.define(
        'Group',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'group',
        }
    )
    // Group.associate = (models) => {
    //     // Associate Group(1) - Account(1)
    //     Group.hasOne(models.Account, {
    //         foreignKey: 'user_id',
    //         as: 'account',
    //     })
    // }
    return Group
}
