// Creating the Express server:
require('dotenv').config();
const express = require('express');
const app = express(); // creating an instance of express app that runs the entire server
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')()
const port = 3000;

// generla setups:
app.use(express.static('public')); // keeping all the static files in the public folder
app.use(express.urlencoded({ extended: false })); // tools for parsing the body of the request
app.use(express.json());
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

// Open endpoints
const authRouter = require('./Routes/auth')(db);
app.use("/auth", authRouter);

const registerRouter = require('./Routes/register')(db);
app.use("/register", registerRouter);

// cover all remaining routes with Authentication middleware
app.use(AuthenticationLogger);

const profileRouter = require('./Routes/profile')(db);
app.use("/profile", profileRouter);

const companyRouter = require('./Routes/companies')(db);
app.use("/companies", companyRouter);

const clientRouter = require('./Routes/clients')(db);
app.use("/clients", clientRouter);

const employeeRouter = require('./Routes/employees')(db);
app.use("/employees", employeeRouter);

// testing branch for authroisations
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

function AuthenticationLogger(req, res, next) {
    // token validations
    const token = req.headers['session-token'];
    if (!token || typeof token !== 'string') {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.JWT_token, (err, session) => {
        if (err) return res.status(401).json({ message: 'Unauthorized access' });
        if(isTokenExpired(token)) return res.status(401).json({ message: 'Unauthorized access' });
        if (!session.email) return res.status(401).json({ message: 'Unauthorized access' });
        req.sessionEmail = session.email;
        next();
    });
}

function isTokenExpired(token){
    try {
        const decoded = jwt.decode(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp < currentTime) {
            return true; // Token has expired
        }
        return false; // Token is still valid
    } catch (error) {
        console.error('Error decoding token:', error);
        return true; // Error occurred, treat as expired
    }
}
// initialise the portal that listences for requests
app.listen(port, () => console.log('Server started'));