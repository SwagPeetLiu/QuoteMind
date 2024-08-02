const { TestEnvironment: NodeEnvironment }= require('jest-environment-node');
const { getDBconnection, initialiseDBReferences } = require('./Configurator');
const express = require('express');

// class used to construct the testing application without network delays (i.e., superTest simulation)
class ExpressEnvironment extends NodeEnvironment {
    constructor(config, context) {
        super(config, context);
    }
    async setup() {
        await super.setup();
        const app = express();
        
        // generla setups:
        app.use(express.static('public')); // keeping all the static files in the public folder
        app.use(express.urlencoded({ extended: false })); // tools for parsing the body of the request
        app.use(express.json());
        const db = getDBconnection();
        const dbReferences = await initialiseDBReferences(db);
        const { AuthenticationLogger } = require('./AuthMiddleware');

        // Open endpoints set ups:
        const authRouter = require('../Routes/auth/file')(db);
        app.use("/auth", authRouter);
        const registerRouter = require('../Routes/register/file')(db);
        app.use("/register", registerRouter);

        // cover all remaining routes with Authentication middleware
        app.use(AuthenticationLogger);

        const profileRouter = require('../Routes/profile/file')(db);
        app.use("/profile", profileRouter);

        const companyRouter = require('../Routes/companies/file')(db);
        app.use("/companies", companyRouter);

        const clientRouter = require('../Routes/clients/file')(db);
        app.use("/clients", clientRouter);

        const employeeRouter = require('../Routes/employees/file')(db);
        app.use("/employees", employeeRouter);

        const positionRouter = require('../Routes/positions/file')(db);
        app.use("/positions", positionRouter);

        const materialRouter = require('../Routes/materials/file')(db);
        app.use("/materials", materialRouter);

        const productRouter = require('../Routes/products/file')(db);
        app.use("/products", productRouter);

        const transactionsRouter = require('../Routes/transactions/file')(db);
        app.use("/transactions", transactionsRouter);

        const pricingRouter = require('../Routes/pricings/file')(db);
        app.use("/pricings", pricingRouter);

        const counterRouter = require('../Routes/counter/file')(db);
        app.use("/counter", counterRouter);

        const searchRouter = require('../Routes/search/file')(db, dbReferences);
        app.use("/search", searchRouter);

        // initialise the portal that listences for requests
        this.global.testApp = app;
        this.global.dbReferences = dbReferences;
    }

    async teardown() {
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = ExpressEnvironment;
