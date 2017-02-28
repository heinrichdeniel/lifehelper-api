module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Location", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: DataTypes.STRING,
        lat: DataTypes.DOUBLE,
        lng: DataTypes.DOUBLE,
        placeId: {
            type: DataTypes.STRING,
            unique: true
        }
    })
};
