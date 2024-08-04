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
    testObject,
    invalidTestingRange,
    isSpecificMaterialValid
} = require('../../utils/TestTools');
const { search } = require('../../config/devDefault');

describe("Materials Route Testing", () => {
    let validSession;
    let testMaterialID;
    let exsitingMaterial;
    let existingProduct;
    let existingClient;
    let testTransactionID;
    let testPricingConditionID;
    let testPricingRuleID;
    const validTestingObject = testObject.material.validTestingObject;
    const updateTestingObject = testObject.material.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingMaterial = await getTestMaterial(app, validSession);
        existingProduct = await getTestProduct(app, validSession);
        existingClient = await getTestClient(app, validSession);
    });

    describe("POST: specific material", () => {
        it("it should not authroise with id indication other than new", async () => {
            const response = await request(app)
                .post(`/materials/test`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        it("it should not create if the id indicated is already existing", async () => {
            const response = await request(app)
                .post(`/materials/${exsitingMaterial.id}`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        describe("Material creation input Validation", () => {
            const testRange = {
                en_name: invalidTestingRange.en_name,
                ch_name: invalidTestingRange.ch_name,
                descriptions: invalidTestingRange.descriptions
            };
            Object.keys(testRange).forEach((property) => {
                Object.keys(testRange[property]).forEach((situation) => {
                    it(`it should not create a material if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property]: testRange[property][situation] };
                        const response = await request(app)
                            .post('/materials/new')
                            .set('session-token', validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
        });
        it("it should create a new material even with null descriptions", async () => {
            const response = await request(app)
                .post('/materials/new')
                .set('session-token', validSession)
                .send({ ...validTestingObject, descriptions: null });
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();

            const deleteResponse = await request(app)
                .delete(`/materials/${response.body.id}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });
        it("it should create a new material with full information", async () => {
            const response = await request(app)
                .post('/materials/new')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testMaterialID = response.body.id;
        });
    });

    describe("GET: specific material", () => {
        it("it should get that specific material", async () => {
            const response = await request(app)
                .get(`/materials/${testMaterialID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
            expect(isSpecificMaterialValid(response.body.material)).toBe(true);
            expect(response.body.material.id).toBe(testMaterialID);
            expect(response.body.material.en_name).toBe(validTestingObject.en_name);
            expect(response.body.material.ch_name).toBe(validTestingObject.ch_name);
            expect(response.body.material.descriptions).toBe(validTestingObject.descriptions);
        })
    });

    describe("PUT: specific material", () => {
        it("it should update that existing material accordingly", async () => {
            const response = await request(app)
                .put(`/materials/${testMaterialID}`)
                .set('session-token', validSession)
                .send(updateTestingObject);
            expect(response.statusCode).toBe(200);

            const updatedResponse = await request(app)
                .get(`/materials/${testMaterialID}`)
                .set('session-token', validSession);
            expect(updatedResponse.statusCode).toBe(200);
            expect(isSpecificMaterialValid(updatedResponse.body.material)).toBe(true);
            expect(updatedResponse.body.material.id).toBe(testMaterialID);
            expect(updatedResponse.body.material.en_name).toBe(updateTestingObject.en_name);
            expect(updatedResponse.body.material.ch_name).toBe(updateTestingObject.ch_name);
            expect(updatedResponse.body.material.descriptions).toBe(updateTestingObject.descriptions);
        });

        describe("Material association in transactions", () => {
            it("it should update material association in transactions", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({
                        name: "Test Transaction",
                        status: "created",
                        client: existingClient.id,
                        product: existingProduct.id,
                        quantity: 1,
                        quantity_unit: "pcs",
                        materials: [testMaterialID] // testing for material association
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testTransactionID = response.body.id;
            });

            it("material details should appear in transactions", async () => {
                const response = await request(app)
                    .get(`/transactions/${testTransactionID}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body.transaction.materials.length).toBe(1);
                expect(response.body.transaction.materials[0].id).toBe(testMaterialID);
                expect(response.body.transaction.materials[0].en_name).toBe(updateTestingObject.en_name);
                expect(response.body.transaction.materials[0].ch_name).toBe(updateTestingObject.ch_name);
            });
        });

        describe("Material association in pricing conditions & rules", () => {
            it("it should update material associations in pricing conditions & rules", async () => {
                const response = await request(app)
                    .post('/pricings/conditions/new')
                    .set('session-token', validSession)
                    .send({
                        product: existingProduct.id,
                        materials: [testMaterialID] // testing for material association
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testPricingConditionID = response.body.id;

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

            it("material details should appear in pricing conditions & rules", async () => {
                const conditionResponse = await request(app)
                    .post(`/search/pricing_conditions`)
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
                expect(conditionResponse.body.results[0].materials.length).toBe(1);
                expect(conditionResponse.body.results[0].materials[0].id).toBe(testMaterialID);
                expect(conditionResponse.body.results[0].materials[0].en_name).toBe(updateTestingObject.en_name);
                expect(conditionResponse.body.results[0].materials[0].ch_name).toBe(updateTestingObject.ch_name);

                const ruleResponse = await request(app)
                    .post(`/search/pricing_rules`)
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
                expect(ruleResponse.body.results[0].conditions[0].materials[0].id).toBe(testMaterialID);
            });
        });
    });

    describe("DELETE: specific material", () => {
        it("it should delete that specific material & relation to other tables", async () => {
            const response = await request(app)
                .delete(`/materials/${testMaterialID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);

            // checking that the material references in transactions will be deleted
            const Transactionresponse = await request(app)
                .get(`/transactions/${testTransactionID}`)
                .set('session-token', validSession)
            expect(Transactionresponse.statusCode).toBe(200);
            expect(Transactionresponse.body.transaction.materials).toBe(null);

            const deleteResponse = await request(app)
                .delete(`/transactions/${testTransactionID}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);

            // checking its deletion in conditions & rules (pricing records will be removed)
            const conditionResponse = await request(app)
                .post(`/search/pricing_conditions`)
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

            const ruleResponse = await request(app)
                .post(`/search/pricing_rules`)
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

