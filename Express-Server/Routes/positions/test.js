require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const { getConfiguration} = require('../../utils/Configurator');
const config = getConfiguration();
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestPosition,
    testObject,
    isPositionValid
} = require('../../utils/TestTools');

describe("Positions Router", () => {  
    let validSession;
    let exsitingPosition;
    let testPositionID;
    let testEmployeeID;
    const validSearchObject = testObject.position.validSearchObject;
    const invalidSearchObject = testObject.position.invalidSearchObject;
    const validTestingObject = testObject.position.validTestingObject;
    const updateTestingObject = testObject.position.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        exsitingPosition = await getTestPosition(app, validSession);
    });

    describe("GET All: /positions", () => {
        describe("Session Validation Testings",() => {
            it ("it should not authroise any access without token", async () => {
                const response = await request(app)
                    .get('/positions');
                expect(response.statusCode).toBe(401)
            });
            it ("it should not authroise any access with invalid token", async () => {
                const response = await request(app)
                    .get('/positions')
                    .set('session-token', 'invalid-test-token');
                expect(response.statusCode).toBe(401)
            });
        });

        describe("Behaciour testing on the get all endpoint", () => {
            it ("it should return status 200", async () => {
                const response = await request(app)
                    .get('/positions')
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body.count).toBeGreaterThan(0);
                expect(response.body.page).toBe(1);
                expect(response.body.positions.length).toBeGreaterThan(0);
                expect(isPositionValid(response.body.positions[0])).toBe(true);
            });

            describe("testing search Target", () => {
                const invalidTargets = {
                    "invalid target" : "invalid target",
                    "forbidden target" : process.env.FORBIDDEN_SEARCH_TARGET
                };
                Object.keys(invalidTargets).forEach((target) => {
                    it (`it should not faithfully return if searching target is ${target}`, async () => {
                        const response = await request(app)
                            .get('/positions')
                            .set('session-token', validSession)
                            .query({ 
                                target: invalidTargets[target],
                                keyword: validSearchObject.name
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            });

            describe("testing search info missing", () => {
                it ("it should not return if searching keyword is empty", async () => {
                    const response = await request(app)
                        .get('/positions')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                        });
                    expect(response.statusCode).toBe(400);
                });
                it ("it should not return if searching target is null", async () => {
                    const response = await request(app)
                        .get('/positions')
                        .set('session-token', validSession)
                        .query({ 
                            keyword: validSearchObject.name
                        });
                    expect(response.statusCode).toBe(400);
                });
                it ("it should not return if searching target is empty", async () => {
                    const response = await request(app)
                        .get('/positions')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                            keyword: ""
                        });
                    expect(response.statusCode).toBe(400);
                });
                it ("it should not return if searching page is not valid", async () => {
                    const response = await request(app)
                        .get('/positions')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                            keyword: validSearchObject.name,
                            page: "test"
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            describe("testing for searching non-exsitence records", () => {
                Object.keys(invalidSearchObject).forEach((property) => {
                    it (`it should return normally even if searching value of ${property} is non-existence`, async () => {
                        const response = await request(app)
                            .get('/positions')
                            .set('session-token', validSession)
                            .query({ 
                                target: property,
                                keyword: invalidSearchObject[property],
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.positions.length).toBe(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBe(0);
                        expect(response.body.page).toBeTruthy();
                    });
                });
            });

            describe("testing for searching existence records", () => {
                Object.keys(validSearchObject).forEach((property) => {
                    it (`it should return a valid searched response with a matching ${property}`, async () => {
                        const response = await request(app)
                            .get('/positions')
                            .set('session-token', validSession)
                            .query({ 
                                target: property,
                                keyword: validSearchObject[property],
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.positions.length).toBeGreaterThan(0);
                        expect(response.body.searched).toBe(true);
                        expect(response.body.count).toBeGreaterThan(0);
                        expect(response.body.page).toBeTruthy();
                        expect(isPositionValid(response.body.positions[0])).toBe(true);
                    });
                });
            });

            it ("it should not return count if pagination is provided", async () => {
                const response = await request(app)
                    .get('/positions')
                    .set('session-token', validSession)
                    .query({ 
                        target: "name",
                        keyword: validSearchObject.name,
                        page: 1
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body).not.toHaveProperty('count');
                expect(response.body.page).toBe(1);
            });
        });
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
            const invalidTestingRange = {
                name : {
                    "empty" : "",
                    "too long" : `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
                    "missing": undefined,
                    "invalid type": 1
                },
                descriptions : {
                    "too long": `${"t".repeat(config.limitations.Max_Descriptions_Length + 1)}`,
                    "invalid type": 1
                }
            }
            Object.keys(invalidTestingRange).forEach((property) => {
                Object.keys(invalidTestingRange[property]).forEach((situation) => {
                    it (`it should not post an position if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : invalidTestingRange[property][situation] };
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

        describe("/positions/:id/employees testing", () => {
            it ("it should allow getting the newly created employee realted to that newly created position", async () => {
                const response = await request(app)
                    .get(`/positions/${testPositionID}/employees`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body.employees.length).toBe(1);
                expect(response.body.employees[0].id).toBe(testEmployeeID);
                expect(response.body.employees[0].name).toBe(testObject.employee.validTestingObject.name);
                expect(response.body.employees[0].phone).toBe(testObject.employee.validTestingObject.phone);
                expect(response.body.employees[0].wechat_contact).toBe(testObject.employee.validTestingObject.wechat_contact);
                expect(response.body.employees[0].qq_contact).toBe(testObject.employee.validTestingObject.qq_contact);
            });
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