module.exports = (Sequelize, DataTypes) => {
    const Presentation = Sequelize.define(
        'Presentation',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            owner_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_published: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            is_presenting: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            is_edititing: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            timestamps: false,
            tableName: 'presentation',
        }
    )

    Presentation.associate = (models) => {
        // Associate User(1) - Presentation(*)
        Presentation.belongsTo(models.User, {
            foreignKey: 'owner_id',
            as: 'owner',
        })
        // Associate Group(1) - Presentation(*)
        Presentation.belongsTo(models.Group, {
            foreignKey: 'group_id',
            as: 'group',
        })
        // Associate Presentation(1) - Presentation_Group(*)
        Presentation.hasMany(models.Presentation_Group, {
            foreignKey: 'presentation_id',
            as: 'presentation_groups',
        })
        // Associate Presentation(1) - Slide(*)
        Presentation.hasMany(models.Slide, {
            foreignKey: 'presentation_id',
            as: 'slides',
        })
        // Associate Presentation(1) - Message(*)
        Presentation.hasMany(models.Message, {
            foreignKey: 'presentation_id',
            as: 'messages',
        })
        // Associate Presentation(1) - Question(*)
        Presentation.hasMany(models.Question, {
            foreignKey: 'presentation_id',
            as: 'questions',
        })
    }

    return Presentation
}
