require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const { 
    getConfiguration, 
} = require('../../utils/Configurator');
const {
    getTestSession,
    getTestCompany,
    testObject,
    isClientValid,
    isSpecificClientValid,
    isSpecificAddressValid
} = require('../../utils/TestTools');
const config = getConfiguration();
const app = global.testApp;

describe('Clients Router', () => {
    // setting up the testing app
    let validSession;
    let validCompany;
    //  sett up the testing cases needed
    const validSearchObject = testObject.client.validSearchObject;
    const invalidSearchObject = testObject.client.invalidSearchObject;
    const validNewAddress = testObject.client.validNewAddress;
    let validTestingObject = testObject.client.validTestingObject;
    const updateTestingObject = testObject.client.updateTestingObject;
    const invalidEmialSuffix = testObject.invalidEmialSuffix;

    beforeAll(async () => {
        // setting up valid session
        validSession = await getTestSession(app);

        //creating a testing reference to an associated company
        validCompany = await getTestCompany(app, validSession);
        validTestingObject = {...testObject.client.validTestingObject, company : validCompany.id};
    });
    
    // Test cases for manipulating all client instances:
    describe('GET /', () => {
        it ("it should return status 401 if no session-token is provided", async () => {
            const response = await request(app)
                .get('/clients/');
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if invalid is provided", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", "invalid-test-token");
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 200 for get all if session-token is valid and no query parameters are specified", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('count');
            expect(response.body.page).toBe(1);
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for get all if session-token is valid and page parameter is provided", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    page: 1
                });
            expect(response.statusCode).toBe(200);
            expect(response.body).not.toHaveProperty('count'); // only show counts if client doesn't know the page
            expect(response.body.page).toBe(1);
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 400 if serached target is not valid", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "testTarget", // invlaid column
                    keyword: validSearchObject.full_name
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if serached target is missing", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    keyword: validSearchObject.full_name
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if search keyword is missing", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if search keyword is an empty string", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                    keyword: ""
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if page is not valid", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                    keyword: validSearchObject.full_name,
                    page: invalidEmialSuffix
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if page is a negative number", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                    keyword: validSearchObject.full_name,
                    page: -1
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if page equals to 0", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                    keyword: validSearchObject.full_name,
                    page: 0
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 200 for a valid id (partial ID allowed) search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "id",
                    keyword: validSearchObject.id,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for a valid email search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    searched: true,
                    target: "email",
                    keyword: validSearchObject.email,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for a valid phone search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "phone",
                    keyword: validSearchObject.phone,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for a valid wechat_contact search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "wechat_contact",
                    keyword: validSearchObject.wechat_contact,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for a valid qq_contact search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "qq_contact",
                    keyword: validSearchObject.qq_contact,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for a valid company name search", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "company",
                    keyword: validSearchObject.company,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return 400 if searched target is forbidden", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: process.env.FORBIDDEN_SEARCH_TARGET,
                    keyword: validSearchObject.full_name
                });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return 200 even if the valid search target has no results (full_name)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "id",
                    keyword: invalidSearchObject.id,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no results (full_name)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "full_name",
                    keyword: invalidSearchObject.full_name,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no (email)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "email",
                    keyword: invalidSearchObject.email,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no (phone)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "phone",
                    keyword: invalidSearchObject.phone,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no (wechat)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "wechat_contact",
                    keyword: invalidSearchObject.wechat_contact,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no (qq)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "qq_contact",
                    keyword: invalidSearchObject.qq_contact,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
        it ("it should return 200 even if the valid search target has no (company)", async () => {
            const response = await request(app)
                .get('/clients/')
                .set("session-token", validSession)
                .query({
                    target: "company",
                    keyword: invalidSearchObject.company,
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.page).toBeTruthy();
            expect(response.body.clients.length).toBe(0);
        });
    });

    // Test case for manipulating a specific client instance
    describe("specific client ;/clients/:id", () => {
        let testingClientId;

        //  post sections with a testing instance:
        it ("it should not post an instance if the id indicated is not new", async () => {
            const response = await request(app)
                .post('/clients/test')
                .set("session-token", validSession)
                .send({
                    ...validTestingObject
                });
            expect(response.statusCode).toBe(400);
        });

        describe("Invalid client name tests", () => {
            const invalidFullName = {
                "empty" : "",
                "too long" : `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
                "missing": undefined
            };
            const situations = Object.keys(invalidFullName);
            situations.forEach(situation => {
                const invalidObject = { ...validTestingObject, full_name : invalidFullName[situation] };
                if (situation === "missing") { // remove the property
                    delete invalidObject.full_name;
                }
                it (`it should not create a client if full name is${situation}`, async () => {
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Client creation type validation tests", () => {
            const propertiesToTest = Object.keys(validTestingObject);
            propertiesToTest.forEach(property => {
                it(`should not create a client if ${property} has an invalid type`, async () => {
                    const invalidObject = { ...validTestingObject, [property]: 1 };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
        
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe ("Client email validation tests", () => {
            const situations = {
                "invalid format" : invalidSearchObject.email,
                "too short" : invalidEmialSuffix,
                "too long" : `${"t".repeat(config.limitations.Max_Email_Length)}${invalidEmialSuffix}`,
            }
            Object.keys(situations).forEach(situation => {
                it (`should not create a client if ${situation}`, async () => {
                    const invalidObject = { ...validTestingObject, email : situations[situation] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe ("Client phone validation tests", () => {
            const situations = {
                "invalid format" : invalidSearchObject.phone,
                "too short" : `${validTestingObject.phone.substring(0, config.limitations.Min_Phone_Length - 1)}`,
                "too long" : `${"1".repeat(config.limitations.Max_Phone_Length + 1)}`,
            }
            Object.keys(situations).forEach(situation => {
                it (`should not create a client if ${situation}`, async () => {
                    const invalidObject = { ...validTestingObject, phone : situations[situation] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe ("Client wechat validation tests", () => {
            const situations = {
                "invalid format" : invalidSearchObject.wechat_contact,
                "too short" : `${"t".repeat(config.limitations.Min_Social_Contact_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_Social_Contact_Length + 1)}`,
            }
            Object.keys(situations).forEach(situation => {
                it (`should not create a client if ${situation}`, async () => {
                    const invalidObject = { ...validTestingObject, wechat_contact : situations[situation] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        
        describe ("Client qq validation tests", () => {
            const situations = {
                "invalid format" : invalidSearchObject.qq_contact,
                "too short" : `${"1".repeat(config.limitations.Min_Social_Contact_Length - 1)}`,
                "too long" : `${"1".repeat(config.limitations.Max_Social_Contact_Length + 1)}`,
            }
            expect (Object.keys(situations).length).toBe(3);
            Object.keys(situations).forEach(situation => {
                it (`should not create a client if ${situation}`, async () => {
                    const invalidObject = { ...validTestingObject, qq_contact : situations[situation] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe ("Client company validation tests", () => {
            const situations = {
                "non-UUID" : invalidSearchObject.company,
                "non-exsitence ID": process.env.TEST_CLIENT_ID, // passing client id as company id
            };
            Object.keys(situations).forEach(situation => {
                it (`should not create a client if ${situation}`, async () => {
                    const invalidObject = { ...validTestingObject, company : situations[situation] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe ("Client Address validation tests", () => {
            it ("should not create a client if address is not an array", async () => {
                const invalidObject = { ...validTestingObject, addresses : "testString" };
                const response = await request(app)
                    .post('/clients/new')
                    .set("session-token", validSession)
                    .send(invalidObject);
                expect(response.statusCode).toBe(400);
            });
            const nonNullproperties = Object.keys(validNewAddress);
            nonNullproperties.forEach(property => {
                it (`should not create a client if its address ${property} is null`, async () => {
                    const invalidObject = { ...validTestingObject, addresses : [{
                        ...validNewAddress,
                        [property] : null
                    }] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
            nonNullproperties.forEach(property => {
                it (`should not create a client address if its ${property} is not in the correct format`, async () => {
                    const invalidObject = { ...validTestingObject, addresses : [{
                        ...validNewAddress,
                        [property] : 1
                    }] };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });

            // validity of each property
            const lengthTests = {
                "street" : {
                    "empty String" : "",
                    "too short" : `${"t".repeat(config.limitations.Min_Address_Length - 1)}`,
                    "too long" : `${"t".repeat(config.limitations.Max_Address_Length + 1)}`,
                },
                "city" : {
                    "empty String" : "",
                    "too short" : `${"t".repeat(config.limitations.Min_City_Length - 1)}`,
                    "too long" : `${"t".repeat(config.limitations.Max_City_Length + 1)}`,
                },
                "state" : {
                    "empty String" : "",
                    "too short" : `${"t".repeat(config.limitations.Min_State_Length - 1)}`,
                    "too long" : `${"t".repeat(config.limitations.Max_State_Length + 1)}`,
                },
                "country" : {
                    "empty String" : "",
                    "too short" : `${"t".repeat(config.limitations.Min_Country_Length - 1)}`,
                    "too long" : `${"t".repeat(config.limitations.Max_Country_Length + 1)}`,
                },
                "postal" : {
                    "empty String" : "",
                    "too short" : `${"t".repeat(config.limitations.Min_Postal_Length - 1)}`,
                    "too long" : `${"t".repeat(config.limitations.Max_Postal_Length + 1)}`,
                },
                "category" : {
                    "empty Array" : [],
                    "invalid type" : ["test", "run"]
                }
            };

            Object.keys(lengthTests).forEach(property => {
                Object.keys(lengthTests[property]).forEach(situation => {
                    it (`should not create a client address if its ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, addresses : [{
                            ...validNewAddress,
                            [property] : lengthTests[property][situation]
                        }] };
                        const response = await request(app)
                            .post('/clients/new')
                            .set("session-token", validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
        });
        // testing the ability to create a new testing instances with nullable property:
        describe ("Client creation with nullable properties", () => {
            const nullableProperties = Object.keys(validTestingObject).filter(property => property !== "full_name");
            nullableProperties.forEach(property => {
                it (`should create a client if ${property} is null`, async () => {
                    const invalidObject = { ...validTestingObject, [property] : null };
                    const response = await request(app)
                        .post('/clients/new')
                        .set("session-token", validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(200);
                    expect(response.body.id).toBeTruthy();

                    const deleteResponse = await request(app)
                        .delete(`/clients/${response.body.id}`)
                        .set("session-token", validSession);
                    expect(deleteResponse.statusCode).toBe(200);
                });
            });
        });
        it (`should create a client if all column fields are fulfilled`, async () => {
            const response = await request(app)
                .post('/clients/new')
                .set("session-token", validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testingClientId = response.body.id;
        });
        
        // testing getting that newly created testing instance:
        describe("GET Method testing", () => {
            it ("it should get that newly created testing instance", async () => {
                const response = await request(app)
                    .get(`/clients/${testingClientId}`)
                    .set("session-token", validSession);
                expect(response.statusCode).toBe(200);
                const respondedClient = response.body.client;
                expect(isSpecificClientValid(respondedClient)).toBe(true);
                expect(respondedClient.id).toBe(testingClientId);
                expect(respondedClient.full_name).toBe(validTestingObject.full_name);
                expect(respondedClient.email).toBe(validTestingObject.email);
                expect(respondedClient.phone).toBe(validTestingObject.phone);
                expect(respondedClient.wechat_contact).toBe(validTestingObject.wechat_contact);
                expect(respondedClient.qq_contact).toBe(validTestingObject.qq_contact);
                expect(respondedClient.company.id).toBe(validTestingObject.company);
                expect(respondedClient.addresses.length).toBe(1);
                expect(isSpecificAddressValid(respondedClient.addresses[0])).toBe(true);
                expect(respondedClient.addresses[0].id).toBeTruthy();
                updateTestingObject.addresses[0].id = respondedClient.addresses[0].id; // prepare for update testing
                expect(respondedClient.addresses[0].street).toBe(validNewAddress.street);
                expect(respondedClient.addresses[0].city).toBe(validNewAddress.city);
                expect(respondedClient.addresses[0].state).toBe(validNewAddress.state);
                expect(respondedClient.addresses[0].country).toBe(validNewAddress.country);
                expect(respondedClient.addresses[0].postal).toBe(validNewAddress.postal);
                expect(respondedClient.addresses[0].category[0]).toBe(validNewAddress.category[0]);
            });
        });

        // testing updating that newly created testing instance:
        describe("PUT Method testing",  () => {
            it ("it should update that newly created testing instance", async () => {
                const response = await request(app)
                    .put(`/clients/${testingClientId}`)
                    .set("session-token", validSession)
                    .send(updateTestingObject);
                expect(response.statusCode).toBe(200);

                const UpdatedResponse = await request(app)
                    .get(`/clients/${testingClientId}`)
                    .set("session-token", validSession);
                expect(UpdatedResponse.statusCode).toBe(200);

                const UpdatedClient = UpdatedResponse.body.client;
                expect(isSpecificClientValid(UpdatedClient)).toBe(true);
                expect(UpdatedClient.id).toBe(testingClientId);
                expect(UpdatedClient.full_name).toBe(updateTestingObject.full_name);
                expect(UpdatedClient.email).toBe(updateTestingObject.email);
                expect(UpdatedClient.phone).toBe(updateTestingObject.phone);
                expect(UpdatedClient.wechat_contact).toBe(updateTestingObject.wechat_contact);
                expect(UpdatedClient.qq_contact).toBe(updateTestingObject.qq_contact);
                expect(UpdatedClient.company).toBe(updateTestingObject.company);
                expect(UpdatedClient.addresses.length).toBe(updateTestingObject.addresses.length);
            });
        });

        // testing the deletion of that newly created testing instance
        describe("DELETE Method testing", () => {
            it ("it should delete that newly created testing instance", async () => {
                const response = await request(app)
                    .delete(`/clients/${testingClientId}`)
                    .set("session-token", validSession);
                expect(response.statusCode).toBe(200);
            });
        });
    });
})