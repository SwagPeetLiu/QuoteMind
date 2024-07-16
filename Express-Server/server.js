const { getDBconnection } = require('./utils/Configurator');
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
app.get("/api/", (req, res) => {
    return res.status(200).send({
        message: "Server is up and running for Quotemind APP",
    });
});
const authRouter = require('./Routes/auth/file')(db);
app.use("/api/auth", authRouter);

const registerRouter = require('./Routes/register/file')(db);
app.use("/api/register", registerRouter);

// cover all remaining routes with Authentication middleware
app.use(AuthenticationLogger);

const profileRouter = require('./Routes/profile/file')(db);
app.use("/api/profile", profileRouter);

const companyRouter = require('./Routes/companies/file')(db);
app.use("/api/companies", companyRouter);

const clientRouter = require('./Routes/clients/file')(db);
app.use("/api/clients", clientRouter);

const employeeRouter = require('./Routes/employees/file')(db);
app.use("/api/employees", employeeRouter);

const positionRouter = require('./Routes/positions/file')(db);
app.use("/api/positions", positionRouter);

const materialRouter = require('./Routes/materials/file')(db);
app.use("/api/materials", materialRouter);

const productRouter = require('./Routes/products/file')(db);
app.use("/api/products", productRouter);

const transactionsRouter = require('./Routes/transactions/file')(db);
app.use("/api/transactions", transactionsRouter);

const pricingRouter = require('./Routes/pricings/file')(db);
app.use("/api/pricings", pricingRouter);

const counterRouter = require('./Routes/counter/file')(db);
app.use("/api/counter", counterRouter);

const searchRouter = require('./Routes/search/file')(db);
app.use("/api/search", searchRouter);

// initialise the portal that listences for requests
app.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});