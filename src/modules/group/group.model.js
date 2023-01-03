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
            created_at: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'group',
        }
    )
    Group.associate = (models) => {
        // Associate Group(1) - User_Group(*)
        Group.hasMany(models.User_Group, {
            foreignKey: 'group_id',
            as: 'participants',
        })
        // Associate Group(1) - Presentation(*)
        // Group.hasMany(models.Presentation, {
        //     foreignKey: 'group_id',
        //     as: 'presentations',
        // })
        // Associate Group(1) - Presentation_Group(*)
        Group.hasMany(models.Presentation_Group, {
            foreignKey: 'group_id',
            as: 'presentation_groups',
        })
    }
    return Group
}
