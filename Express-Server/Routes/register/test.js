require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const express = require('express');
const { getConfiguration, getDBconnection, closeDBConnection } = require('../../utils/Configurator');

const db = getDBconnection();
const registerRouter = require('./file')(db);
const config = getConfiguration();

describe('Register Router', () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/register', registerRouter);
    });

    afterAll(async () => {
        await closeDBConnection;
    });

    // setting up invalid testing target:
    const invalidEmailSuffix = "@g.com";
    const validTestUsername = "test Express";
    const existingEmail = process.env.TEST_EMAIL;
    const validTestEmail = "testExpress@gmail.com";
    const validTestPassword = "testPassword%586";
    const validRegisterToken = process.env.REGISTER_TOKEN;

    describe("POST /", () => {
        it ("it should return status 400 if username is missing", async () => {
            const response = await request(app).post('/register').send({
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email is missing", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password is missing", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if registerToken is missing", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if username is an empty string", async () => {
            const response = await request(app).post('/register').send({
                username: '',
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email is an empty string", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: '',
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password is an empty string", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: '',
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if registerToken is an empty string", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: ''
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if username is the wrong type", async () => {
            const response = await request(app).post('/register').send({
                username: 12345,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email is the wrong type", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: 12345,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password is the wrong type", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: 12345,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if registerToken is the wrong type", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: 12345
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if username length is less than minimum", async () => {
            const response = await request(app).post('/register').send({
                username: `${"t".repeat(config.limitations.Min_Username_Length - 1)}`,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if username length is greater than maximum", async () => {
            const response = await request(app).post('/register').send({
                username: `${"t".repeat(config.limitations.Max_Username_Length + 1)}`,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email length is less than minimum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: `t${invalidEmailSuffix}`,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email length is greater than maximum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: `${"t".repeat(config.limitations.Max_Email_Length)}@gmail.com`,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password length is less than minimum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `${"t".repeat(config.limitations.Min_Password_Length - 1)}`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password length is greater than maximum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `${"t".repeat(config.limitations.Max_Password_Length + 1)}`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if registerToken length is less than minimum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: `${"t".repeat(config.limitations.Min_Token_Length - 1)}`
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if registerToken length is greater than maximum", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: `${"t".repeat(config.limitations.Max_Token_Length + 1)}`
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if email is in invalid format", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: `testEmail`,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password does not include at least 3 digits", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `TESTpassword12!`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password does not include at least 3 letters", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `12345123Te!`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password does not include at least a capital letters", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `12345123test!`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if password does not include at least a special letters", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: `12345123Test`,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(400);
        });
        it ("it should return status 400 if token is invalid", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: `${"t".repeat(config.limitations.Min_Token_Length)}`
            });
            expect(response.statusCode).toBe(401);
        });
        it ("it should return status 400 if the provided email has been registered", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: existingEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            });
            expect(response.statusCode).toBe(409);
        });
        it ("it should return status 200 if valid registeration information is provided", async () => {
            const response = await request(app).post('/register').send({
                username: validTestUsername,
                email: validTestEmail,
                password: validTestPassword,
                registerToken: validRegisterToken
            })
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("User created successfully");
            expect(response.body.user.username).toBe(validTestUsername);
            expect(response.body.user.email).toBe(validTestEmail);
            expect(response.body.user.role).toBeTruthy();

            // proceed to remove the testing user:
            try{
                await db.none('DELETE FROM public.user WHERE email = $1', [validTestEmail]);
            }
            catch(err){
                console.error(err);
            }
        });
    });
})