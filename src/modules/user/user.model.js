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
                defaultValue:
                    'https://res.cloudinary.com/dykg8qjzp/image/upload/v1668829117/avatar-login_gcpy3w.png',
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
        // Associate User(1) - Presentation(*)
        User.hasMany(models.Presentation, {
            foreignKey: 'host_id',
            as: 'presentations',
        })
        // Associate User(1) - User_Choice(*)
        User.hasMany(models.User_Choice, {
            foreignKey: 'user_id',
            as: 'choice_users',
            constraints: false,
        })
        // Associate User(1) - Notification(*)
        User.hasMany(models.Notification, {
            foreignKey: 'user_id',
            as: 'notifications',
        })
        // Associate User(1) - Message(*)
        User.hasMany(models.Message, {
            foreignKey: 'user_id',
            as: 'messages',
        })
        // Associate User(1) - Question(*)
        User.hasMany(models.Question, {
            foreignKey: 'user_id',
            as: 'questions',
        })
        // Associate User(1) - Vote(*)
        User.hasMany(models.Vote, {
            foreignKey: 'user_id',
            as: 'votes',
        })
    }
    return User
}
