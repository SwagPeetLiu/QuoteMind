require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestProduct,
    getTestMaterial,
    getTestClient,
    testObject,
    invalidTestingRange,
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
    const validTestingObject = testObject.product.validTestingObject;
    const updateTestingObject = testObject.product.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingProduct = await getTestProduct(app, validSession);
        exsitingMaterial = await getTestMaterial(app, validSession);
        existingClient = await getTestClient(app, validSession);
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
            const testRange = {
                en_name : invalidTestingRange.en_name,
                ch_name : invalidTestingRange.ch_name,
                descriptions : invalidTestingRange.descriptions
            };
            Object.keys(testRange).forEach((property) => {
                Object.keys(testRange[property]).forEach((situation) => {
                    it (`it should not create a product if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : testRange[property][situation] };
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
                        quantity_unit: "pcs",
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
                    .post('/search/pricing_conditions')
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testPricingConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(conditionResponse.statusCode).toBe(200);
                expect(conditionResponse.body.results[0].product.id).toBe(testProductID);
                expect(conditionResponse.body.results[0].product.en_name).toBe(updateTestingObject.en_name);
                expect(conditionResponse.body.results[0].product.ch_name).toBe(updateTestingObject.ch_name);

                const ruleResponse = await request(app)
                    .post('/search/pricing_rules')
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testPricingRuleID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(ruleResponse.statusCode).toBe(200);
                expect(ruleResponse.body.results[0].conditions.length).toBe(1);
                expect(ruleResponse.body.results[0].conditions[0].product.id).toBe(testProductID);
                expect(ruleResponse.body.results[0].conditions[0].product.en_name).toBe(updateTestingObject.en_name);
                expect(ruleResponse.body.results[0].conditions[0].product.ch_name).toBe(updateTestingObject.ch_name);
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
                    .post('/search/transactions')
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testTransactionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(transactionResponse.statusCode).toBe(200);
                expect(transactionResponse.body.results.length).toBe(0);

                // check if that related pricing condition is deleted 
                const conditionResponse = await request(app)
                    .post('/search/pricing_conditions')
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testPricingConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(conditionResponse.statusCode).toBe(200);
                expect(conditionResponse.body.count).toBe(0);
                
                // check if that related pricing rule is deleted
                const ruleResponse = await request(app)
                    .post('/search/pricing_rules')
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testPricingRuleID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(ruleResponse.statusCode).toBe(200);
                expect(ruleResponse.body.count).toBe(0);
            });
        });
    });
});
