require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const {
    getTestSession,
    getTestClient,
    testObject,
    invalidTestingRange,
    isSpecificCompanyValid,
    isSpecificAddressValid
} = require('../../utils/TestTools');
const app = global.testApp;

describe ("Companies Router", () => {
    // setting up the testing instances:
    let validSession;
    let validClient;
    let testingCompanyID;
    const validTestingObject = testObject.company.validTestingObject;
    const updateTestingObject = testObject.company.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        validClient = await getTestClient(app, validSession);
    });

    // testing specific company
    describe("Testing specific company /:id", () => {
        const testingRange = {
            full_name : invalidTestingRange.full_name,
            email: Object.fromEntries(
                Object.entries(invalidTestingRange.email).slice(0,-1)
            ),
            phone : invalidTestingRange.phone,
            tax_number : invalidTestingRange.tax_number,
            addresses : invalidTestingRange.addresses
        };
        describe("POST: Testing on creating a new instance", () => {
            it ("it should not post an company if the id indicated is not new", async () => {
                const response = await request(app)
                    .post('/companies/test')
                    .set("session-token", validSession)
                    .send(validTestingObject);
                expect(response.statusCode).toBe(400);
            });

            describe("Testing for validation situations", () => {
                Object.keys(testingRange).forEach((property) => {
                    Object.keys(testingRange[property]).forEach((situation) => {
                        it (`it should not create a company if ${property} is ${situation}`, async () => {
                            const invalidObject = { ...validTestingObject, [property] : testingRange[property][situation] };
                            const response = await request(app)
                                .post('/companies/new')
                                .set("session-token", validSession)
                                .send(invalidObject);
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
            });
        });
        describe("testing company creatino with nullable properties", () => {
            const nullableProperties = Object.keys(validTestingObject).filter(property => property !== "full_name");
            nullableProperties.forEach(property => {
                it (`should create a company if ${property} is null`, async () => {
                    const invalidObject = { ...validTestingObject, [property] : null };
                    const response = await request(app)
                        .post('/companies/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(200);
                    expect(response.body.id).toBeTruthy();

                    const deleteResponse = await request(app)
                        .delete(`/companies/${response.body.id}`)
                        .set("session-token", validSession);
                    expect(deleteResponse.statusCode).toBe(200);
                });
            });
        });
        it ("it should create a company if all column fields are fulfilled", async () => {
            const response = await request(app)
                .post('/companies/new')
                .set("session-token", validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testingCompanyId = response.body.id;
        });

        // Testing to get that newly created company
        describe("Testing for getting newly created company", () => {
            it ("it should get that newly created company", async () => {
                const response = await request(app)
                    .get(`/companies/${testingCompanyId}`)
                    .set("session-token", validSession);
                expect(response.statusCode).toBe(200);

                // check on the company level
                expect(isSpecificCompanyValid(response.body.company)).toBe(true);
                expect(response.body.company.id).toBe(testingCompanyId);
                expect(response.body.company.full_name).toBe(validTestingObject.full_name);
                expect(response.body.company.email).toBe(validTestingObject.email);
                expect(response.body.company.phone).toBe(validTestingObject.phone);
                expect(response.body.company.tax_number).toBe(validTestingObject.tax_number);
                expect(response.body.company.addresses.length).toBe(validTestingObject.addresses.length);
                expect(response.body.company.clients).toBe(null);

                // check on the address level
                expect(isSpecificAddressValid(response.body.company.addresses[0])).toBe(true);
                expect(response.body.company.addresses[0].id).toBeTruthy();
                updateTestingObject.addresses[0].id = response.body.company.addresses[0].id; // prepare for updates of this address
                expect(response.body.company.addresses[0].street).toBe(validTestingObject.addresses[0].street);
                expect(response.body.company.addresses[0].city).toBe(validTestingObject.addresses[0].city);
                expect(response.body.company.addresses[0].zip_code).toBe(validTestingObject.addresses[0].zip_code);
                expect(response.body.company.addresses[0].country).toBe(validTestingObject.addresses[0].country);
            });

            it ("it should properly show the associated client once attach an client to that company (revseral attachment)", async () => {
                const response = await request(app)
                    .put(`/clients/${validClient.id}`) // update the assoicated of a valid test client to be in relation with the company
                    .set("session-token", validSession)
                    .send({
                        ...validClient,
                        company: testingCompanyId
                    });
                expect (response.statusCode).toBe(200);

                // check the associated client 
                const UpdatedCompanyResponse = await request(app)
                    .get(`/companies/${testingCompanyId}`)
                    .set("session-token", validSession);
                expect(UpdatedCompanyResponse.statusCode).toBe(200);
                expect(UpdatedCompanyResponse.body.company.clients.length).toBe(1);
                expect(UpdatedCompanyResponse.body.company.clients[0].id).toBe(validClient.id);
                expect(UpdatedCompanyResponse.body.company.clients[0].full_name).toBe(validClient.full_name);
            });
        });

        // testing the ability to update the company
        describe("Testing for updating newly created company", () => {
            Object.keys(invalidTestingRange.clientOpMessage).forEach((situation) => {
                it (`it should not update that newly created company if ${situation}`, async () => {
                    const response = await request(app)
                        .put(`/companies/${testingCompanyId}`)
                        .set("session-token", validSession)
                        .send({ ...validTestingObject, clients: [{ ...validClient, message: invalidTestingRange.clientOpMessage[situation] }] });
                    expect(response.statusCode).toBe(400);
                });
            });

            it ("it should update that newly created company", async () => {
                // testing on the ability to remove client relations & address relations
                const response = await request(app)
                    .put(`/companies/${testingCompanyId}`)
                    .set("session-token", validSession)
                    .send({
                        ...updateTestingObject,
                        clients: [{ ...validClient, message: "delete" }]
                    });
                expect(response.statusCode).toBe(200);

                // check on the company level
                const UpdatedCompanyResponse = await request(app)
                    .get(`/companies/${testingCompanyId}`)
                    .set("session-token", validSession);
                expect(UpdatedCompanyResponse.statusCode).toBe(200);
                expect(isSpecificCompanyValid(UpdatedCompanyResponse.body.company)).toBe(true);
                expect(UpdatedCompanyResponse.body.company.id).toBe(testingCompanyId);
                expect(UpdatedCompanyResponse.body.company.full_name).toBe(updateTestingObject.full_name);
                expect(UpdatedCompanyResponse.body.company.email).toBe(updateTestingObject.email);
                expect(UpdatedCompanyResponse.body.company.phone).toBe(updateTestingObject.phone);
                expect(UpdatedCompanyResponse.body.company.tax_number).toBe(updateTestingObject.tax_number);
                expect(UpdatedCompanyResponse.body.company.addresses.length).toBe(1); // account for deletion of a address & adding another
                expect(UpdatedCompanyResponse.body.company.clients).toBe(null);
            });
        });

        // testing the ability to delete the company:
        describe("Testing for deleting newly created company", () => {
            it ("it should delete that newly created company", async () => {
                const response = await request(app)
                    .delete(`/companies/${testingCompanyId}`)
                    .set("session-token", validSession);
                expect(response.statusCode).toBe(200);

                // check the deletion of the associated client:
                const updatedClientResponse = await request(app)
                    .get(`/clients/${validClient.id}`)
                    .set("session-token", validSession);
                expect(updatedClientResponse.statusCode).toBe(200);
                expect(updatedClientResponse.body.client.company).toBe(null);
            });
        });
    });
});