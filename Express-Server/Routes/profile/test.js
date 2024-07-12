require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// getting test tools:
const {
    getTestSession,
    testObject,
    invalidTestingRange
} = require('../../utils/TestTools');

describe("Profile API", () => {
    let validSession;
    const testEmail = process.env.TEST_EMAIL;
    const otherEmail = process.env.ANOTHER_EMAIL;
    const validTestingObject = testObject.profile.validTestingObject;
    const updateTestingObject = testObject.profile.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
    });

    describe("token validation", () => {
        it ("it should not be accessible without a valid token", async() => {
            const response = await request(app)
                .put('/profile')
                .send(validTestingObject);
            expect(response.statusCode).toBe(401);
        });
        it ("it should not be accessible with an invalid token", async() => {
            const response = await request(app)
                .put('/profile')
                .set('session-token', 'invalid-test-token')
                .send(validTestingObject);
            expect(response.statusCode).toBe(401);
        });
    });

    describe("Validation Test", () => {
        const testRange = {
            email: { ...invalidTestingRange.email, "unmatching email": otherEmail },
            username :  invalidTestingRange.full_name ,
            password: invalidTestingRange.password
        };
        Object.keys(testRange).forEach((property) => {
            Object.keys(testRange[property]).forEach((situation) => {
                it (`it should not update profile if ${property} is ${situation}`, async () => {
                    const invalidObject = { ...updateTestingObject, [property] : testRange[property][situation] };
                    const response = await request(app)
                        .put('/profile')
                        .set('session-token', validSession)
                        .send(invalidObject);
                    expect(response.statusCode).toBe(400);
                });
            });
        });
    });

    it ("it should be able to update profile with valid input", async () => {
        const response = await request(app)
            .put('/profile')
            .set('session-token', validSession)
            .send(updateTestingObject);
        expect(response.statusCode).toBe(200);

        const loginResponse = await request(app)
            .post('/auth')
            .send({ email: testEmail, password: updateTestingObject.password });
        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.session).toBeTruthy();
        validSession = loginResponse.body.session;

        expect(loginResponse.body.message).toBeTruthy();
        expect(loginResponse.body.username).toBe(updateTestingObject.username);
        expect(loginResponse.body.email).toBe(testEmail);
        expect(loginResponse.body).toHaveProperty('role');
    });

    it ("it should be able to revert back to the test email's original password", async () => {
        const response = await request(app)
            .put('/profile')
            .set('session-token', validSession)
            .send(validTestingObject);
        expect(response.statusCode).toBe(200);
    });
});