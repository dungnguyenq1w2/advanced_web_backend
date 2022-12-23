module.exports = (Sequelize, DataTypes) => {
    const Slide = Sequelize.define(
        'Slide',
        {
            question: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            heading: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            subheading: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            paragraph: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            type: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            presentation_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'slide',
        }
    )

    Slide.associate = (models) => {
        // Associate Presetation(1) - Slide(*)
        Slide.belongsTo(models.Presentation, {
            foreignKey: 'presentation_id',
            as: 'presentation',
        })
        // // Associate Slide(1) - Question(*)
        // Slide.hasMany(models.Question, {
        //     foreignKey: 'slide_id',
        //     as: 'questions',
        // })
        // Associate Slide(1) - Choice(*)
        Slide.hasMany(models.Choice, {
            foreignKey: 'slide_id',
            as: 'choices',
        })
        // Associate Slide_Type(1) - Slide(*)
        Slide.belongsTo(models.Slide_Type, {
            foreignKey: 'type',
            as: 'slide_type',
        })
    }

    return Slide
}
