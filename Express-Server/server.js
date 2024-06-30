require('dotenv').config();
const { getConfiguration } = require('./utils/Configurator');
const config = getConfiguration();
const port = config.port;

// Creating the Express server:
const express = require('express');
const app = express(); // creating an instance of express app that runs the entire server
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')()
const { types } = pgp.pg;

// Configure the numeric parser to return numbers
const NUMERIC_OID = 1700;
types.setTypeParser(NUMERIC_OID, (val) => {
    return parseFloat(val);
});

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

const positionRouter = require('./Routes/positions')(db);
app.use("/positions", positionRouter);

const materialRouter = require('./Routes/materials')(db);
app.use("/materials", materialRouter);

const productRouter = require('./Routes/products')(db);
app.use("/products", productRouter);

const transactionsRouter = require('./Routes/transactions')(db);
app.use("/transactions", transactionsRouter);

const pricingRouter = require('./Routes/pricings')(db);
app.use("/pricings", pricingRouter);

const counterRouter = require('./utils/counter')(db);
app.use("/counter", counterRouter);

const searchRouter = require('./utils/search')(db);
app.use("/search", searchRouter);

async function AuthenticationLogger(req, res, next) {
    // token validations
    const token = req.headers['session-token'];
    if (!token || typeof token !== 'string') {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.JWT_token, async (err, session) => {
        if (err) return res.status(401).json({ message: 'Unauthorized access' });
        if (!session.email) return res.status(401).json({ message: 'Unauthorized access' });
        
        // validate the existence of the associated user
        const existingUser = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [session.email]);
        if (!existingUser) return res.status(401).json({ message: 'Unauthorized access' });

        // validate if token is invalid
        if (existingUser.last_session !== token){
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        // validate if token is expired
        if(isTokenExpired(token)){
            await db.none('UPDATE public.user SET last_session = NULL WHERE email = $1', [session.email]);
            return res.status(401).json({ message: 'Unauthorized access' });
        }
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
app.listen(port, () => console.log('Server started at port ' + port));