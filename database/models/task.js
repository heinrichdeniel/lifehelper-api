module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Task", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        date: DataTypes.DATE,
        time: DataTypes.STRING,
        location: DataTypes.STRING,
        lat: DataTypes.DOUBLE,
        lng: DataTypes.DOUBLE,
        completedAt: DataTypes.DATE,
        status: {
            type: DataTypes.STRING,
            defaultValue: "pending"
        },
        shared: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        owner: DataTypes.INTEGER,
        commented:  {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })
};
