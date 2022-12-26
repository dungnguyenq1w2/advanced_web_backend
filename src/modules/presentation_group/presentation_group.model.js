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
    }
    return Presentation_Group
}
