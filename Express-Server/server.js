const { getConfiguration, getDBconnection} = require('./utils/Configurator');
const config = getConfiguration();
const port = config.port;

// Creating the Express server:
const express = require('express');
const app = express(); // creating an instance of express app that runs the entire server

// generla setups:
app.use(express.static('public')); // keeping all the static files in the public folder
app.use(express.urlencoded({ extended: false })); // tools for parsing the body of the request
app.use(express.json());
const db = getDBconnection();
const { AuthenticationLogger } = require('./utils/AuthMiddleware');

// Open endpoints
const authRouter = require('./Routes/auth/file')(db);
app.use("/auth", authRouter);

const registerRouter = require('./Routes/register/file')(db);
app.use("/register", registerRouter);

// cover all remaining routes with Authentication middleware
app.use(AuthenticationLogger);

const profileRouter = require('./Routes/Profile')(db);
app.use("/profile", profileRouter);

const companyRouter = require('./Routes/Companies')(db);
app.use("/companies", companyRouter);

const clientRouter = require('./Routes/clients/file')(db);
app.use("/clients", clientRouter);

const employeeRouter = require('./Routes/Employees')(db);
app.use("/employees", employeeRouter);

const positionRouter = require('./Routes/Positions')(db);
app.use("/positions", positionRouter);

const materialRouter = require('./Routes/Materials')(db);
app.use("/materials", materialRouter);

const productRouter = require('./Routes/Products')(db);
app.use("/products", productRouter);

const transactionsRouter = require('./Routes/Transactions')(db);
app.use("/transactions", transactionsRouter);

const pricingRouter = require('./Routes/Pricings')(db);
app.use("/pricings", pricingRouter);

const counterRouter = require('./utils/Counter')(db);
app.use("/counter", counterRouter);

const searchRouter = require('./utils/Search')(db);
app.use("/search", searchRouter);

// initialise the portal that listences for requests
app.listen(port, () => console.log('Server started at port ' + port));