module.exports = (Sequelize, DataTypes) => {
    const Slide = Sequelize.define(
        'Slide',
        {
            question: {
                type: DataTypes.STRING,
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
    }

    return Slide
}
