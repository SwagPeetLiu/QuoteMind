require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const { 
    getConfiguration, 
} = require('../../utils/Configurator');
const {
    getTestSession,
    getTestClient,
    testObject,
    isCompanyValid,
    isSpecificCompanyValid,
    isSpecificAddressValid
} = require('../../utils/TestTools');
const config = getConfiguration();
const app = global.testApp;

describe ("Companies Router", () => {
    // setting up the testing instances:
    let validSession;
    let validClient;
    const validSearchObject = testObject.company.validSearchObject;
    const invalidSearchObject = testObject.company.invalidSearchObject;
    const validNewAddress = testObject.company.validNewAddress;
    const validTestingObject = testObject.company.validTestingObject;
    const updateTestingObject = testObject.company.updateTestingObject;
    const invalidEmailSuffix = testObject.invalidEmailSuffix;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        validClient = await getTestClient(app, validSession);
    });

    describe ("GET /", () => {
        describe ("invalid sessino-tokens testings", () => {
            it ("it should not authroise any access without token", async () => {
                const response = await request(app)
                    .get('/companies');
                expect(response.statusCode).toBe(401);
            });
            it ("it should not authroise any access with invalid token", async () => {
                const response = await request(app)
                    .get('/companies')
                    .set('session-token', 'invalid-test-token');
                expect(response.statusCode).toBe(401);
            });
        });

        describe("Behaviour Testing regarding the get all endpoints", () => {
            it ("it should return 200 with a count value if no page number is provided", async () => {
                const response = await request(app)
                    .get('/companies')
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('count');
                expect(response.body).toHaveProperty('page');
                expect(response.body.companies.length).toBeGreaterThan(0);
                expect(isCompanyValid(response.body.companies[0])).toBe(true);
            });
            it ("it should return 200 without a count value if page number is provided", async () => {
                const response = await request(app)
                    .get('/companies')
                    .set('session-token', validSession)
                    .query({ page: 1 });
                expect(response.statusCode).toBe(200);
                expect(response.body).not.toHaveProperty('count');
                expect(response.body.page).toBe(1);
                expect(response.body.companies.length).toBeGreaterThan(0);
                expect(isCompanyValid(response.body.companies[0])).toBe(true);
            });
            describe("Search Target Validation Testings", () => {
                const invalidTargets = {
                    "invalid target" : "invalid target",
                    "forbidden target" : process.env.FORBIDDEN_SEARCH_TARGET
                };
                Object.keys(invalidTargets).forEach((target) => {
                    it (`it should not faithfully if searching target is ${target}`, async () => {
                        const response = await request(app)
                            .get('/companies')
                            .set('session-token', validSession)
                            .query({ 
                                target: invalidTargets[target],
                                keyword: validSearchObject.full_name,
                             });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
            describe("Testing for missing searching information", () => {
                it (`it should not faithfully if searching target is missing`, async () => {
                    const response = await request(app)
                        .get('/companies')
                        .set('session-token', validSession)
                        .query({ 
                            keyword: validSearchObject.full_name
                        });
                    expect(response.statusCode).toBe(400);
                });
                it (`it should not faithfully if searching keyword is missing`, async () => {
                    const response = await request(app)
                        .get('/companies')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                        });
                    expect(response.statusCode).toBe(400);
                });
                it (`it should not faithfully if searching keyword is an empty string`, async () => {
                    const response = await request(app)
                        .get('/companies')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                            keyword: ""
                        });
                    expect(response.statusCode).toBe(400);
                });
                it ("it should not faithfully if page number is wrongly formatted", async () => {
                    const response = await request(app)
                        .get('/companies')
                        .set('session-token', validSession)
                        .query({ 
                            target: "full_name",
                            keyword: validSearchObject.full_name,
                            page: invalidEmailSuffix
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            describe("Testing for searches for non-existence records", () => {
                Object.keys(invalidSearchObject).forEach((property) => {
                    it (`it should return normally even if searching value of ${property} is non-existence`, async () => {
                        const response = await request(app)
                            .get('/companies')
                            .set('session-token', validSession)
                            .query({ 
                                target: property,
                                keyword: invalidSearchObject[property],
                             });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.companies.length).toBe(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBe(0);
                        expect(response.body.page).toBeTruthy();
                    });
                });
            });
            describe("Testing for valid searches for existence records", () => {
                Object.keys(validSearchObject).forEach((property) => {
                    it (`it should return a valid searched response with a matching ${property}`, async () => {
                        const response = await request(app)
                            .get('/companies')
                            .set('session-token', validSession)
                            .query({ 
                                target: property,
                                keyword: validSearchObject[property],
                             });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.companies.length).toBeGreaterThan(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBeGreaterThan(0);
                        expect(response.body.page).toBeTruthy();
                        expect(isCompanyValid(response.body.companies[0])).toBe(true);
                    });
                });
            });
        });
    });

    describe("Testing specific company /:id", () => {
        let testingCompanyID;
        const invalidTestingRange = {
            full_name : {
                "empty" : "",
                "too long" : `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
                "missing": undefined,
                "invalid type": 1,
                "invlaid input": invalidSearchObject.full_name
            },
            email : {
                "too short": invalidEmailSuffix,
                "too long": `${"t".repeat(config.limitations.Max_Email_Length)}${invalidEmailSuffix}`,
                "invalid type": 1
            },
            phone : {
                "invalid format": invalidSearchObject.phone,
                "too short": `${"1".repeat(config.limitations.Min_Phone_Length - 1)}`,
                "too long": `${"1".repeat(config.limitations.Max_Phone_Length + 1)}`,
                "invalid type": 1
            },
            tax_number : {
                "invalid format": invalidEmailSuffix,
                "too short": `${"1".repeat(config.limitations.Min_Tax_Length - 1)}`,
                "too long": `${"1".repeat(config.limitations.Max_Tax_Length + 1)}`,
                "invalid type": 1
            },
            addresses : {
                "invalid type": 1
            }
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
                Object.keys(invalidTestingRange).forEach((property) => {
                    Object.keys(invalidTestingRange[property]).forEach((situation) => {
                        it (`it should not create a company if ${property} is ${situation}`, async () => {
                            const invalidObject = { ...validTestingObject, [property] : invalidTestingRange[property][situation] };
                            const response = await request(app)
                                .post('/companies/new')
                                .set("session-token", validSession)
                                .send(invalidObject);
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
            });

            describe("Testing for validation of addresses", () => {
                const nonNullproperties = Object.keys(validNewAddress);
                nonNullproperties.forEach(property => {
                    it (`should not create a company if its address ${property} is null`, async () => {
                        const invalidObject = { ...validTestingObject, addresses : [{
                            ...validNewAddress,
                            [property] : null
                        }] };
                        const response = await request(app)
                            .post('/companies/new')
                            .set("session-token", validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
                nonNullproperties.forEach(property => {
                    it (`should not create a company if its address ${property} is not in the correct format`, async () => {
                        const invalidObject = { ...validTestingObject, addresses : [{
                            ...validNewAddress,
                            [property] : 1
                        }] };
                        const response = await request(app)
                            .post('/companies/new')
                            .set("session-token", validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });

                // validate for each property of the address:
                const lengthTests = testObject.addresses.lengthTests;
                Object.keys(lengthTests).forEach(property => {
                    Object.keys(lengthTests[property]).forEach(situation => {
                        it (`should not create a company if its address ${property} is ${situation}`, async () => {
                            const invalidObject = { ...validTestingObject, addresses : [{
                                ...validNewAddress,
                                [property] : lengthTests[property][situation]
                            }] };
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
            const invalidMessages = {
                "invalid type": 1,
                "invalid input": "invalid",
                "forbidden type": "update"
            };
            Object.keys(invalidMessages).forEach((situation) => {
                it (`it should not update that newly created company if ${situation}`, async () => {
                    const response = await request(app)
                        .put(`/companies/${testingCompanyId}`)
                        .set("session-token", validSession)
                        .send({ ...validTestingObject, clients: [{ ...validClient, message: invalidMessages[situation] }] });
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