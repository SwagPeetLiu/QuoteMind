require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// importing the testing tools:
const {
    testObject,
    invalidTestingRange,
    getTestSession,
    getTestEmployee,
    getTestPosition,
    isEmployeeValid,
    isSpecificEmployeeValid
} = require('../../utils/TestTools');

describe('Employees Router', () => {
    // setting up the live sessions:
    let validSession;
    let existingEmployee;
    let testingEmployeeID;
    const validSearchObject = testObject.employee.validSearchObject;
    const invalidSearchObject = testObject.employee.invalidSearchObject;
    let validTestingObject = testObject.employee.validTestingObject;
    let updateTestingObject = testObject.employee.updateTestingObject;
    const invalidEmailSuffix = testObject.invalidEmailSuffix;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        existingEmployee = await getTestEmployee(app, validSession);
        const existingPosition = await getTestPosition(app, validSession);
        validTestingObject = {...testObject.employee.validTestingObject, position : existingPosition.id};
        updateTestingObject = {...testObject.employee.updateTestingObject, position : existingPosition.id};
    });

    describe("GET: Testing for manipulating all the employees", () => {
        describe("Session Validation Testing", () => {
            it ("it should not authorise any access without token", async () => {
                const response = await request(app)
                    .get('/employees');
                expect(response.statusCode).toBe(401);
            });
            it ("it should not authorise any access with invalid token", async () => {
                const response = await request(app)
                    .get('/employees')
                    .set('session-token', 'invalid-token');
                expect(response.statusCode).toBe(401);
            });
        });

        describe("Behaviour testing for the get all endpoints", () => {
            it ("it should return 200 with a count value if no page number is provided", async () => {
                const response = await request(app)
                    .get('/employees')
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('count');
                expect(response.body).toHaveProperty('page');
                expect(response.body.employees.length).toBeGreaterThan(0);
                expect(isEmployeeValid(response.body.employees[0])).toBe(true);
            });
        });

        describe("Testing Search Target Validations", () => {
            Object.keys(invalidTestingRange.invalidSearchTargets).forEach((target) => {
                it ("it should not faithfully return if searching target is " + target, async () => {
                    const response = await request(app)
                        .get('/employees')
                        .set('session-token', validSession)
                        .query({ 
                            target: invalidTestingRange.invalidSearchTargets[target],
                            keyword: validSearchObject[Object.keys(validSearchObject)[0]],
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("Testing for search information validations, on required params", () => {
            Object.keys(invalidTestingRange.invalidSearchKeywords).forEach((target) => {
                it ("it should not faithfully return if searching keyword is " + target, async () => {
                    const response = await request(app)
                        .get('/employees')
                        .set('session-token', validSession)
                        .query({ 
                            target: Object.keys(validSearchObject)[0],
                            keyword: invalidTestingRange.invalidSearchKeywords[target],
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("testing for page validation", () => {
            Object.keys(invalidTestingRange.page).forEach((situation) => {
                it (`it should not faithfully if page is ${situation}`, async () => {
                    const response = await request(app)
                        .get('/employees')
                        .set('session-token', validSession)
                        .query({ 
                            page: invalidTestingRange.page[situation],
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Testing for non-existence records", () => {
            Object.keys(invalidSearchObject).forEach((property) => {
                it (`it should return normally even if searching value of ${property} is non-existence`, async () => {
                    const response = await request(app)
                        .get('/employees')
                        .set('session-token', validSession)
                        .query({ 
                            target: property,
                            keyword: invalidSearchObject[property],
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.employees.length).toBe(0);
                    expect(response.body.searched).toBe(true);
                    expect(response.body.count).toBe(0);
                    expect(response.body.page).toBeTruthy();
                });
            });
        });
        describe("Testing for searching existing records", () => {
            Object.keys(validSearchObject).forEach((property) => {
                it (`it should return a valid searched response with a matching ${property}`, async () => {
                    const response = await request(app)
                        .get('/employees')
                        .set('session-token', validSession)
                        .query({ 
                            target: property,
                            keyword: validSearchObject[property],
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.employees.length).toBeGreaterThan(0);
                    expect(response.body.searched).toBe(true);
                    expect(response.body.count).toBeGreaterThan(0);
                    expect(response.body.page).toBeTruthy();
                    expect(isEmployeeValid(response.body.employees[0])).toBe(true);
                });
            });
            it ("it shoud not returning of the count value with page indication", async () => {
                const response = await request(app)
                    .get('/employees')
                    .set('session-token', validSession)
                    .query({ 
                        target: "name",
                        keyword: validSearchObject.name,
                        page: 1
                    });
                expect(response.statusCode).toBe(200);
                expect(response.body.employees.length).toBeGreaterThan(0);
                expect(response.body.searched).toBe(true);
                expect(response.body).not.toHaveProperty('count');
                expect(response.body.page).toBe(1);
                expect(isEmployeeValid(response.body.employees[0])).toBe(true);
            });
        });

        describe("POST: testing for creating an employee", () => {
            it ("it should not post an employee if ID indication is not new", async () => {
                const response = await request(app)
                    .post('/employees/test')
                    .set('session-token', validSession)
                    .send(validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            it ("it should not post an employee if ID indication already exists", async () => {
                const response = await request(app)
                    .post(`/employees/${existingEmployee.id}`)
                    .set('session-token', validSession)
                    .send(validTestingObject);
                expect(response.statusCode).toBe(400);
            });
            describe("Employee creation validation tests", () => {
                const testRange = {
                    name: invalidTestingRange.full_name,
                    email: Object.fromEntries(
                        Object.entries(invalidTestingRange.email).slice(0,-1)
                    ),
                    phone: invalidTestingRange.phone,
                    wechat_contact : invalidTestingRange.wechat_contact,
                    qq_contact : invalidTestingRange.qq_contact,
                    position : invalidTestingRange.position
                }

                Object.keys(testRange).forEach((property) => {
                    Object.keys(testRange[property]).forEach((situation) => {
                        it (`it should not post an employee if ${property} is ${situation}`, async () => {
                            const invalidObject = { ...validTestingObject, [property] : testRange[property][situation] };
                            const response = await request(app)
                                .post('/employees/new')
                                .set('session-token', validSession)
                                .send(invalidObject);
                            expect(response.statusCode).toBe(400);
                        });
                    });
                });
            });

            describe("testing the creation of an employee with the nullable properties", () => {
                const nullableProperties = Object.keys(validTestingObject).filter(property => property !== "name");
                nullableProperties.forEach(property => {
                    it (`should create an employee even if ${property} is null`, async () => {
                        const validObject = { ...validTestingObject, [property] : null };
                        const response = await request(app)
                            .post('/employees/new')
                            .set('session-token', validSession)
                            .send(validObject);
                        expect(response.statusCode).toBe(200);
                        expect(response.body.id).toBeTruthy();

                        const deleteResponse = await request(app)
                            .delete(`/employees/${response.body.id}`)
                            .set('session-token', validSession);
                        expect(deleteResponse.statusCode).toBe(200);
                    });
                });
            });

            it ("it should post an employee", async () => {
                const response = await request(app)
                    .post('/employees/new')
                    .set('session-token', validSession)
                    .send(validTestingObject);
                expect(response.statusCode).toBe(200);
                expect(response.body.id).toBeTruthy();
                testingEmployeeID = response.body.id;
            });
        });

        describe("GET: testing for fetching the newly created employee", () => {
            it ("it should fetch the newly created employee", async () => {
                const response = await request(app)
                    .get(`/employees/${testingEmployeeID}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(isSpecificEmployeeValid(response.body.employee)).toBe(true);
                expect(response.body.employee.id).toBe(testingEmployeeID);
                expect(response.body.employee.name).toBe(validTestingObject.name);
                expect(response.body.employee.email).toBe(validTestingObject.email);
                expect(response.body.employee.wechat_contact).toBe(validTestingObject.wechat_contact);
                expect(response.body.employee.qq_contact).toBe(validTestingObject.qq_contact);
                expect(response.body.employee.phone).toBe(validTestingObject.phone);
                expect(response.body.employee.position.id).toBe(validTestingObject.position);
            });
        });

        describe("PUT: testing for updating the newly created employee", () => {
            it ("it should update the newly created employee", async () => {
                const response = await request(app)
                    .put(`/employees/${testingEmployeeID}`)
                    .set('session-token', validSession)
                    .send(updateTestingObject);
                expect(response.statusCode).toBe(200);

                // check if the employee has been updated
                const updatedResponse = await request(app)
                    .get(`/employees/${testingEmployeeID}`)
                    .set('session-token', validSession);
                expect(updatedResponse.statusCode).toBe(200);
                expect(isSpecificEmployeeValid(updatedResponse.body.employee)).toBe(true);
                expect(updatedResponse.body.employee.id).toBe(testingEmployeeID);
                expect(updatedResponse.body.employee.name).toBe(updateTestingObject.name);
                expect(updatedResponse.body.employee.email).toBe(updateTestingObject.email);
                expect(updatedResponse.body.employee.wechat_contact).toBe(updateTestingObject.wechat_contact);
                expect(updatedResponse.body.employee.qq_contact).toBe(updateTestingObject.qq_contact);
                expect(updatedResponse.body.employee.phone).toBe(updateTestingObject.phone);
                expect(updatedResponse.body.employee.position.id).toBe(updateTestingObject.position);
            });
        });

        describe("DELETE: testing for deleting the newly created employee", () => {
            it ("it should delete the newly created employee", async () => {
                const response = await request(app)
                    .delete(`/employees/${testingEmployeeID}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
            });
        });
    });
});