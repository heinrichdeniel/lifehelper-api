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
        status:{
            type: DataTypes.STRING,
            defaultValue: "pending"
        },
        shared: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        owner: DataTypes.INTEGER
    })
};
