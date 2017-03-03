module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Project", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        initialProject: {
            type: DataTypes.BOOLEAN,
            color: DataTypes.STRING,
            defaultValue: false
        }
    })
};
