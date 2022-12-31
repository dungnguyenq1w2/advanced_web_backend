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
        // Associate User_Group(1) - Presentation_Group(*)
        Presentation_Group.belongsTo(models.User_Group, {
            foreignKey: 'group_id',
            as: 'user_group',
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
        // Associate Presentation_Group(1) - Message(*)
        Presentation_Group.hasMany(models.User_Choice, {
            foreignKey: 'presentation_group_id',
            as: 'presentation_group_messages',
        })
        // Associate Presentation_Group(1) - Question(*)
        Presentation_Group.hasMany(models.Question, {
            foreignKey: 'presentation_group_id',
            as: 'presentation_group_questions',
        })
    }
    return Presentation_Group
}
