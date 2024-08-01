const { getDBconnection, initialiseDBReferences } = require('./utils/Configurator');
const { AuthenticationLogger } = require('./utils/AuthMiddleware');
const express = require('express');

async function startServer() {
    const app = express();

    // General setups:
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Database setup
    const db = getDBconnection();
    const dbReferences = await initialiseDBReferences(db);

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

    // Cover all remaining routes with Authentication middleware
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

    const searchRouter = require('./Routes/search/file')(db, dbReferences);
    app.use("/api/search", searchRouter);

    // Initialize the portal that listens for requests
    app.listen(3000, () => {
        console.log(`Server listening on port 3000`);
    });
}

// Call the async function to start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});