require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// getting test tools:
const {
    getTestSession,
    testObject,
    invalidTestingRange,
    isSearchTargetValid
} = require('../../utils/TestTools');

describe("Search Route", () => {
    let validSession;
    const validSearchObject = testObject.counter.validSearchObject;
    const invalidSearchObject = invalidTestingRange.invalidCounterTargets;
    beforeAll(async () => {
        validSession = await getTestSession(app);
    });

    describe("Access validation", () => {
        it ("it should not be accessible without a valid token", async() => {
            const response = await request(app)
                .get(`/target/${validSearchObject[0]}`);
            expect(response.statusCode).toBe(401);
        });
        it ("it should not be accessible with an invalid token", async() => {
            const response = await request(app)
                .get(`/search/target/${validSearchObject[0]}`)
                .set('session-token', 'invalid-test-token');
            expect(response.statusCode).toBe(401);
        });
        Object.keys(invalidSearchObject).forEach((situation) => {
            it (`it should not be accessible if search target is ${situation}`, async() => {
                const response = await request(app)
                    .get(`/search/target/${invalidSearchObject[situation]}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(400);
            });
        });
    });
    describe("target validations", () => {
        validSearchObject.forEach((target) => {
            it (`it should be accessible if search table is ${target}`, async() => {
                const response = await request(app)
                    .get(`/search/target/${target}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(isSearchTargetValid(response.body.targets)).toBe(true);
            });
        });
    });
});