require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const { isTokenExpired } = require('../../utils/AuthMiddleware');

// set up the testing target:
const app = global.testApp;
const { 
    invalidTestingRange
} = require('../../utils/TestTools');

describe('Authentication Router', () => {
    // setting up the testing app
    let validSession;

    // setting up invalid testing target:
    const validTestEmail = process.env.TEST_EMAIL;
    const validTestPassword = process.env.TEST_PW;

    // testing the login route
    describe("POST /", () => {
        describe("Validation for email input", () => {
            Object.keys(invalidTestingRange.email).forEach((situation) => {
                it (`it should not login if email is ${situation}`, async () => {
                    const response = await request(app).post('/auth').send({
                        email: invalidTestingRange.email[situation],
                        password: validTestPassword
                    });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Validation for password input", () => {
            Object.keys(invalidTestingRange.password).forEach((situation) => {
                it (`it should not login if password is ${situation}`, async () => {
                    const response = await request(app).post('/auth').send({
                        email: validTestEmail,
                        password: invalidTestingRange.password[situation]
                    });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        it ("it should return status 200 if credentials are valid", async () => {
            const response = await request(app).post('/auth').send({
                email: validTestEmail,
                password: validTestPassword
            });
            expect(response.statusCode).toBe(200);
            expect(response.body.session).toBeTruthy();
            expect(isTokenExpired(response.body.session)).toBe(false);
            expect(response.body.session).toBeTruthy();
            expect(response.body.email).toBe(validTestEmail);
            expect(response.body.username).toBeTruthy();
            expect(response.body.role).toBeTruthy();
            validSession = response.body.session;
        });
    });

    //vlidate the loggout route
    describe("POST /logout", () => {
        describe("Validation for email input", () => {
            Object.keys(invalidTestingRange.email).forEach((situation) => {
                it (`it should not logout if email is ${situation}`, async () => {
                    const response = await request(app).post('/auth/logout').send({
                        email: invalidTestingRange.email[situation],
                        token: validSession
                    });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Validation for token input", () => {
            Object.keys(invalidTestingRange.loggOutToken).forEach((situation) => {
                it (`it should not logout if token is ${situation}`, async () => {
                    const response = await request(app).post('/auth/logout').send({
                        email: validTestEmail,
                        token: invalidTestingRange.loggOutToken[situation]
                    });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        it ("it should return status 200 if credentials are valid", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: validTestEmail,
                token: validSession
            });
            expect(response.statusCode).toBe(200);
        })
    });
})

