require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestPosition,
    testObject,
    invalidTestingRange,
    isPositionValid
} = require('../../utils/TestTools');

describe("Positions Router", () => {  
    let validSession;
    let exsitingPosition;
    let testPositionID;
    let testEmployeeID;
    const validTestingObject = testObject.position.validTestingObject;
    const updateTestingObject = testObject.position.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingPosition = await getTestPosition(app, validSession);
    });

    describe("POST: creating a new positions", () => {
        it ("it should not allow post with wrong id indication", async () => {
            const response = await request(app)
                .post('/positions/test')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        it ("it not allow creation if you are refering to an existing id", async() => {
            const response = await request(app)
                .post(`/positions/${exsitingPosition.id}`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });

        describe("input validation Testings", () => {
            const testRange = {
                name : invalidTestingRange.full_name,
                descriptions : invalidTestingRange.descriptions
            }
            Object.keys(testRange).forEach((property) => {
                Object.keys(testRange[property]).forEach((situation) => {
                    it (`it should not post an position if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : testRange[property][situation] };
                        const response = await request(app)
                            .post('/positions/new')
                            .set('session-token', validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            })
        });

        it ("it shoud allow posting even with null-description", async() => {
            const response = await request(app)
                .post('/positions/new')
                .set('session-token', validSession)
                .send({name: validTestingObject.name});
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();

            const deleteResponse = await request(app)
                .delete(`/positions/${response.body.id}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });

        it ("it should allow posting with valid naming and descriptions", async () => {
            const response = await request(app)
                .post('/positions/new')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testPositionID = response.body.id;
        });
    });

    describe("GET: getting a specific position", () => {
        it ("it should allow getting that newly created instance of position", async () => {
            const response = await request(app)
                .get(`/positions/${testPositionID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
            expect(isPositionValid(response.body.position)).toBe(true);
            expect(response.body.position.id).toBe(testPositionID);
            expect(response.body.position.name).toBe(validTestingObject.name);
            expect(response.body.position.descriptions).toBe(validTestingObject.descriptions);
        });
    });

    describe("PUT: updating a specific position", () => {
        it ("it should allow updates for the newly created position", async () => {
            const response = await request(app)
                .put(`/positions/${testPositionID}`)
                .set('session-token', validSession)
                .send(updateTestingObject);
            expect(response.statusCode).toBe(200);

            const updatedResponse = await request(app)
                .get(`/positions/${testPositionID}`)
                .set('session-token', validSession);
            expect(updatedResponse.statusCode).toBe(200);
            expect(isPositionValid(updatedResponse.body.position)).toBe(true);
            expect(updatedResponse.body.position.id).toBe(testPositionID);
            expect(updatedResponse.body.position.name).toBe(updateTestingObject.name);
            expect(updatedResponse.body.position.descriptions).toBe(updateTestingObject.descriptions);
        });

        it ("should allow attachments to a specific employee", async () => {
            const response = await request(app)
                .post("/employees/new")
                .set('session-token', validSession)
                .send({...testObject.employee.validTestingObject, position : testPositionID});
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testEmployeeID = response.body.id;

            // expecting the employee to be in the position on retrieval:
            const associateResponse = await request(app)
                .get(`/employees/${testEmployeeID}`)
                .set('session-token', validSession);
            expect(associateResponse.statusCode).toBe(200);
            expect(associateResponse.body.employee.position.id).toBe(testPositionID);
        });
    });

    describe("DELETE: deleting a specific position", () => {
        it ("it should allow deleting that newly created position", async () => {
            const response = await request(app)
                .delete(`/positions/${testPositionID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
        });

        it ("deletion of the positions should result in assoicated employees to have undefined position", async () => {
            const response = await request(app)
                .get(`/employees/${testEmployeeID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
            expect(response.body.employee.position).toBe(null);

            const deleteResponse = await request(app)
                .delete(`/employees/${testEmployeeID}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });
    });
});