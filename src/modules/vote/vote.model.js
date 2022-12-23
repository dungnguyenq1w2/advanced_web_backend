module.exports = (Sequelize, DataTypes) => {
    const Vote = Sequelize.define(
        'Vote',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            question_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'vote',
        }
    )
    Vote.associate = (models) => {
        // Associate User(1) - Vote(*)
        Vote.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        })
        // Associate Question(1) - Vote(*)
        Vote.belongsTo(models.Question, {
            foreignKey: 'question_id',
            as: 'question',
        })
    }
    return Vote
}
