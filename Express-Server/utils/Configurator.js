// get the configuration of the environment
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');

// Configure the Database instance that uses the connection
const pgp = require('pg-promise')();
const { types } = pgp.pg;
const NUMERIC_OID = 1700;
types.setTypeParser(NUMERIC_OID, (val) => {
    return parseFloat(val);
});

const db = pgp({
    host: process.env.DB_connection_string,
    port: process.env.DB_port,
    database: process.env.DB_name,
    user: process.env.DB_username,
    password: process.env.DB_pw,
    ssl: {
        rejectUnauthorized: false
    }
});

function getConfiguration() {
    const env = process.env.NODE_ENV;
    switch (env) {
        case 'development':
            return require('../config/devDefault');
        case 'production':
            return require('../config/prodDefault');
        case 'test':
            return require('../config/devDefault');
        default:
            return require('../config/devDefault');
    }
}

function getDBconnection() {
    return db;
}
function closeDBConnection() {
    return db.$pool.end();
}

async function getTestSession(app){
    const response = await request(app).post('/auth').send({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PW
    });
    return response.body.session;
}

module.exports = {
    getConfiguration,
    getDBconnection,
    closeDBConnection,
    getTestSession
}