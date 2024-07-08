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
    getTestMaterial,
    getTestProduct,
    getTestClient,
    testObject,
    isMaterialValid,
    isSpecificMaterialValid
} = require('../../utils/TestTools');

describe("Materials Route Testing", () => {
    let validSession;
    let testMaterialID;
    let exsitingMaterial;
    let existingProduct;
    let existingClient;
    let testTransactionID;
    let testPricingConditionID;
    let testPricingRuleID;
    const validSearchObject = testObject.material.validSearchObject;
    const invalidSearchObject = testObject.material.invalidSearchObject;
    const validTestingObject = testObject.material.validTestingObject;
    const updateTestingObject = testObject.material.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingMaterial = await getTestMaterial(app, validSession);
        existingProduct = await getTestProduct(app, validSession);
        existingClient = await getTestClient(app, validSession);
    });

    describe("GET: all materials", () => {
        describe("Session token validation", () => {
            it ("it should not proceed with no session token", async () => {
                const response = await request(app)
                    .get("/materials")
                expect(response.statusCode).toBe(401);
            });
            it ("it should not authroise with invlaid token", async () => {
                const response = await request(app)
                    .get("/materials")
                    .set('session-token', "invalid-token");
                expect(response.statusCode).toBe(401);
            });
        });
        describe ("Behaviour testing", () => {
            it ("it should return 200 with a count vlaue if no page number is provided", async () => {
                const response = await request(app)
                    .get("/materials")
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('count');
                expect(response.body).toHaveProperty('page');
                expect(response.body.materials.length).toBeGreaterThan(0);
                expect(isMaterialValid(response.body.materials[0])).toBe(true);
            });

            describe("SearchTarget Validation", () => {
                const invalidTargets = {
                    "invalid target" : "invalid target",
                    "forbidden target" : process.env.FORBIDDEN_SEARCH_TARGET,
                    "missing target" : undefined,
                    "empty target" : ""
                }
                Object.keys(invalidTargets).forEach((target) => {
                    it (`it should not faithfully return if searching target is ${target}`, async () => {
                        const response = await request(app)
                            .get('/materials')
                            .set('session-token', validSession)
                            .query({ 
                                target: invalidTargets[target],
                                keyword: validSearchObject.en_name
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });

            describe("SearchKeyword Validation", () => {
                const invalidKeywords = {
                    "missing keyword" : undefined,
                    "empty keyword" : "",
                }
                Object.keys(invalidKeywords).forEach((keyword) => {
                    it (`it should not faithfully return if searching keyword is ${keyword}`, async () => {
                        const response = await request(app)
                            .get('/materials')
                            .set('session-token', validSession)
                            .query({ 
                                target: Object.keys(validSearchObject)[0],
                                keyword: invalidKeywords[keyword]
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });

            describe("SearchResult Validation", () => {
                Object.keys(invalidSearchObject).forEach((target) => {
                    it (`it should return even if no matchin records on ${target} are provided`, async() => {
                        const response = await request(app)
                            .get('/materials')
                            .set('session-token', validSession)
                            .query({ 
                                target: target,
                                keyword: invalidSearchObject[target]
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.count).toBe(0);
                        expect(response.body.page).toBeTruthy();
                        expect(response.body.searched).toBe(true);
                        expect(response.body.materials.length).toBe(0);
                    });
                });

                Object.keys(validSearchObject).forEach((target) => {
                    it (`it should return a valid searched response with a matching ${target}`, async () => {
                        const response = await request(app)
                            .get('/materials')
                            .set('session-token', validSession)
                            .query({ 
                                target: target,
                                keyword: validSearchObject[target],
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.materials.length).toBeGreaterThan(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBeGreaterThan(0);
                        expect(response.body.page).toBeTruthy();
                        expect(isMaterialValid(response.body.materials[0])).toBe(true);
                    });
                });

                it ("it should not return counts if page number is provided", async () => {
                    const response = await request(app)
                        .get('/materials')
                        .set('session-token', validSession)
                        .query({ 
                            target: "en_name",
                            keyword: validSearchObject.en_name,
                            page: 1
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body).not.toHaveProperty('count');
                    expect(response.body.page).toBe(1);
                    expect(response.body.materials.length).toBeGreaterThan(0);
                    expect(isMaterialValid(response.body.materials[0])).toBe(true);
                });
            });
        });
    });

    describe("POST: specific material", () => {
        it ("it should not authroise with id indication other than new", async ()=> {
            const response = await request(app)
                .post(`/materials/test`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        it ("it should not create if the id indicated is already existing", async () => {
            const response = await request(app)
                .post(`/materials/${exsitingMaterial.id}`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        describe ("Material creation input Validation", () => {
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
                    it (`it should not create a material if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : invalidTestingRange[property][situation] };
                        const response = await request(app)
                            .post('/materials/new')
                            .set('session-token', validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
        });
        it ("it should create a new material even with null descriptions", async () => {
            const response = await request(app)
                .post('/materials/new')
                .set('session-token', validSession)
                .send({...validTestingObject, descriptions: null});
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();

            const deleteResponse = await request(app)
                .delete(`/materials/${response.body.id}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });
        it ("it should create a new material with full information", async () => {
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
        it ("it should get that specific material", async () => {
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
        it ("it should update that existing material accordingly", async () => {
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

        describe ("Material association in transactions", () => {
            it ("it should update material association in transactions", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({
                        name: "Test Transaction",
                        status: "created",
                        client: existingClient.id,
                        product: existingProduct.id,
                        quantity: 1,
                        materials: [testMaterialID] // testing for material association
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testTransactionID = response.body.id;
            });
            
            it ("material details should appear in transactions", async () => {
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
            it ("it should update material associations in pricing conditions & rules", async () => {
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

            it ("material details should appear in pricing conditions & rules", async () => {
                const conditionResponse = await request(app)
                    .get(`/pricings/conditions`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingConditionID
                    });
                expect(conditionResponse.statusCode).toBe(200);
                expect(conditionResponse.body.pricing_conditions[0].materials.length).toBe(1);
                expect(conditionResponse.body.pricing_conditions[0].materials[0].id).toBe(testMaterialID);
                expect(conditionResponse.body.pricing_conditions[0].materials[0].en_name).toBe(updateTestingObject.en_name);
                expect(conditionResponse.body.pricing_conditions[0].materials[0].ch_name).toBe(updateTestingObject.ch_name);

                const ruleResponse = await request(app)
                    .get(`/pricings/rules`)
                    .set('session-token', validSession)
                    .query({
                        target: 'id',
                        keyword: testPricingRuleID
                    });
                expect(ruleResponse.statusCode).toBe(200);
                expect(ruleResponse.body.pricing_rules[0].conditions.length).toBe(1);
                expect(ruleResponse.body.pricing_rules[0].conditions[0].materials[0].id).toBe(testMaterialID);
            });
        });
    });

    describe("DELETE: specific material", () => {
        it ("it should delete that specific material & relation to other tables", async () => {
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
                .get(`/pricings/conditions`)
                .set('session-token', validSession)
                .query({
                    target: 'id',
                    keyword: testPricingConditionID
                });
            expect(conditionResponse.statusCode).toBe(200);
            expect(conditionResponse.body.count).toBe(0);

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

