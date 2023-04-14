module.exports = (Sequelize, DataTypes) => {
    const Notification = Sequelize.define(
        'Notification',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            is_read: {
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
            tableName: 'notification',
        }
    )
    Notification.associate = (models) => {
        // Associate User(1) - Notification(*)
        Notification.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        })
    }
    return Notification
}
