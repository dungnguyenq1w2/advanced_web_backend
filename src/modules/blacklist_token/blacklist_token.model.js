module.exports = (Sequelize, DataTypes) => {
    const Blacklist_Token = Sequelize.define(
        'Blacklist_Token',
        {
            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'blacklist_token',
        }
    )

    return Blacklist_Token
}
