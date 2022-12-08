module.exports = (Sequelize, DataTypes) => {
    const Group = Sequelize.define(
        'Group',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'group',
        },
        {
            freezeTableName: true,
        }
    )
    Group.associate = (models) => {
        // Associate Group(1) - User_Group(*)
        Group.hasMany(models.User_Group, {
            foreignKey: 'group_id',
            as: 'participants',
        })

        // Associate Group(1) - Presentation(*)
        Group.hasMany(models.Presentation, {
            foreignKey: 'group_id',
            as: 'presentations',
        })
    }
    return Group
}
