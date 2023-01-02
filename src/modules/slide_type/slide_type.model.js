module.exports = (Sequelize, DataTypes) => {
    const Slide_Type = Sequelize.define(
        'Slide_Type',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'slide_type',
        }
    )

    Slide_Type.bulkCreate(
        [
            { name: 'Heading', id: 1 },
            { name: 'Paragraph', id: 2 },
            { name: 'Multiple choice', id: 3 },
        ],
        {
            ignoreDuplicates: true,
            returning: true,
            validate: true,
        }
    )

    Slide_Type.associate = (models) => {
        // Associate Slide_Type(1) - Slide(*)
        Slide_Type.hasMany(models.Slide, {
            foreignKey: 'type',
            as: 'slides',
        })
    }
    return Slide_Type
}
