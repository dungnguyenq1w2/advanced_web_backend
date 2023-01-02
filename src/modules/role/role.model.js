module.exports = (Sequelize, DataTypes) => {
    const Role = Sequelize.define(
        'Role',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'role',
        }
    )

    Role.bulkCreate(
        [
            { name: 'Owner', id: 1 },
            { name: 'Co-owner', id: 2 },
            { name: 'Member', id: 3 },
        ],
        {
            ignoreDuplicates: true,
            returning: true,
            validate: true,
        }
    )

    Role.associate = (models) => {
        // Associate Role(1) - User_Group(*)
        Role.hasMany(models.User_Group, {
            foreignKey: 'role_id',
            as: 'roles',
        })
    }

    return Role
}
