module.exports = {
    jwt: {
        secret: "ToPsEcReTfOrJwTtOkEn"
    },
    database: {
        development: {
            host: "localhost",
            name: "lifehelper",
            user: "deniel",
            password: "superSecret"
        },
        production: {
            "use_env_variable": "DATABASE_URL"
        }

    },
    facebook: {
        appId: '235743573538702'
    },
    google: {

    }

};