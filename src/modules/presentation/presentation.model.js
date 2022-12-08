module.exports = (Sequelize, DataTypes) => {
    const Presentation = Sequelize.define(
        'Presentation',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            host_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'presentation',
        },
        {
            freezeTableName: true,
        }
    )

    Presentation.associate = (models) => {
        // Associate User(1) - Presentation(*)
        Presentation.belongsTo(models.User, {
            foreignKey: 'host_id',
            as: 'host',
        })

        // Associate Group(1) - Presentation(*)
        Presentation.belongsTo(models.Group, {
            foreignKey: 'group_id',
            as: 'group',
        })

        // Associate Presentation(1) - Slide(*)
        Presentation.hasMany(models.Slide, {
            foreignKey: 'presentation_id',
            as: 'slides',
        })
    }

    return Presentation
}
