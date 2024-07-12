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

describe("Counter router", () => {
    let validSession;
    const validCounterTargets = testObject.counter.validSearchObject;
    const invalidCounterTargets = invalidTestingRange.invalidCounterTargets;
    beforeAll(async () => {
        validSession = await getTestSession(app);
    });

    describe("Access validation", () => {
        it ("it should not be accessible without a valid token", async() => {
            const response = await request(app)
                .get(`/counter/${validCounterTargets[0]}`)
            expect(response.statusCode).toBe(401);
        });
        it ("it should not be accessible with an invalid token", async() => {
            const response = await request(app)
                .get(`/counter/${validCounterTargets[0]}`)
                .set('session-token', 'invalid-test-token')
            expect(response.statusCode).toBe(401);
        });
        Object.keys(invalidCounterTargets).forEach((situation) => {
            it (`it should not be accessible if counter target is ${situation}`, async() => {
                const response = await request(app)
                    .get(`/counter/${invalidCounterTargets[situation]}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(400);
            });
        });
    });

    describe("search target validation", () => {
        Object.keys(validCounterTargets).forEach((target) => {
            it (`it should return status 200 for coutning ${target}`, async () => {
                const response = await request(app)
                    .get(`/counter/${validCounterTargets[target]}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('counts');
                expect(response.body.counts).toBeGreaterThan(0);
            });
        });
    });
});