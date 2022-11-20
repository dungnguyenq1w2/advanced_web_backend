module.exports = (Sequelize, DataTypes) => {
    const User = Sequelize.define(
        'User',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            is_auth: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            refresh_token: {
                type: DataTypes.TEXT,
                // type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'user',
        }
    )
    User.associate = (models) => {
        // Associate User(1) - User_Group(*)
        User.hasMany(models.User_Group, {
            foreignKey: 'user_id',
            as: 'users',
        })
    }
    return User
}
