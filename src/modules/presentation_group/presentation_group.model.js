module.exports = (Sequelize, DataTypes) => {
    const Presentation_Group = Sequelize.define(
        'Presentation_Group',
        {
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            presentation_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            is_presenting: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            timestamps: false,
            tableName: 'presentation_group',
        }
    )
    Presentation_Group.associate = (models) => {
        // Associate Group(1) - Presentation_Group(*)
        Presentation_Group.belongsTo(models.Group, {
            foreignKey: 'group_id',
            as: 'group',
        })
        // Associate Presentation(1) - Presentation_Group(*)
        Presentation_Group.belongsTo(models.Presentation, {
            foreignKey: 'presentation_id',
            as: 'presentation',
        })
        // Associate Presentation_Group(1) - User_Choice(*)
        Presentation_Group.hasMany(models.User_Choice, {
            foreignKey: 'presentation_group_id',
            as: 'presentation_group_choices',
        })
    }
    return Presentation_Group
}
