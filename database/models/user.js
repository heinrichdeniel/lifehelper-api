module.exports = function(sequelize, DataTypes) {
    return sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        language: {
            type: DataTypes.STRING,
            defaultValue: "en"
        },
        dateFormat: {
            type: DataTypes.STRING,
            defaultValue: "DD/MM/YYYY"
        },
        timeFormat: {
            type: DataTypes.STRING,
            defaultValue: "HH:mm"
        },
        google_id: {
            type: DataTypes.STRING,
            unique: true
        },
        facebook_id: {
            type: DataTypes.STRING,
            unique: true
        },
        photo_url: DataTypes.STRING,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })
};
