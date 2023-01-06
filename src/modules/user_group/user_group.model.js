module.exports = (Sequelize, DataTypes) => {
    const User_Group = Sequelize.define(
        'User_Group',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'user_group',
        }
    )
    User_Group.associate = (models) => {
        // Associate User(1) - User_Group(*)
        User_Group.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            //     // how to auto update foreign key when change code in sequelize(Chưa kiểm nghiệm)
            //     onDelete: 'CASCADE',
            //     onUpdate: 'CASCADE',
            //     hooks: true,
        })
        // Associate Group(1) - User_Group(*)
        User_Group.belongsTo(models.Group, {
            foreignKey: 'group_id',
            as: 'group',
        })
        // Associate Role(1) - User_Group(*)
        User_Group.belongsTo(models.Role, {
            foreignKey: 'role_id',
            as: 'role',
        })

    }
    return User_Group
}
