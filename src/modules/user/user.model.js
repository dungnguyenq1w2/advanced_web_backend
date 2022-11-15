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
                allowNull: false,
            },
            email_token: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            refresh_token: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'user',
        }
    )
    // User.associate = (models) => {
    // Associate User(1) - User_Group(1)
    // User.hasMany(models.User_Group, {
    //     foreignKey: 'user_id',
    //     as: 'users',
    // })
    // }
    return User
}
