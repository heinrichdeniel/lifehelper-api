module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Comment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text:DataTypes.TEXT,
        createdAt: DataTypes.DATE,
    })
};
