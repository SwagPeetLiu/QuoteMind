require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const express = require('express');
const { getConfiguration, getDBconnection, closeDBConnection } = require('../../utils/Configurator');
const { isTokenExpired } = require('../../utils/AuthMiddleware');

// set up the testing target:
const db = getDBconnection();
const authRouter = require('./file')(db);
const config = getConfiguration();

describe('Authentication Router', () => {
    // setting up the testing app
    let app;
    let validSession;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/auth', authRouter);
    });

    afterAll(async () => {
        await closeDBConnection();
    });

    // setting up invalid testing target:
    const invalidEmailSuffix = "@g.com";
    const validTestEmail = process.env.TEST_EMAIL;
    const validTestPassword = process.env.TEST_PW;
    const anotherEmail = process.env.ANOTHER_EMAIL;

    // testing the login route
    describe("POST /", () => {
        it ("it should return status 400 if credentials are missing", async () => {
            const response = await request(app).post('/auth').send({
                email: validTestEmail
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if credentials are empty strings", async () => {
            const response = await request(app).post('/auth').send({
                email: '',
                password: ''
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email has invalid formatted", async () => {
            const response = await request(app).post('/auth').send({
                email: 't',
                password: validTestPassword
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email length is less than minimum", async () => {
            const response = await request(app).post('/auth').send({
                email: `t${invalidEmailSuffix}`,
                password: validTestPassword
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email length is exceeds the maximum", async () => {
            const response = await request(app).post('/auth').send({
                email: `${"t".repeat(config.limitations.Max_Email_Length)}${invalidEmailSuffix}`,
                password: validTestPassword
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if the password length is less than minimum", async () => {
            const response = await request(app).post('/auth').send({
                email: validTestEmail,
                password: `${"t".repeat(config.limitations.Min_Password_Length - 1)}`
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if the password length is greater than maximum", async () => {
            const response = await request(app).post('/auth').send({
                email: validTestEmail,
                password: `${"t".repeat(config.limitations.Max_Password_Length + 1)}`
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 401 if credentials are invalid", async () => {
            const response = await request(app).post('/auth').send({
                email: validTestEmail,
                password: `${validTestPassword}test`
            });
            expect(response.statusCode).toBe(401);
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
        it ("it should return status 401 if email is missing", async () => {
            const response = await request(app).post('/auth/logout').send({
                session: validSession
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if email is an empty string", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: '',
                token: validSession
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if email is not matching the token", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: anotherEmail,
                token: validSession
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if token is missing", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: validTestEmail
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if token is an empty string", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: validTestEmail,
                token: ''
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 401 if token is not the current type", async () => {
            const response = await request(app).post('/auth/logout').send({
                email: validTestEmail,
                token: 999
            });
            expect(response.statusCode).toBe(401);
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

