module.exports = {
    jwt: {
        secret: "ToPsEcReTfOrJwTtOkEn"
    },
    database: {
        host: "localhost",
        name: "lifehelper",
        user: "deniel",
        password: "superSecret"
    },
    facebook: {
        appId: '235743573538702'
    },
    google: {

    },
    "production": {
        "use_env_variable": "DATABASE_URL"
    }

};