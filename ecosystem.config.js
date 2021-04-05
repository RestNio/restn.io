module.exports = {
apps: [
    {
        name: "restn-io",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
            githook: {
                command: 'git pull && npm i && pm2 restart restn-io',
                branch: 'main',
                port: 4444,
                secret: 'restniweb'
            }
        },
        env_test: {
            NODE_ENV: "test",
        },
        env_staging: {
            NODE_ENV: "staging",
        },
        env_development: {
            NODE_ENV: "development",
            watch: "."
        },
    },
]};
