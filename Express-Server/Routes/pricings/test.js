require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
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
    invalidTestingRange,
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
                const testingRange = {
                    quantity: invalidTestingRange.quantity,
                    size: invalidTestingRange.size,
                    colour: invalidTestingRange.colour,
                    product: invalidTestingRange.product,
                    materials: invalidTestingRange.materials,
                    client: invalidTestingRange.client,
                    company: invalidTestingRange.company,
                    threshold: invalidTestingRange.threshold,
                    quantity_unit: invalidTestingRange.quantity_unit,
                    size_unit: invalidTestingRange.size_unit
                };

                // validating for the quantity based
                Object.keys(testingRange)
                    .filter((key) => key !== "size" && key !== "size_unit")
                    .forEach((key) => {
                        Object.keys(testingRange[key])
                            .forEach((situation) => {
                                it(`it should not create a condition if ${key} is ${situation}`, async () => {
                                    const invalidObject = { ...validQuantityCondition, [key]: testingRange[key][situation] };
                                    const response = await request(app)
                                        .post("/pricings/conditions/new")
                                        .set('session-token', validSession)
                                        .send(invalidObject);
                                    expect(response.statusCode).toBe(400);
                                });
                            });
                    });

                // validating for the size based
                Object.keys(testingRange)
                    .filter((key) => key !== "quantity" && key !== "quantity_unit")
                    .forEach((key) => {
                        Object.keys(testingRange[key])
                            .forEach((situation) => {
                                it(`it should not create a condition if ${key} is ${situation}`, async () => {
                                    const invalidObject = { ...validSizeCondition, [key]: testingRange[key][situation] };
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
                    .post("/search/pricing_conditions")
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testSizeConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(sizeSearchResponse.statusCode).toBe(200);
                expect(sizeSearchResponse.body.count).toBe(1);
                expect(isConditionValid(sizeSearchResponse.body.results[0])).toBe(true);
                expect(sizeSearchResponse.body.results[0].id).toBe(testSizeConditionID);
                expect(sizeSearchResponse.body.results[0].quantity).toBe(validSizeCondition.quantity);
                expect(sizeSearchResponse.body.results[0].quantity_unit).toBe(validSizeCondition.quantity_unit);
                expect(sizeSearchResponse.body.results[0].size).toBe(validSizeCondition.size);
                expect(sizeSearchResponse.body.results[0].size_unit).toBe(validSizeCondition.size_unit);
                expect(sizeSearchResponse.body.results[0].product.id).toBe(validSizeCondition.product);
                expect(sizeSearchResponse.body.results[0].materials[0].id).toBe(validSizeCondition.materials[0]);
                expect(sizeSearchResponse.body.results[0].client.id).toBe(validSizeCondition.client);
                expect(sizeSearchResponse.body.results[0].company.id).toBe(validSizeCondition.company);
                expect(sizeSearchResponse.body.results[0].colour).toBe(validSizeCondition.colour);
                expect(sizeSearchResponse.body.results[0].threshold).toBe(validSizeCondition.threshold);

                const quantitySearchResponse = await request(app)
                    .post("/search/pricing_conditions")
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testQuantityConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(quantitySearchResponse.statusCode).toBe(200);
                expect(quantitySearchResponse.body.count).toBe(1);
                expect(isConditionValid(quantitySearchResponse.body.results[0])).toBe(true);
                expect(quantitySearchResponse.body.results[0].id).toBe(testQuantityConditionID);
                expect(quantitySearchResponse.body.results[0].quantity).toBe(validQuantityCondition.quantity);
                expect(quantitySearchResponse.body.results[0].quantity_unit).toBe(validQuantityCondition.quantity_unit);
                expect(quantitySearchResponse.body.results[0].size).toBe(validQuantityCondition.size);
                expect(quantitySearchResponse.body.results[0].size_unit).toBe(validQuantityCondition.size_unit);
                expect(quantitySearchResponse.body.results[0].product.id).toBe(validQuantityCondition.product);
                expect(quantitySearchResponse.body.results[0].materials[0].id).toBe(validQuantityCondition.materials[0]);
                expect(quantitySearchResponse.body.results[0].client.id).toBe(validQuantityCondition.client);
                expect(quantitySearchResponse.body.results[0].company.id).toBe(validQuantityCondition.company);
                expect(quantitySearchResponse.body.results[0].colour).toBe(validQuantityCondition.colour);
                expect(quantitySearchResponse.body.results[0].threshold).toBe(validQuantityCondition.threshold);
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
                const testRange = {
                    price_per_unit: { ...invalidTestingRange.price_per_unit, "missing": undefined },
                    conditions: invalidTestingRange.conditions
                };
                Object.keys(testRange).forEach((property) => {
                    Object.keys(testRange[property]).forEach((situation) => {
                        it(`it should not create a rule if ${property} is ${situation}`, async () => {
                            const invalidObject = { ...pricingRuleObject.validTestingObject, [property]: testRange[property][situation] };
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
                    .post("/search/pricing_rules")
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
                expect(searchResponse.statusCode).toBe(200);
                expect(searchResponse.body.results.length).toBe(1);
                expect(isRuleValid(searchResponse.body.results[0])).toBe(true);
                expect(searchResponse.body.results[0].id).toBe(testPricingRuleID);
                expect(searchResponse.body.results[0].price_per_unit).toBe(pricingRuleObject.validTestingObject.price_per_unit);
                expect(searchResponse.body.results[0].conditions.length).toBe(1);
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
                    .post("/search/pricing_conditions")
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testSizeConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });

                expect(sizeUpdateResponse.statusCode).toBe(200);
                expect(sizeUpdateResponse.body.count).toBe(1);
                expect(isConditionValid(sizeUpdateResponse.body.results[0])).toBe(true);
                expect(sizeUpdateResponse.body.results[0].id).toBe(testSizeConditionID);
                expect(sizeUpdateResponse.body.results[0].quantity).toBe(null);
                expect(sizeUpdateResponse.body.results[0].quantity_unit).toBe(null);
                expect(sizeUpdateResponse.body.results[0].size).toBe(pricingConditionObject.updateTestingObject.size);
                expect(sizeUpdateResponse.body.results[0].size_unit).toBe(pricingConditionObject.updateTestingObject.size_unit);
                expect(sizeUpdateResponse.body.results[0].product.id).toBe(pricingConditionObject.updateTestingObject.product);
                expect(sizeUpdateResponse.body.results[0].materials[0].id).toBe(pricingConditionObject.updateTestingObject.materials[0]);

                const quantityUpdateResponse = await request(app)
                    .post("/search/pricing_conditions")
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: testQuantityConditionID,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
                expect(quantityUpdateResponse.statusCode).toBe(200);
                expect(quantityUpdateResponse.body.count).toBe(1);
                expect(isConditionValid(quantityUpdateResponse.body.results[0])).toBe(true);
                expect(quantityUpdateResponse.body.results[0].id).toBe(testQuantityConditionID);
                expect(quantityUpdateResponse.body.results[0].size).toBe(null);
                expect(quantityUpdateResponse.body.results[0].size_unit).toBe(null);
                expect(quantityUpdateResponse.body.results[0].quantity).toBe(pricingConditionObject.updateTestingObject.quantity);
                expect(quantityUpdateResponse.body.results[0].quantity_unit).toBe(pricingConditionObject.updateTestingObject.quantity_unit);
                expect(quantityUpdateResponse.body.results[0].product.id).toBe(pricingConditionObject.updateTestingObject.product);
                expect(quantityUpdateResponse.body.results[0].materials[0].id).toBe(pricingConditionObject.updateTestingObject.materials[0]);
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
                    .post("/search/pricing_rules")
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
                expect(updateResponse.statusCode).toBe(200);
                expect(updateResponse.body.count).toBe(1);
                expect(isRuleValid(updateResponse.body.results[0])).toBe(true);
                expect(updateResponse.body.results[0].id).toBe(testPricingRuleID);
                expect(updateResponse.body.results[0].price_per_unit).toBe(pricingRuleObject.updateTestingObject.price_per_unit);
                expect(updateResponse.body.results[0].conditions.length).toBe(pricingRuleObject.updateTestingObject.conditions.length);
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
                    .post("/search/pricing_rules")
                    .set('session-token', validSession)
                    .send({
                        ...testObject.search.defaultStructure,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                target: "id",
                                operator: "eq",
                                keyword: associationResponse.body.id,
                                specification: "default",
                                transformType: null
                            }
                        }
                    });
            expect(ruleSearchResponse.statusCode).toBe(200);
            expect(ruleSearchResponse.body.count).toBe(0);
            expect(ruleSearchResponse.body.results.length).toBe(0);

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