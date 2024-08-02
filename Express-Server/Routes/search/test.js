require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const app = global.testApp;
const dbReferences = global.dbReferences;

// getting test tools:
const {
    getTestSession,
    testObject,
    invalidTestingRange,
    isSearchTargetValid,
    isClientValid,
    isConditionValid,
    isRuleValid,
    isProductValid,
    isTransactionValid,
    isEmployeeValid,
    isMaterialValid,
    isPositionValid,
    getTestAlias
} = require('../../utils/TestTools');

describe("Search Route", () => {
    let validSession;
    const validSearchTables = testObject.counter.validSearchObject; // valid tables
    const invalidSearchTables = invalidTestingRange.invalidCounterTargets; // invalid tables
    beforeAll(async () => {
        validSession = await getTestSession(app);
    });

    describe("Access Validations", () => {
        it("it should not be able to access the database references without a valid token", async () => {
            const response = await request(app)
                .get(`/search/targets`);
            expect(response.statusCode).toBe(401);
        });
        it("it should not be able to access the database references with an invalid token", async () => {
            const response = await request(app)
                .get(`/search/targets`)
                .set('session-token', 'invalid-test-token');
            expect(response.statusCode).toBe(401);
        });
        it("it should not be able to query for a table without token", async () => {
            const response = await request(app)
                .post(`/search/${validSearchTables[0]}`)
            expect(response.statusCode).toBe(401);
        });
        it("it should not be able to query for a table without a valid token", async () => {
            const response = await request(app)
                .post(`/search/${validSearchTables[0]}`)
                .set('session-token', 'invalid-test-token');
            expect(response.statusCode).toBe(401);
        });
        Object.keys(invalidSearchTables).forEach((situation) => {
            it(`it should not be accessible if search target is ${situation}`, async () => {
                const response = await request(app)
                    .post(`/search/${invalidSearchTables[situation]}`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(400);
            });
        });
    });

    // testing for the valid queries:
    describe("Query targets validations", () => {

        // Validating the ability to extract the default listing queries
        describe("query completeness validations", () => {

            describe("Structural completeness validations", () => {
                // testing the rejections on missing properties:
                it("it should not return if page property is missing", async () => {
                    const response = await request(app)
                        .post(`/search/${validSearchTables[0]}`)
                        .set('session-token', validSession)
                        .send({ searchQuery: { ...testObject.search.defaultStructure.searchQuery } });
                    expect(response.statusCode).toBe(400);
                });

                it('should not return if searchQuery is missing', async () => {
                    const response = await request(app)
                        .post(`/search/${validSearchTables[0]}`)
                        .set('session-token', validSession)
                        .send({
                            page: testObject.search.defaultStructure.page
                        });

                    expect(response.statusCode).toBe(400);
                });

                Object.keys(testObject.search.defaultStructure.searchQuery).forEach((key) => {
                    it(`it should not return if ${key} property is missing in search Query`, async () => {
                        const response = await request(app)
                            .post(`/search/${validSearchTables[0]}`)
                            .set('session-token', validSession)
                            .send({
                                page: testObject.search.defaultStructure.page,
                                searchQuery: delete structuredClone(testObject.search.defaultStructure.searchQuery).key
                            });
                        expect(response.statusCode).toBe(400);
                    });
                });
            })

            // validating the missing specifications in each part of the search query:
            describe("field definition completeness valdiations (i.e., target, specification, as, order, keyword)", () => {
                
                const testingTable = validSearchTables[0];

                // testing with the most complicated table
                const fieldCompletenessRange = testObject.invalidTestingRange.incompleteFields;
                Object.keys(fieldCompletenessRange).forEach((situation) => {
                    it (`it should not return the query if the fields property is ${situation}`, async () => {
                        const response = await request(app)
                            .post(`/search/${testingTable}`)
                            .set('session-token', validSession)
                            .send({
                                page: testObject.search.defaultStructure.page,
                                searchQuery: {
                                    ...testObject.search.defaultStructure.searchQuery,
                                    fields: fieldCompletenessRange[situation]
                                }
                            });
                    });
                });

                // testing with the where clause have missing fields:
                

            });

            describe("Completeness of Default Listing validations", () => {
                // Validating the ability to extract the default listing queries
                validSearchTables.forEach((table) => {
                    it(`it should be able to query the defaults for ${table}`, async () => {
                        const response = await request(app)
                            .post(`/search/${table}`)
                            .set('session-token', validSession)
                            .send(testObject.search.defaultStructure);
                        expect(response.statusCode).toBe(200);
                        expect(response.body.results.length).toBeGreaterThan(0);
                        expect(response.body.count).toBeGreaterThan(0);

                        if (table === 'clients') {
                            expect(isClientValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === " companies") {
                            expect(isCompanyValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "employees") {
                            expect(isEmployeeValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "materials") {
                            expect(isMaterialValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "positions") {
                            expect(isPositionValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "pricing_conditions") {
                            expect(isConditionValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "pricing_rules") {
                            expect(isRuleValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "products") {
                            expect(isProductValid(response.body.results[0])).toBe(true);
                        }
                        else if (table === "transactions") {
                            expect(isTransactionValid(response.body.results[0])).toBe(true);
                        }
                    });
                });
            })
        });


        // testing to allow for user defined fields to be queried:
        describe("query field validations", () => {

            it("Fetched database table references should be correct", async () => {
                expect(isSearchTargetValid(dbReferences)).toBe(true);

                const response = await request(app)
                    .get(`/search/targets`)
                    .set('session-token', validSession);
                expect(response.statusCode).toBe(200);
                expect(isSearchTargetValid(response.body.targets)).toBe(true);
                expect(dbReferences).toEqual(response.body.targets);
            });

            // testing to allow for user defined fields to be queried:
            describe("query fields validations", () => {
                for (const reference of dbReferences) {
                    it(`it should be able to query ${reference.column} for ${reference.table}`, async () => {
                        const response = await request(app)
                            .post(`/search/${reference.table}`)
                            .set('session-token', validSession)
                            .send({
                                ...testObject.search.defaultStructure,
                                searchQuery: {
                                    ...testObject.search.defaultStructure.searchQuery,
                                    fields: [
                                        {
                                            target: reference.column,
                                            specification: "default",
                                            as: null
                                        }
                                    ]
                                }
                            });
                        expect(response.statusCode).toBe(200);
                        expect(response.body.results.length).toBeGreaterThan(0);
                        expect(response.body.count).toBeGreaterThan(0);
                        expect(reference.column in response.body.results[0]).toBe(true);
                    }
                    );
                    it(`it should be able to name alias for ${reference.column} for ${reference.table}`, async () => {
                        const aliasResponse = await request(app)
                            .post(`/search/${reference.table}`)
                            .set('session-token', validSession)
                            .send({
                                ...testObject.search.defaultStructure,
                                searchQuery: {
                                    ...testObject.search.defaultStructure.searchQuery,
                                    fields: [
                                        getTestAlias(reference)
                                    ]
                                }
                            });
                        expect(aliasResponse.statusCode).toBe(200);
                        expect(aliasResponse.body.results.length).toBeGreaterThan(0);
                        expect(aliasResponse.body.count).toBeGreaterThan(0);
                        expect("test" in aliasResponse.body.results[0]).toBe(true);
                    });
                }
            });
        });
    });
});