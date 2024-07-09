require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const { getConfiguration} = require('../../utils/Configurator');
const config = getConfiguration();
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestProduct,
    getTestMaterial,
    getTestClient,
    testObject,
    isProductValid,
    isSpecificProductValid
} = require('../../utils/TestTools');

describe("Product Router", () => {
    let validSession;
    let testProductID;
    let testTransactionID;
    let testPricingConditionID;
    let testPricingRuleID;
    let exsitingProduct;
    let exsitingMaterial;
    let existingClient;
    const validSearchObject = testObject.product.validSearchObject;
    const invalidSearchObject = testObject.product.invalidSearchObject;
    const validTestingObject = testObject.product.validTestingObject;
    const updateTestingObject = testObject.product.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingProduct = await getTestProduct(app, validSession);
        exsitingMaterial = await getTestMaterial(app, validSession);
        existingClient = await getTestClient(app, validSession);
    });

    describe("GET: All Products", () => {
        describe("Session token validation", () => {
            it("the route should not be accessible if the user does not attach a valid session", async () => {
                const response = await request(app)
                    .get('/products')
                    .query({ page: 1});
                expect(response.statusCode).toBe(401);
            });
            it ("it should not return with invalid session token", async () => {
                const response = await request(app)
                    .get('/products')
                    .set('session-token', 'invalid-test-token')
                    .query({ page: 1 });
                expect(response.statusCode).toBe(401);
            });
        });
        describe("Behaviour testing", () => {
            it ("it should return 200 with a count value if no page number is provided", async () => {
                const response = await request(app)
                    .get('/products')
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('count');
                expect(response.body).toHaveProperty('page');
                expect(response.body.products.length).toBeGreaterThan(0);
                expect(isProductValid(response.body.products[0])).toBe(true);
            });

            describe ("Search target validation", () => {
                const invalidTargets = testObject.invalidSearchTargets;
                Object.keys(invalidTargets).forEach((target) => {
                    it (`it should not faithfully return if searching target is ${target}`, async () => {
                        const response = await request(app)
                            .get('/products')
                            .set('session-token', validSession)
                            .query({ 
                                target: invalidTargets[target],
                                keyword: validSearchObject.en_name
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });

            describe("Search keyword validation", () => {
                const invalidKeywords = testObject.invalidSearchKeywords;
                Object.keys(invalidKeywords).forEach((keyword) => {
                    it (`it should not faithfully return if search keyword is ${keyword}`, async () => {
                        const response = await request(app)
                            .get('/products')
                            .set('session-token', validSession)
                            .query({ 
                                target: Object.keys(validSearchObject)[0],
                                keyword: invalidKeywords[keyword]
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });

            describe("search result validation", () => {
                Object.keys(invalidSearchObject).forEach((target) => {
                    it (`it should return even if no matchin records on ${target} are provided`, async() => {
                        const response = await request(app)
                            .get('/products')
                            .set('session-token', validSession)
                            .query({ 
                                target: target,
                                keyword: invalidSearchObject[target]
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.count).toBe(0);
                        expect(response.body.page).toBeTruthy();
                        expect(response.body.products.length).toBe(0);
                    });
                });

                Object.keys(validSearchObject).forEach((target) => {
                    it (`it should return a valid searched response with a matching ${target}`, async () => {
                        const response = await request(app)
                            .get('/products')
                            .set('session-token', validSession)
                            .query({ 
                                target: target,
                                keyword: validSearchObject[target],
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.products.length).toBeGreaterThan(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBeGreaterThan(0);
                        expect(response.body.page).toBeTruthy();
                        expect(isProductValid(response.body.products[0])).toBe(true);
                    });
                });

                it ("it should not return counts if page number provided is provided", async() => {
                    const response = await request(app)
                        .get('/products')
                        .set('session-token', validSession)
                        .query({ 
                            target: "en_name",
                            keyword: validSearchObject.en_name,
                            page: 1
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body).not.toHaveProperty('count');
                    expect(response.body.page).toBe(1);
                    expect(response.body.products.length).toBeGreaterThan(0);
                    expect(isProductValid(response.body.products[0])).toBe(true);
                });
            });
        });
    });

    describe("POST: Specific Product creation", () => {
        it ("it should not allow post with wrong id indication", async () => {
            const response = await request(app)
                .post('/products/test')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        it ("it should not authroise if id indicated already exists", async () => {
            const response = await request(app)
                .post(`/products/${exsitingProduct.id}`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });

        describe("Product creation input validation", () => {
            const invalidTestingRange = {
                en_name : {
                    "missing" : undefined,
                    "empty" : "",
                    "too long" : `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
                    "invalid type" : 1
                },
                ch_name : {
                    "missing" : undefined,
                    "empty" : "",
                    "too long" : `${"测".repeat(config.limitations.Max_Name_Length + 1)}`,
                    "invalid type" : 1
                },
                descriptions : {
                    "too long": `${"测".repeat(config.limitations.Max_Descriptions_Length + 1)}`,
                    "invalid type": 1
                }
            };
            Object.keys(invalidTestingRange).forEach((property) => {
                Object.keys(invalidTestingRange[property]).forEach((situation) => {
                    it (`it should not create a product if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : invalidTestingRange[property][situation] };
                        const response = await request(app)
                            .post('/products/new')
                            .set('session-token', validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
        });

        it ("it should create a valid product with null descriptions", async () => {
            const response = await request(app)
                .post('/products/new')
                .set('session-token', validSession)
                .send({ ...validTestingObject, descriptions: null });
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            
            const deleteResponse = await request(app)
                .delete(`/products/${response.body.id}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });

        it ("it should create a new material with full information", async () => {
            const response = await request(app)
                .post('/products/new')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testProductID = response.body.id;
        });
    });

    describe("GET: Specific Product information", () => {
        it ("it should get that specific product", async () => {
            const response = await request(app)
                .get(`/products/${testProductID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
            expect(isSpecificProductValid(response.body.product)).toBe(true);
            expect(response.body.product.id).toBe(testProductID);
            expect(response.body.product.en_name).toBe(validTestingObject.en_name);
            expect(response.body.product.ch_name).toBe(validTestingObject.ch_name);
            expect(response.body.product.descriptions).toBe(validTestingObject.descriptions);
        });
    });

    describe("PUT: Specific Product update", () => {
        it ("it should update that specific product accordingly", async () => {
            const response = await request(app)
                .put(`/products/${testProductID}`)
                .set('session-token', validSession)
                .send(updateTestingObject);
            expect(response.statusCode).toBe(200);

            const updatedResponse = await request(app)
                .get(`/products/${testProductID}`)
                .set('session-token', validSession);
            expect(updatedResponse.statusCode).toBe(200);
            expect(isSpecificProductValid(updatedResponse.body.product)).toBe(true);
            expect(updatedResponse.body.product.id).toBe(testProductID);
            expect(updatedResponse.body.product.en_name).toBe(updateTestingObject.en_name);
            expect(updatedResponse.body.product.ch_name).toBe(updateTestingObject.ch_name);
            expect(updatedResponse.body.product.descriptions).toBe(updateTestingObject.descriptions);
        });

        describe("Product Association in Transactions", () => {
            it ("this testing product should be able to be attached to a new transaction", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({
                        name: "Test Transaction",
                        status: "created",
                        client: existingClient.id,
                        product: testProductID,
                        quantity: 1,
                        materials: [exsitingMaterial.id]
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testTransactionID = response.body.id;
            });

            it ("the product details should appear in the transaction", async () => {
                const response = await request(app)
                    .get(`/transactions/${testTransactionID}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body.transaction.product.id).toBe(testProductID);
                expect(response.body.transaction.product.en_name).toBe(updateTestingObject.en_name);
                expect(response.body.transaction.product.ch_name).toBe(updateTestingObject.ch_name);
            });
        });

        describe("Product Association in Pricing Conditions & Rules", () => {
            it ("it should update material associations in pricing conditions & rules", async () => {
                const conditionCreationResponse = await request(app)
                    .post('/pricings/conditions/new')
                    .set('session-token', validSession)
                    .send({
                        product: testProductID, // testing for product association
                        materials: [exsitingMaterial.id]
                    });
                expect(conditionCreationResponse.statusCode).toBe(200);
                expect(conditionCreationResponse.body.id).toBeTruthy();
                testPricingConditionID = conditionCreationResponse.body.id;

                const ruleCreationResponse = await request(app)
                    .post('/pricings/rules/new')
                    .set('session-token', validSession)
                    .send({
                        conditions: [testPricingConditionID],
                        price_per_unit: 10.5
                    });
                expect(ruleCreationResponse.statusCode).toBe(200);
                expect(ruleCreationResponse.body.id).toBeTruthy();
                testPricingRuleID = ruleCreationResponse.body.id;
            });

            it ("product details should appear in the pricing conditions & rules", async () => {
                const conditionResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingConditionID
                    });
                expect(conditionResponse.statusCode).toBe(200);
                expect(conditionResponse.body.pricing_conditions[0].product.id).toBe(testProductID);
                expect(conditionResponse.body.pricing_conditions[0].product.en_name).toBe(updateTestingObject.en_name);
                expect(conditionResponse.body.pricing_conditions[0].product.ch_name).toBe(updateTestingObject.ch_name);

                const ruleResponse = await request(app)
                    .get(`/pricings/rules`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingRuleID
                    });
                expect(ruleResponse.statusCode).toBe(200);
                expect(ruleResponse.body.pricing_rules[0].conditions.length).toBe(1);
                expect(ruleResponse.body.pricing_rules[0].conditions[0].product.id).toBe(testProductID);
                expect(ruleResponse.body.pricing_rules[0].conditions[0].product.en_name).toBe(updateTestingObject.en_name);
                expect(ruleResponse.body.pricing_rules[0].conditions[0].product.ch_name).toBe(updateTestingObject.ch_name);
            });
        });

        describe("DELETE: Product Deletion & relations in other tables", () => {
            it ("it should delete that specific product & association", async () => {
                const response = await request(app)
                    .delete(`/products/${testProductID}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);

                // await for transactions to be realised:
                await new Promise(resolve => setTimeout(resolve, 500));

                // check if that related transaction is deleted:
                const transactionResponse = await request(app)
                    .get(`/transactions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testTransactionID
                    });
                console.log(transactionResponse.body);
                expect(transactionResponse.statusCode).toBe(200);
                expect(transactionResponse.body.transactions.length).toBe(0);

                // check if that related pricing condition is deleted 
                const conditionResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingConditionID
                    });
                expect(conditionResponse.statusCode).toBe(200);
                expect(conditionResponse.body.count).toBe(0);
                
                // check if that related pricing rule is deleted
                const ruleResponse = await request(app)
                    .get(`/pricings/rules`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingRuleID
                    });
                expect(ruleResponse.statusCode).toBe(200);
                expect(ruleResponse.body.count).toBe(0);
            });
        });
    });
});
