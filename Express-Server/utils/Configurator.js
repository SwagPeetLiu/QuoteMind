const { config } = require('dotenv');

// get the configuration of the environment
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});

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

// funciton used to retrun a single copy of the true db's properties to 
// efficiently pre-process and validate the inputs of the users
async function initialiseDBReferences(db) {
    const config = getConfiguration();
    const availableTables = config.counter.availableTargets;
    const forbiddenTargets = config.search.forbiddenTargets;
    try {
        const dbReferences = await db.any(`
           WITH targets AS (
                SELECT table_name, 
                    column_name, 
                    data_type,
                    ROW_NUMBER() OVER (PARTITION BY table_name ORDER BY column_name) AS rn
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name IN ($1:csv)
                AND column_name NOT IN ($2:csv)
            )
            SELECT table_name as table, column_name as column, data_type as type 
            FROM targets ORDER BY table_name, rn;
            `, [availableTables, forbiddenTargets]);
        return dbReferences;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    getConfiguration,
    getDBconnection,
    initialiseDBReferences
}