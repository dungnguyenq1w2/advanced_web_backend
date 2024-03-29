module.exports = (Sequelize, DataTypes) => {
    const Message = Sequelize.define(
        'Message',
        {
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            presentation_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_at: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'message',
        }
    )
    Message.associate = (models) => {
        // Associate User(1) - Message(*)
        Message.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            constraints: false,
        })
        // Associate Presentation(1) - Message(*)
        Message.belongsTo(models.Presentation, {
            foreignKey: 'presentation_id',
            as: 'presentation',
        })
    }
    return Message
}
