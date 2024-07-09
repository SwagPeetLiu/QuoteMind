require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const { getConfiguration } = require('../../utils/Configurator');
const config = getConfiguration();
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestMaterial,
    getTestProduct,
    getTestClient,
    getTestCompany,
    getTestPricingCondition,
    getTestPricingRule,
    testObject,
    isConditionValid,
    isRuleValid
} = require('../../utils/TestTools');

describe("/pricings testing", () => {
    let validSession;
    let testQuantityConditionID; // quantity based pricing condition
    let testSizeConditionID; // size based pricing condition
    let testPricingRuleID;
    let exsitingMaterial;
    let existingProduct;
    let existingPricingCondition;
    let existingPricingRule;
    let existingClient;
    let existingCompany;
    let pricingConditionObject = testObject.pricing_condition;
    let pricingRuleObject = testObject.pricing_rule;
    let validQuantityCondition;
    let validSizeCondition;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        [
            exsitingMaterial,
            existingProduct,
            existingClient,
            existingCompany,
            existingPricingCondition,
            existingPricingRule
        ] = await Promise.all([
            getTestMaterial(app, validSession),
            getTestProduct(app, validSession),
            getTestClient(app, validSession),
            getTestCompany(app, validSession),
            getTestPricingCondition(app, validSession),
            getTestPricingRule(app, validSession)
        ]);

        // setting up the testing object:
        pricingConditionObject = {
            ...pricingConditionObject,
            validTestingObject: {
                ...pricingConditionObject.validTestingObject,
                product: existingProduct.id,
                materials: [exsitingMaterial.id],
                client: existingClient.id,
                company: existingCompany.id
            },
            updateTestingObject: {
                ...pricingConditionObject.updateTestingObject,
                product: existingProduct.id,
                materials: [exsitingMaterial.id],
                client: existingClient.id,
                company: existingCompany.id
            }
        };
        pricingRuleObject = {
            ...pricingRuleObject,
            validTestingObject: {
                ...pricingRuleObject.validTestingObject,
                conditions: [existingPricingCondition.id]
            },
            updateTestingObject: {
                ...pricingRuleObject.updateTestingObject,
                conditions: [existingPricingCondition.id]
            }
        };
        validSizeCondition = {
            ...pricingConditionObject.validTestingObject,
            quantity: null,
            quantity_unit: null
        };
        validQuantityCondition = {
            ...pricingConditionObject.validTestingObject,
            size: null,
            size_unit: null
        };
    });

    describe("GET: All Pricings", () => {
        describe("GET: All Pricing Conditions", () => {
            it("it should not proceed with no session token", async () => {
                const response = await request(app)
                    .get("/pricings/conditions")
                expect(response.statusCode).toBe(401);
            });
            it("it should not proceed with invalid session token", async () => {
                const response = await request(app)
                    .get("/pricings/conditions")
                    .set('session-token', "invalid-token");
                expect(response.statusCode).toBe(401);
            });
            describe("Behaviour Testing", () => {
                it("It should return 200 with a count value if no page number is provided", async () => {
                    const response = await request(app)
                        .get("/pricings/conditions")
                        .set('session-token', validSession);
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('page');
                    expect(response.body.pricing_conditions.length).toBeGreaterThan(0);
                    expect(isConditionValid(response.body.pricing_conditions[0])).toBe(true);
                });

                describe("Search Target Validations", () => {
                    const invalidSearchTargets = testObject.invalidSearchTargets;
                    Object.keys(invalidSearchTargets).forEach((target) => {
                        it(`it should not faithfully return if searching target is ${target}`, async () => {
                            const response = await request(app)
                                .get('/pricings/conditions')
                                .set('session-token', validSession)
                                .query({
                                    target: invalidSearchTargets[target],
                                    keyword: pricingConditionObject.validSearchObject.product
                                });
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });

                describe("Search keyword validations", () => {
                    const invalidSearchKeywords = testObject.invalidSearchKeywords;
                    Object.keys(invalidSearchKeywords).forEach((keyword) => {
                        it(`it should not faithfully return if searching keyword is ${keyword}`, async () => {
                            const response = await request(app)
                                .get('/pricings/conditions')
                                .set('session-token', validSession)
                                .query({
                                    target: Object.keys(pricingConditionObject.validSearchObject)[0],
                                    keyword: invalidSearchKeywords[keyword]
                                });
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
                describe("Search Results validations", () => {
                    Object.keys(pricingConditionObject.invalidSearchObject).forEach((target) => {
                        it(`it should return even no matching records on ${target} are provided`, async () => {
                            const response = await request(app)
                                .get('/pricings/conditions')
                                .set('session-token', validSession)
                                .query({
                                    target: target,
                                    keyword: pricingConditionObject.invalidSearchObject[target]
                                });
                            expect(response.statusCode).toBe(200);
                            expect(response.body.count).toBe(0);
                            expect(response.body.pricing_conditions.length).toBe(0);
                        })
                    });
                    Object.keys(pricingConditionObject.validSearchObject).forEach((target) => {
                        it(`it should return properly for valid searches on ${target}`, async () => {
                            const response = await request(app)
                                .get('/pricings/conditions')
                                .set('session-token', validSession)
                                .query({
                                    target: target,
                                    keyword: pricingConditionObject.validSearchObject[target]
                                });
                            expect(response.statusCode).toBe(200);
                            expect(response.body.count).toBeGreaterThan(0);
                            expect(response.body.page).toBe(1);
                            expect(response.body.pricing_conditions.length).toBeGreaterThan(0);
                            expect(isConditionValid(response.body.pricing_conditions[0])).toBe(true);
                        });
                    });
                    it("it should return properly without count if page number is provided", async () => {
                        const response = await request(app)
                            .get('/pricings/conditions')
                            .set('session-token', validSession)
                            .query({
                                target: Object.keys(pricingConditionObject.validSearchObject)[0],
                                keyword: pricingConditionObject.validSearchObject[Object.keys(pricingConditionObject.validSearchObject)[0]],
                                page: 1
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body).not.toHaveProperty('count');
                        expect(response.body.page).toBe(1);
                        expect(response.body.pricing_conditions.length).toBeGreaterThan(0);
                        expect(isConditionValid(response.body.pricing_conditions[0])).toBe(true);
                    });
                });
            });
        });

        describe("GET: All Pricing Rules", () => {
            it("it should not proceed with no session token", async () => {
                const response = await request(app)
                    .get("/pricings/rules")
                expect(response.statusCode).toBe(401);
            });
            it("it should not proceed with invalid session token", async () => {
                const response = await request(app)
                    .get("/pricings/rules")
                    .set('session-token', "invalid-token");
                expect(response.statusCode).toBe(401);
            });
            describe("Behaviour Testing", () => {
                it("It should return 200 with a count value if no page number is provided", async () => {
                    const response = await request(app)
                        .get("/pricings/rules")
                        .set('session-token', validSession);
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('page');
                    expect(response.body.pricing_rules.length).toBeGreaterThan(0);
                    expect(isRuleValid(response.body.pricing_rules[0])).toBe(true);
                });
                describe("Search Target Validations", () => {
                    const invalidSearchTargets = testObject.invalidSearchTargets;
                    Object.keys(invalidSearchTargets).forEach((target) => {
                        it(`it should not faithfully return if searching target is ${target}`, async () => {
                            const response = await request(app)
                                .get('/pricings/rules')
                                .set('session-token', validSession)
                                .query({
                                    target: invalidSearchTargets[target],
                                    keyword: pricingRuleObject.validSearchObject.id
                                });
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
                describe("Search Keyword Validations", () => {
                    const invalidSearchKeywords = testObject.invalidSearchKeywords;
                    Object.keys(invalidSearchKeywords).forEach((keyword) => {
                        it(`it should not faithfully return if searching keyword is ${keyword}`, async () => {
                            const response = await request(app)
                                .get('/pricings/rules')
                                .set('session-token', validSession)
                                .query({
                                    target: Object.keys(pricingRuleObject.validSearchObject)[0],
                                    keyword: invalidSearchKeywords[keyword]
                                });
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
                describe("Search Results validations", () => {
                    Object.keys(pricingRuleObject.invalidSearchObject).forEach((target) => {
                        it(`it should return even no matching records on ${target} are provided`, async () => {
                            const response = await request(app)
                                .get('/pricings/rules')
                                .set('session-token', validSession)
                                .query({
                                    target: target,
                                    keyword: pricingRuleObject.invalidSearchObject[target]
                                });
                            expect(response.statusCode).toBe(200);
                            expect(response.body.count).toBe(0);
                            expect(response.body.pricing_rules.length).toBe(0);
                        });
                    });
                    Object.keys(pricingRuleObject.validSearchObject).forEach((target) => {
                        it(`it should return properly for valid searches on ${target}`, async () => {
                            const response = await request(app)
                                .get('/pricings/rules')
                                .set('session-token', validSession)
                                .query({
                                    target: target,
                                    keyword: pricingRuleObject.validSearchObject[target]
                                });
                            expect(response.statusCode).toBe(200);
                            expect(response.body.count).toBeGreaterThan(0);
                            expect(response.body.page).toBe(1);
                            expect(response.body.pricing_rules.length).toBeGreaterThan(0);
                            expect(isRuleValid(response.body.pricing_rules[0])).toBe(true);
                        });
                    });
                    it("it should not return count if page number is provided", async () => {
                        const response = await request(app)
                            .get('/pricings/rules')
                            .set('session-token', validSession)
                            .query({
                                target: Object.keys(pricingRuleObject.validSearchObject)[0],
                                keyword: pricingRuleObject.validSearchObject[Object.keys(pricingRuleObject.validSearchObject)[0]],
                                page: 1
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body).not.toHaveProperty('count');
                        expect(response.body.page).toBe(1);
                        expect(response.body.pricing_rules.length).toBeGreaterThan(0);
                        expect(isRuleValid(response.body.pricing_rules[0])).toBe(true);
                    });
                });
            });
        });
    });

    describe("POST: Specific Pricings", () => {
        describe("Specific Pricing Conditions", () => {
            it("it should not proceed with creation with the wrong indication for pricing conditions", async () => {
                const response = await request(app)
                    .post("/pricings/conditions/test")
                    .set('session-token', validSession)
                    .send(pricingConditionObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            it("it should not proceed if the id indicated already exists", async () => {
                const response = await request(app)
                    .post(`/pricings/conditions/${existingPricingCondition.id}`)
                    .set('session-token', validSession)
                    .send(pricingConditionObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            describe("Condition Creation validation", () => {
                it("it should not create a condition with two numeric conditions at the same time", async () => {
                    const response = await request(app)
                        .post("/pricings/conditions/new")
                        .set('session-token', validSession)
                        .send(pricingConditionObject.validTestingObject);
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a condition if the corresponding quantity_unit exists but not the value", async () => {
                    const response = await request(app)
                        .post("/pricings/conditions/new")
                        .set('session-token', validSession)
                        .send({ ...validQuantityCondition, quantity: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a condition if the corresponding size_unit exists but not the value", async () => {
                    const response = await request(app)
                        .post("/pricings/conditions/new")
                        .set('session-token', validSession)
                        .send({ ...validSizeCondition, size: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a numeric condition if the corresponding threshold has no the value", async () => {
                    const response = await request(app)
                        .post("/pricings/conditions/new")
                        .set('session-token', validSession)
                        .send({ ...validQuantityCondition, threshold: null });
                    expect(response.statusCode).toBe(400);
                });

                // testing for the validity of each field:
                const invalidTestingRange = {
                    quantity: {
                        "invalid type": "string",
                        "invalid value": 0
                    },
                    size: {
                        "invalid type": "5",
                        "invalid value": -1,
                    },
                    colour: {
                        "invalid value": "!@#$%^&*",
                        "invalid type": 9,
                        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
                    },
                    product: {
                        "invalid value": "string",
                        "invalid type": 9,
                        "missing": undefined
                    },
                    materials: {
                        "invalid value": ["string"],
                        "invalid type": [9],
                        "none-array": "string"
                    },
                    client: {
                        "invalid type": 9,
                        "invalid value": "string"
                    },
                    company: {
                        "invalid type": 9,
                        "invalid value": "string"
                    },
                    threshold: {
                        "invalid type": 9,
                        "invalid value": "string",
                    },
                    quantity_unit: {
                        "invalid type": 9,
                        "invalid value": "!@#$%^&*"
                    },
                    size_unit: {
                        "invalid type": 9,
                        "invalid value": "!@#$%^&*"
                    }
                };

                // validating for the quantity based
                Object.keys(invalidTestingRange)
                    .filter((key) => key !== "size" && key !== "size_unit")
                    .forEach((key) => {
                        Object.keys(invalidTestingRange[key])
                            .forEach((situation) => {
                                it(`it should not create a condition if ${key} is ${situation}`, async () => {
                                    const invalidObject = { ...validQuantityCondition, [key]: invalidTestingRange[key][situation] };
                                    const response = await request(app)
                                        .post("/pricings/conditions/new")
                                        .set('session-token', validSession)
                                        .send(invalidObject);
                                    expect(response.statusCode).toBe(400);
                                });
                            });
                    });

                // validating for the size based
                Object.keys(invalidTestingRange)
                    .filter((key) => key !== "quantity" && key !== "quantity_unit")
                    .forEach((key) => {
                        Object.keys(invalidTestingRange[key])
                            .forEach((situation) => {
                                it(`it should not create a condition if ${key} is ${situation}`, async () => {
                                    const invalidObject = { ...validSizeCondition, [key]: invalidTestingRange[key][situation] };
                                    const response = await request(app)
                                        .post("/pricings/conditions/new")
                                        .set('session-token', validSession)
                                        .send(invalidObject);
                                    expect(response.statusCode).toBe(400);
                                });
                            });
                    });

                // testing for nullable creation:
                it(`should create a condition even if everything but product is null`, async () => {
                    const response = await request(app)
                        .post("/pricings/conditions/new")
                        .set('session-token', validSession)
                        .send({
                            product: pricingConditionObject.validTestingObject.product
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.id).toBeTruthy();

                    const deleteResponse = await request(app)
                        .delete(`/pricings/conditions/${response.body.id}`)
                        .set('session-token', validSession);
                    expect(deleteResponse.statusCode).toBe(200);
                });
            });
            // it should create properly for those two types of conditions
            it("it should create properly for both types of conditions & verify the creation of multiple conditions", async () => {
                const sizeResponse = await request(app)
                    .post("/pricings/conditions/new")
                    .set('session-token', validSession)
                    .send(validSizeCondition);
                expect(sizeResponse.statusCode).toBe(200);
                expect(sizeResponse.body.id).toBeTruthy();
                testSizeConditionID = sizeResponse.body.id;

                const quantityResponse = await request(app)
                    .post("/pricings/conditions/new")
                    .set('session-token', validSession)
                    .send(validQuantityCondition);
                expect(quantityResponse.statusCode).toBe(200);
                expect(quantityResponse.body.id).toBeTruthy();
                testQuantityConditionID = quantityResponse.body.id;

                // verify the condition creation is valid:
                const sizeSearchResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testSizeConditionID
                    });
                expect(sizeSearchResponse.statusCode).toBe(200);
                expect(sizeSearchResponse.body.count).toBe(1);
                expect(isConditionValid(sizeSearchResponse.body.pricing_conditions[0])).toBe(true);
                expect(sizeSearchResponse.body.pricing_conditions[0].id).toBe(testSizeConditionID);
                expect(sizeSearchResponse.body.pricing_conditions[0].quantity).toBe(validSizeCondition.quantity);
                expect(sizeSearchResponse.body.pricing_conditions[0].quantity_unit).toBe(validSizeCondition.quantity_unit);
                expect(sizeSearchResponse.body.pricing_conditions[0].size).toBe(validSizeCondition.size);
                expect(sizeSearchResponse.body.pricing_conditions[0].size_unit).toBe(validSizeCondition.size_unit);
                expect(sizeSearchResponse.body.pricing_conditions[0].product.id).toBe(validSizeCondition.product);
                expect(sizeSearchResponse.body.pricing_conditions[0].materials[0].id).toBe(validSizeCondition.materials[0]);
                expect(sizeSearchResponse.body.pricing_conditions[0].client.id).toBe(validSizeCondition.client);
                expect(sizeSearchResponse.body.pricing_conditions[0].company.id).toBe(validSizeCondition.company);
                expect(sizeSearchResponse.body.pricing_conditions[0].colour).toBe(validSizeCondition.colour);
                expect(sizeSearchResponse.body.pricing_conditions[0].threshold).toBe(validSizeCondition.threshold);

                const quantitySearchResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testQuantityConditionID
                    });
                expect(quantitySearchResponse.statusCode).toBe(200);
                expect(quantitySearchResponse.body.count).toBe(1);
                expect(isConditionValid(quantitySearchResponse.body.pricing_conditions[0])).toBe(true);
                expect(quantitySearchResponse.body.pricing_conditions[0].id).toBe(testQuantityConditionID);
                expect(quantitySearchResponse.body.pricing_conditions[0].quantity).toBe(validQuantityCondition.quantity);
                expect(quantitySearchResponse.body.pricing_conditions[0].quantity_unit).toBe(validQuantityCondition.quantity_unit);
                expect(quantitySearchResponse.body.pricing_conditions[0].size).toBe(validQuantityCondition.size);
                expect(quantitySearchResponse.body.pricing_conditions[0].size_unit).toBe(validQuantityCondition.size_unit);
                expect(quantitySearchResponse.body.pricing_conditions[0].product.id).toBe(validQuantityCondition.product);
                expect(quantitySearchResponse.body.pricing_conditions[0].materials[0].id).toBe(validQuantityCondition.materials[0]);
                expect(quantitySearchResponse.body.pricing_conditions[0].client.id).toBe(validQuantityCondition.client);
                expect(quantitySearchResponse.body.pricing_conditions[0].company.id).toBe(validQuantityCondition.company);
                expect(quantitySearchResponse.body.pricing_conditions[0].colour).toBe(validQuantityCondition.colour);
                expect(quantitySearchResponse.body.pricing_conditions[0].threshold).toBe(validQuantityCondition.threshold);
            });
        });
        describe("Specific Pricing Rules", () => {
            it("it should not proceed with creation with the wrong indication for pricing rules", async () => {
                const response = await request(app)
                    .post("/pricings/rules/test")
                    .set('session-token', validSession)
                    .send(pricingRuleObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            it("It should not proceed if the id indicated alreay exists", async () => {
                const response = await request(app)
                    .post(`/pricings/rules/${existingPricingRule.id}`)
                    .set('session-token', validSession)
                    .send(pricingRuleObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            describe("Rule creation Validation", () => {
                const invalidTestingRange = {
                    price_per_unit: {
                        "less than 0": -1,
                        "eual to 0": 0,
                        "invalid type": "string",
                        "missing": undefined
                    },
                    conditions: {
                        "invalid type": [9],
                        "none-array": "string",
                        "missing": undefined
                    }
                };
                Object.keys(invalidTestingRange).forEach((property) => {
                    Object.keys(invalidTestingRange[property]).forEach((situation) => {
                        it(`it should not create a rule if ${property} is ${situation}`, async () => {
                            const invalidObject = { ...pricingRuleObject.validTestingObject, [property]: invalidTestingRange[property][situation] };
                            const response = await request(app)
                                .post("/pricings/rules/new")
                                .set('session-token', validSession)
                                .send(invalidObject);
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
            });
            it("it should create a rule properly with a single condition", async () => {
                const response = await request(app)
                    .post("/pricings/rules/new")
                    .set('session-token', validSession)
                    .send(pricingRuleObject.validTestingObject);
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testPricingRuleID = response.body.id;

                // verify the rule creation is valid:
                const searchResponse = await request(app)
                    .get(`/pricings/rules`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingRuleID
                    });
                expect(searchResponse.statusCode).toBe(200);
                expect(searchResponse.body.pricing_rules.length).toBe(1);
                expect(isRuleValid(searchResponse.body.pricing_rules[0])).toBe(true);
                expect(searchResponse.body.pricing_rules[0].id).toBe(testPricingRuleID);
                expect(searchResponse.body.pricing_rules[0].price_per_unit).toBe(pricingRuleObject.validTestingObject.price_per_unit);
                expect(searchResponse.body.pricing_rules[0].conditions.length).toBe(1);
            });
        });
    });

    describe("PUT: Update specific pricings", () => {
        describe("Specific Pricing Conditions", () => {
            it("it should be able to update the pricing conditions", async () => {
                const sizeResponse = await request(app)
                    .put(`/pricings/conditions/${testSizeConditionID}`)
                    .set('session-token', validSession)
                    .send({
                        ...pricingConditionObject.updateTestingObject,
                        quantity: null,
                        quantity_unit: null
                    });
                expect(sizeResponse.statusCode).toBe(200);

                const quantityResponse = await request(app)
                    .put(`/pricings/conditions/${testQuantityConditionID}`)
                    .set('session-token', validSession)
                    .send({
                        ...pricingConditionObject.updateTestingObject,
                        size: null,
                        size_unit: null
                    });
                expect(quantityResponse.statusCode).toBe(200);

                // verify the conditions update is valid:
                const sizeUpdateResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testSizeConditionID
                    });
                expect(sizeUpdateResponse.statusCode).toBe(200);
                expect(sizeUpdateResponse.body.count).toBe(1);
                expect(isConditionValid(sizeUpdateResponse.body.pricing_conditions[0])).toBe(true);
                expect(sizeUpdateResponse.body.pricing_conditions[0].id).toBe(testSizeConditionID);
                expect(sizeUpdateResponse.body.pricing_conditions[0].quantity).toBe(null);
                expect(sizeUpdateResponse.body.pricing_conditions[0].quantity_unit).toBe(null);
                expect(sizeUpdateResponse.body.pricing_conditions[0].size).toBe(pricingConditionObject.updateTestingObject.size);
                expect(sizeUpdateResponse.body.pricing_conditions[0].size_unit).toBe(pricingConditionObject.updateTestingObject.size_unit);
                expect(sizeUpdateResponse.body.pricing_conditions[0].product.id).toBe(pricingConditionObject.updateTestingObject.product);
                expect(sizeUpdateResponse.body.pricing_conditions[0].materials[0].id).toBe(pricingConditionObject.updateTestingObject.materials[0]);

                const quantityUpdateResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testQuantityConditionID
                    });
                expect(quantityUpdateResponse.statusCode).toBe(200);
                expect(quantityUpdateResponse.body.count).toBe(1);
                expect(isConditionValid(quantityUpdateResponse.body.pricing_conditions[0])).toBe(true);
                expect(quantityUpdateResponse.body.pricing_conditions[0].id).toBe(testQuantityConditionID);
                expect(quantityUpdateResponse.body.pricing_conditions[0].size).toBe(null);
                expect(quantityUpdateResponse.body.pricing_conditions[0].size_unit).toBe(null);
                expect(quantityUpdateResponse.body.pricing_conditions[0].quantity).toBe(pricingConditionObject.updateTestingObject.quantity);
                expect(quantityUpdateResponse.body.pricing_conditions[0].quantity_unit).toBe(pricingConditionObject.updateTestingObject.quantity_unit);
                expect(quantityUpdateResponse.body.pricing_conditions[0].product.id).toBe(pricingConditionObject.updateTestingObject.product);
                expect(quantityUpdateResponse.body.pricing_conditions[0].materials[0].id).toBe(pricingConditionObject.updateTestingObject.materials[0]);
            });

            it("it should be able to update the pricing rule correctly", async () => {
                const response = await request(app)
                    .put(`/pricings/rules/${testPricingRuleID}`)
                    .set('session-token', validSession)
                    .send({
                        ...pricingRuleObject.updateTestingObject
                    });
                expect(response.statusCode).toBe(200);

                const updateResponse = await request(app)
                    .get(`/pricings/rules`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingRuleID
                    });
                expect(updateResponse.statusCode).toBe(200);
                expect(updateResponse.body.count).toBe(1);
                expect(isRuleValid(updateResponse.body.pricing_rules[0])).toBe(true);
                expect(updateResponse.body.pricing_rules[0].id).toBe(testPricingRuleID);
                expect(updateResponse.body.pricing_rules[0].price_per_unit).toBe(pricingRuleObject.updateTestingObject.price_per_unit);
                expect(updateResponse.body.pricing_rules[0].conditions.length).toBe(pricingRuleObject.updateTestingObject.conditions.length);
            });
        });
    });

    describe("DELET: specific pricings", () => {
        it("it should pass the partial deletio and independent deletion of a rule", async () => {
            // then it's association with a new rule should be valid:
            const associationResponse = await request(app)
                .post(`/pricings/rules/new`)
                .set('session-token', validSession)
                .send({
                    ...pricingRuleObject.validTestingObject,
                    conditions: [testSizeConditionID, testQuantityConditionID]
                });
            expect(associationResponse.statusCode).toBe(200);
            expect(associationResponse.body.id).toBeTruthy();

            // deleting one of the condition should result in the complete deletion of the rule
            const deletionResponse = await request(app)
                .delete(`/pricings/conditions/${testSizeConditionID}`)
                .set('session-token', validSession);
            expect(deletionResponse.statusCode).toBe(200);

            const ruleSearchResponse = await request(app)
                .get(`/pricings/rules`)
                .set('session-token', validSession)
                .query({
                    target: 'id',
                    keyword: associationResponse.body.id
                });
            expect(ruleSearchResponse.statusCode).toBe(200);
            expect(ruleSearchResponse.body.count).toBe(0);
            expect(ruleSearchResponse.body.pricing_rules.length).toBe(0);

            // then proceed to delet the lastly created condition:
            const deletionResponse2 = await request(app)
                .delete(`/pricings/conditions/${testQuantityConditionID}`)
                .set('session-token', validSession);
            expect(deletionResponse2.statusCode).toBe(200);
        });

        it("it should delete a specific pricing rule correctly", async () => {
            const response = await request(app)
                .delete(`/pricings/rules/${testPricingRuleID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
        });
    });
});