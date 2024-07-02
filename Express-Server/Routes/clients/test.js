require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const express = require('express');
const { getConfiguration, 
        getDBconnection, 
        closeDBConnection,
        getTestSession 
} = require('../../utils/Configurator');
const { AuthenticationLogger } = require('../../utils/AuthMiddleware');

// set up the testing target:
const db = getDBconnection();
const clientsRouter = require('./file')(db);
const authRouter = require('../auth/file')(db);
const config = getConfiguration();

describe('Clients Router', () => {
    // setting up the testing app
    let app;
    let validSession;
    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use('/auth', authRouter);
        app.use(AuthenticationLogger);
        app.use('/clients', clientsRouter);

        // setting up valid session
        validSession = await getTestSession(app);
    });

    //  sett up the valid testings:
    const validSearchObject = {
        id: "eef39",
        full_name: "one",
        email: "one",
        phone: "6789",
        wechat_contact: "wo5678",
        qq_contact: "7890",
        company: "glob"
    }
    const invalidSearchObject = {
        id: "!@#$%^&*",
        full_name: "!@#$%^&*",
        email: "!7#$%^&*",
        phone: "-611111111111",
        wechat_contact: "@*(@#)98",
        qq_contact: "@*(@#)98",
        company: "!@#$%^&*",
    }
    const invalidEmialSuffix = "@g.com";
    
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
    })
    
    // Test case for manipulating a specific client instance

    // helper function
    function isClientValid(client){
        if ('id' in client &&
            'full_name' in client &&
            'email' in client &&
            'phone' in client &&
            'wechat_contact' in client &&
            'qq_contact' in client &&
            'company' in client
        ){
            return true;
        }
        return false;
    }
})