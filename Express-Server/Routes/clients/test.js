require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const {
    getTestSession,
    getTestCompany,
    getTestClient,
    testObject,
    invalidTestingRange,
    isClientValid,
    isSpecificClientValid,
    isSpecificAddressValid
} = require('../../utils/TestTools');
const app = global.testApp;

describe('Clients Router', () => {
    // setting up the testing instances
    let validSession;
    let validCompany;
    let testingClientId;
    let existingClient;

    //  sett up the testing cases needed
    const validSearchObject = testObject.client.validSearchObject;
    const invalidSearchObject = testObject.client.invalidSearchObject;
    const validNewAddress = testObject.client.validNewAddress;
    let validTestingObject = testObject.client.validTestingObject;
    const updateTestingObject = testObject.client.updateTestingObject;

    beforeAll(async () => {
        // setting up valid session
        validSession = await getTestSession(app);

        //creating a testing reference to an associated company
        validCompany = await getTestCompany(app, validSession);
        validTestingObject = {...testObject.client.validTestingObject, company : validCompany.id};

        // get an existing client for testing on references:
        existingClient = await getTestClient(app, validSession);
    });
    
    // Test cases for manipulating all client instances:
    describe('GET /', () => {
        it ("it should return status 401 if no session-token is provided", async () => {
            const response = await request(app)
                .get('/clients');
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if invalid is provided", async () => {
            const response = await request(app)
                .get('/clients')
                .set("session-token", "invalid-test-token");
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 200 for get all if session-token is valid and no query parameters are specified", async () => {
            const response = await request(app)
                .get('/clients')
                .set("session-token", validSession);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('count');
            expect(response.body.page).toBe(1);
            expect(response.body.clients.length).toBeGreaterThan(0);
            expect(isClientValid(response.body.clients[0])).toBe(true);
        });
        it ("it should return status 200 for get all if session-token is valid and page parameter is provided", async () => {
            const response = await request(app)
                .get('/clients')
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
        describe("search target validation", () => {
            Object.keys(invalidTestingRange.invalidSearchTargets).forEach((situation) => {
                it (`it should return status 400 if search target is ${situation}`, async () => {
                    const response = await request(app)
                        .get('/clients')
                        .set("session-token", validSession)
                        .query({
                            target: invalidTestingRange.invalidSearchTargets[situation],
                            keyword: validSearchObject[Object.keys(validSearchObject)[0]]
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("search keyword validation", () => {
            Object.keys(invalidTestingRange.invalidSearchKeywords).forEach((situation) => {
                it (`it should return status 400 if search keyword is ${situation}`, async () => {
                    const response = await request(app)
                        .get('/clients')
                        .set("session-token", validSession)
                        .query({
                            target: Object.keys(validSearchObject)[0],
                            keyword: invalidTestingRange.invalidSearchKeywords[situation]
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("page validation", () => {
            Object.keys(invalidTestingRange.page).forEach((situation) => {
                it (`it should return status 400 if page is ${situation}`, async () => {
                    const response = await request(app)
                        .get('/clients')
                        .set("session-token", validSession)
                        .query({
                            page: invalidTestingRange.page[situation]
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("Valid result display testings", () => {
            Object.keys(validSearchObject).forEach((target) => {
                it (`it should return status 200 for a valid ${target} search`, async () => {
                    const response = await request(app)
                        .get('/clients/')
                        .set("session-token", validSession)
                        .query({
                            target: target,
                            keyword: validSearchObject[target],
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.searched).toBe(true);
                    expect(response.body.count).toBeGreaterThan(0);
                    expect(response.body.page).toBeTruthy();
                    expect(response.body.clients.length).toBeGreaterThan(0);
                    expect(isClientValid(response.body.clients[0])).toBe(true);
                });
            });
        });
        
        describe("Non-matching result displaying", () => {
            Object.keys(invalidSearchObject).forEach((target) => {
                it (`it should return status 200 for a non-matching ${target} search`, async () => {
                    const response = await request(app)
                        .get('/clients/')
                        .set("session-token", validSession)
                        .query({
                            target: target,
                            keyword: invalidSearchObject[target],
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.searched).toBe(true);
                    expect(response.body.count).toBe(0);
                    expect(response.body.page).toBeTruthy();
                    expect(response.body.clients.length).toBe(0);
                });
            });
        });
    });

    // Test case for manipulating a specific client instance
    describe("specific client ;/clients/:id", () => {

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
        it ("it should not post an instance if id indicated already exists", async () => {
            const response = await request(app)
                .post(`/clients/${existingClient.id}`)
                .set("session-token", validSession)
                .send({
                    ...validTestingObject
                });
            expect(response.statusCode).toBe(400);
        });
        describe("Input validation on each input field", () => {
            const testingRange = {
                full_name: invalidTestingRange.full_name,
                email: Object.fromEntries(
                            Object.entries(invalidTestingRange.email).slice(0,-1)
                        ),
                phone: invalidTestingRange.phone,
                wechat_contact: invalidTestingRange.wechat_contact,
                qq_contact: invalidTestingRange.qq_contact,
                company: invalidTestingRange.company,
                addresses: invalidTestingRange.addresses
            }
            Object.keys(testingRange).forEach((property) => {
                Object.keys(testingRange[property]).forEach((situation) => {
                    it (`it should not create a client if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : testingRange[property][situation] };
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