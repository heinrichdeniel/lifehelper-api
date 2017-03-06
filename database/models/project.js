module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Project", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        color: DataTypes.STRING,
        initialProject: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deleted:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        createdBy:DataTypes.INTEGER
    })
};
