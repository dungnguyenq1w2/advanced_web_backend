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
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_editing: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            created_at: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
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
