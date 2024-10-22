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
    getTestPricings,
    testObject,
    invalidTestingRange,
    isPricingValid,
} = require('../../utils/TestTools');

describe("/pricings testing", () => {
    let validSession;
    let testQuantityConditionID; // quantity based pricing condition
    let testSizeConditionID; // size based pricing condition
    let exsitingMaterial;
    let existingProduct;
    let existingPricing;
    let existingClient;
    let existingCompany;
    let pricingObject = testObject.pricings;
    let validQuantityCondition;
    let validSizeCondition;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        [
            exsitingMaterial,
            existingProduct,
            existingClient,
            existingCompany,
            existingPricing
        ] = await Promise.all([
            getTestMaterial(app, validSession),
            getTestProduct(app, validSession),
            getTestClient(app, validSession),
            getTestCompany(app, validSession),
            getTestPricings(app, validSession)
        ]);

        // setting up the testing object for pricings:
        pricingObject = {
            ...pricingObject,
            validTestingObject: {
                ...pricingObject.validTestingObject,
                product: existingProduct.id,
                materials: [exsitingMaterial.id],
                client: existingClient.id,
                company: existingCompany.id
            },
            updateTestingObject: {
                ...pricingObject.updateTestingObject,
                product: existingProduct.id,
                materials: [exsitingMaterial.id],
                client: existingClient.id,
                company: existingCompany.id
            }
        };

        // the single type of numerical condition
        validSizeCondition = {
            ...pricingObject.validTestingObject,
            quantity: null,
            quantity_unit: null
        };
        validQuantityCondition = {
            ...pricingObject.validTestingObject,
            size: null,
            size_unit: null,
            threshold: null
        };
    });

    describe("POST: Specific Pricings", () => {
        describe("Specific Pricing Conditions", () => {
            it("it should not proceed with creation with the wrong indication for pricing conditions", async () => {
                const response = await request(app)
                    .post("/pricings/test")
                    .set('session-token', validSession)
                    .send(pricingObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            it("it should not proceed if the id indicated already exists", async () => {
                const response = await request(app)
                    .post(`/pricings/${existingPricing.id}`)
                    .set('session-token', validSession)
                    .send(pricingObject.validTestingObject);
                expect(response.statusCode).toBe(400);
            });

            // pricing specific tests:
            describe("Condition Creation validation", () => {
                it("it should not create a condition if the corresponding quantity_unit exists but not the value", async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({ ...validQuantityCondition, quantity: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a condition if the corresponding quantity_unit does not exists but quantity does", async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({ ...validQuantityCondition, quantity_unit: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a condition if the corresponding size_unit exists but not the value", async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({ ...validSizeCondition, size: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a condition if the corresponding size_unit does not exists but size does", async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({ ...validSizeCondition, size_unit: null });
                    expect(response.statusCode).toBe(400);
                });
                it("it should not create a size condition if the corresponding threshold has no the value", async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({ ...validSizeCondition, threshold: null });
                    expect(response.statusCode).toBe(400);
                });

                // testing for the validity of each field:
                const testingRange = {
                    product: invalidTestingRange.product,
                    price_per_unit: invalidTestingRange.price_per_unit,
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

                // validating for each attribute
                Object.keys(testingRange)
                    .forEach((key) => {
                        Object.keys(testingRange[key])
                            .forEach((situation) => {
                                it(`it should not create a condition if ${key} is ${situation}`, async () => {
                                    const invalidObject = { ...validQuantityCondition, [key]: testingRange[key][situation] };
                                    const response = await request(app)
                                        .post("/pricings/new")
                                        .set('session-token', validSession)
                                        .send(invalidObject);
                                    expect(response.statusCode).toBe(400);
                                });
                            });
                    });

                // testing for nullable creation:
                it(`should create a condition even if everything but product & price is null`, async () => {
                    const response = await request(app)
                        .post("/pricings/new")
                        .set('session-token', validSession)
                        .send({
                            product: pricingObject.validTestingObject.product,
                            price_per_unit: pricingObject.validTestingObject.price_per_unit
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.id).toBeTruthy();

                    const deleteResponse = await request(app)
                        .delete(`/pricings/${response.body.id}`)
                        .set('session-token', validSession);
                    expect(deleteResponse.statusCode).toBe(200);
                });
            });

            // it should be able to create a condition that covers both quantity and size
            it("it should allow creation a condition with both quantity baseline and size with threshold", async () => {
                const response = await request(app)
                    .post("/pricings/new")
                    .set('session-token', validSession)
                    .send(pricingObject.validTestingObject);
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();

                const deleteResponse = await request(app)
                    .delete(`/pricings/${response.body.id}`)
                    .set('session-token', validSession);
                expect(deleteResponse.statusCode).toBe(200);
            });

            // it should create properly for those two types of conditions
            it("it should create properly for both types of conditions & verify the creation of multiple conditions", async () => {
                const sizeResponse = await request(app)
                    .post("/pricings/new")
                    .set('session-token', validSession)
                    .send(validSizeCondition);
                expect(sizeResponse.statusCode).toBe(200);
                expect(sizeResponse.body.id).toBeTruthy();
                testSizeConditionID = sizeResponse.body.id;

                const quantityResponse = await request(app)
                    .post("/pricings/new")
                    .set('session-token', validSession)
                    .send(validQuantityCondition);
                expect(quantityResponse.statusCode).toBe(200);
                expect(quantityResponse.body.id).toBeTruthy();
                testQuantityConditionID = quantityResponse.body.id;

                // verify the condition creation is valid:
                const sizeSearchResponse = await request(app)
                    .get(`/pricings/${testSizeConditionID}`)
                    .set('session-token', validSession);
                
                expect(sizeSearchResponse.statusCode).toBe(200);
                expect(isPricingValid(sizeSearchResponse.body.pricing)).toBe(true);
                expect(sizeSearchResponse.body.pricing.id).toBe(testSizeConditionID);
                expect(sizeSearchResponse.body.pricing.product.id).toBe(validSizeCondition.product);
                expect(sizeSearchResponse.body.pricing.price_per_unit).toBe(validSizeCondition.price_per_unit);
                expect(sizeSearchResponse.body.pricing.quantity).toBe(validSizeCondition.quantity);
                expect(sizeSearchResponse.body.pricing.quantity_unit).toBe(validSizeCondition.quantity_unit);
                expect(sizeSearchResponse.body.pricing.size).toBe(validSizeCondition.size);
                expect(sizeSearchResponse.body.pricing.size_unit).toBe(validSizeCondition.size_unit);
                expect(sizeSearchResponse.body.pricing.product.id).toBe(validSizeCondition.product);
                expect(sizeSearchResponse.body.pricing.materials[0].id).toBe(validSizeCondition.materials[0]);
                expect(sizeSearchResponse.body.pricing.client.id).toBe(validSizeCondition.client);
                expect(sizeSearchResponse.body.pricing.company.id).toBe(validSizeCondition.company);
                expect(sizeSearchResponse.body.pricing.colour).toBe(validSizeCondition.colour);
                expect(sizeSearchResponse.body.pricing.threshold).toBe(validSizeCondition.threshold);

                const quantitySearchResponse = await request(app)
                    .get(`/pricings/${testQuantityConditionID}`)
                    .set('session-token', validSession);

                expect(quantitySearchResponse.statusCode).toBe(200);
                expect(isPricingValid(quantitySearchResponse.body.pricing)).toBe(true);
                expect(quantitySearchResponse.body.pricing.id).toBe(testQuantityConditionID);
                expect(quantitySearchResponse.body.pricing.quantity).toBe(validQuantityCondition.quantity);
                expect(quantitySearchResponse.body.pricing.quantity_unit).toBe(validQuantityCondition.quantity_unit);
                expect(quantitySearchResponse.body.pricing.size).toBe(validQuantityCondition.size);
                expect(quantitySearchResponse.body.pricing.size_unit).toBe(validQuantityCondition.size_unit);
                expect(quantitySearchResponse.body.pricing.product.id).toBe(validQuantityCondition.product);
                expect(quantitySearchResponse.body.pricing.materials[0].id).toBe(validQuantityCondition.materials[0]);
                expect(quantitySearchResponse.body.pricing.client.id).toBe(validQuantityCondition.client);
                expect(quantitySearchResponse.body.pricing.company.id).toBe(validQuantityCondition.company);
                expect(quantitySearchResponse.body.pricing.colour).toBe(validQuantityCondition.colour);
                expect(quantitySearchResponse.body.pricing.threshold).toBe(validQuantityCondition.threshold);
            });
        });
    });

    describe("PUT: Update specific pricings", () => {
        it("it should be able to update the pricing conditions", async () => {
            const sizeResponse = await request(app)
                .put(`/pricings/${testSizeConditionID}`)
                .set('session-token', validSession)
                .send({
                    ...pricingObject.updateTestingObject,
                    quantity: null,
                    quantity_unit: null
                });
            expect(sizeResponse.statusCode).toBe(200);

            const quantityResponse = await request(app)
                .put(`/pricings/${testQuantityConditionID}`)
                .set('session-token', validSession)
                .send({
                    ...pricingObject.updateTestingObject,
                    size: null,
                    size_unit: null,
                    threshold: null,
                });
            expect(quantityResponse.statusCode).toBe(200);

            // verify the conditions update is valid:
            const sizeUpdateResponse = await request(app)
                .get(`/pricings/${testSizeConditionID}`)
                .set('session-token', validSession);

            expect(sizeUpdateResponse.statusCode).toBe(200);
            expect(isPricingValid(sizeUpdateResponse.body.pricing)).toBe(true);
            expect(sizeUpdateResponse.body.pricing.id).toBe(testSizeConditionID);
            expect(sizeUpdateResponse.body.pricing.price_per_unit).toBe(pricingObject.updateTestingObject.price_per_unit);
            expect(sizeUpdateResponse.body.pricing.quantity).toBe(null);
            expect(sizeUpdateResponse.body.pricing.quantity_unit).toBe(null);
            expect(sizeUpdateResponse.body.pricing.threshold).toBe(pricingObject.updateTestingObject.threshold);
            expect(sizeUpdateResponse.body.pricing.size).toBe(pricingObject.updateTestingObject.size);
            expect(sizeUpdateResponse.body.pricing.size_unit).toBe(pricingObject.updateTestingObject.size_unit);
            expect(sizeUpdateResponse.body.pricing.product.id).toBe(pricingObject.updateTestingObject.product);
            expect(sizeUpdateResponse.body.pricing.materials[0].id).toBe(pricingObject.updateTestingObject.materials[0]);

            const quantityUpdateResponse = await request(app)
                .get(`/pricings/${testQuantityConditionID}`)
                .set('session-token', validSession);

            expect(quantityUpdateResponse.statusCode).toBe(200);
            expect(isPricingValid(quantityUpdateResponse.body.pricing)).toBe(true);
            expect(quantityUpdateResponse.body.pricing.id).toBe(testQuantityConditionID);
            expect(quantityUpdateResponse.body.pricing.price_per_unit).toBe(pricingObject.updateTestingObject.price_per_unit);
            expect(quantityUpdateResponse.body.pricing.size).toBe(null);
            expect(quantityUpdateResponse.body.pricing.size_unit).toBe(null);
            expect(quantityUpdateResponse.body.pricing.threshold).toBe(null);
            expect(quantityUpdateResponse.body.pricing.quantity).toBe(pricingObject.updateTestingObject.quantity);
            expect(quantityUpdateResponse.body.pricing.quantity_unit).toBe(pricingObject.updateTestingObject.quantity_unit);
            expect(quantityUpdateResponse.body.pricing.product.id).toBe(pricingObject.updateTestingObject.product);
            expect(quantityUpdateResponse.body.pricing.materials[0].id).toBe(pricingObject.updateTestingObject.materials[0]);
        });
    });

    describe("DELET: specific pricings", () => {
        it("it should pass the partial conditioned pricings", async () => {
            const deletionResponse = await request(app)
                .delete(`/pricings/${testSizeConditionID}`)
                .set('session-token', validSession);
            expect(deletionResponse.statusCode).toBe(200);

            const deletionResponse2 = await request(app)
                .delete(`/pricings/${testQuantityConditionID}`)
                .set('session-token', validSession);
            expect(deletionResponse2.statusCode).toBe(200);
        });
    });
});