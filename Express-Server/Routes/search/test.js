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
    const testingTable = "transactions"; // use most complicated table
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

    it("Fetched database table references should be correct", async () => {
        expect(isSearchTargetValid(dbReferences)).toBe(true);

        const response = await request(app)
            .get(`/search/targets`)
            .set('session-token', validSession);
        expect(response.statusCode).toBe(200);
        expect(isSearchTargetValid(response.body.targets)).toBe(true);
        expect(dbReferences).toEqual(response.body.targets);
    });

    // testing the rejections on missing properties:
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
    });

    // validating the missing specifications in each part of the search query:
    describe("field definition completeness valdiations", () => {

        describe("Completeness of select fields validations", () => {
            const defaultField = testObject.search.defaultfield;
            Object.keys(defaultField).forEach((key) => {
                const missingCopy = structuredClone(defaultField);
                delete missingCopy[key];
                it(`it should return the query if property ${key} is missing`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: testObject.search.defaultStructure.page,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                fields: [
                                    missingCopy
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            it("it should not return if functional specification is provided but no alias", async () => {
                const response = await request(app)
                    .post(`/search/${testingTable}`)
                    .set('session-token', validSession)
                    .send({
                        page: testObject.search.defaultStructure.page,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            fields: [
                                {
                                    ...defaultField,
                                    specification: "TEXT",
                                    as: null
                                }
                            ]
                        }
                    });
                expect(response.statusCode).toBe(400);
            });
        });

        describe("Completeness of where clause validations", () => {
            const defualtSingleWhereClause = testObject.search.defualtSingleWhereClause;
            Object.keys(defualtSingleWhereClause).forEach((key) => {
                const missingCopy = structuredClone(defualtSingleWhereClause);
                delete missingCopy[key];
                it(`it should return the query if property ${key} is missing`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: testObject.search.defaultStructure.page,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: missingCopy
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            it("it should not return if functional specification is provided but no transformType is provided", async () => {
                const response = await request(app)
                    .post(`/search/${testingTable}`)
                    .set('session-token', validSession)
                    .send({
                        page: testObject.search.defaultStructure.page,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                ...defualtSingleWhereClause,
                                specification: "TEXT",
                                transformType: null
                            }
                        }
                    });
                expect(response.statusCode).toBe(400);
            });
        });
        describe("completeness of groupby clause validations", () => {
            const defaultSingleGroupByClause = testObject.search.defaultSingleGroupByClause;
            Object.keys(defaultSingleGroupByClause).forEach((key) => {
                const missingCopy = structuredClone(defaultSingleGroupByClause);
                delete missingCopy[key];
                it(`it should return the query if property ${key} is missing`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: testObject.search.defaultStructure.page,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                groupByClause: [
                                    missingCopy
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
        describe("completeness of order clause validations", () => {
            const defaultSingleOrderByClause = testObject.search.defaultSingleOrderByClause;
            Object.keys(defaultSingleOrderByClause).forEach((key) => {
                const missingCopy = structuredClone(defaultSingleOrderByClause);
                delete missingCopy[key];
                it(`it should return the query if property ${key} is missing`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: testObject.search.defaultStructure.page,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                orderByClause: [
                                    missingCopy
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });
    });

    // Validating the ability to extract the default listing queries
    describe("Completeness of Default Listing validations", () => {
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
    });

    // User input type validations:
    describe("User input validations", () => {
        describe("page input validations", () => {
            const pageTestingRange = invalidTestingRange.page;
            Object.keys(pageTestingRange).forEach((situation) => {
                it(`it should not be able to query with ${situation} page`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            ...testObject.search.defaultStructure,
                            page: pageTestingRange[situation]
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Field SELECTION input validations", () => {

            // testing for invalid column names:
            const invalidColumnValues = invalidTestingRange.invalidColumnValue;
            Object.keys(invalidColumnValues).forEach((situation) => {
                it(`it shoult not return if the specified selected field is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                fields: [
                                    {
                                        ...testObject.search.defaultfield,
                                        target: invalidColumnValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // testing for invalid specifications:
            const invalidSpecificationValues = invalidTestingRange.invalidSpecificationValue;
            Object.keys(invalidSpecificationValues).forEach((situation) => {
                it(`it shoult not return if the specified selected field is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                fields: [
                                    {
                                        ...testObject.search.defaultfield,
                                        specification: invalidSpecificationValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // testing for alias validations:
            const invalidAliasValues = invalidTestingRange.invalidAlias;
            Object.keys(invalidAliasValues).forEach((situation) => {
                it(`it shoult not return if the specified selected field is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                fields: [
                                    {
                                        ...testObject.search.defaultfield,
                                        specification: "TEXT",
                                        as: invalidAliasValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("WHERE CLAUSE input validations", () => {
            // target validations:
            const invalidColumnValues = invalidTestingRange.invalidColumnValue;
            Object.keys(invalidColumnValues).forEach((situation) => {
                it(`it shoult not return if the specified target is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: {
                                    ...testObject.search.defualtSingleWhereClause,
                                    target: invalidColumnValues[situation]
                                }
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // operator validations:
            const invalidOperators = invalidTestingRange.invalidOperator;
            Object.keys(invalidOperators).forEach((situation) => {
                it(`it shoult not return if the specified operator is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: {
                                    ...testObject.search.defualtSingleWhereClause,
                                    operator: invalidOperators[situation]
                                }
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            it(`it shoult not return if the operator is not eq or ne for string type`, async () => {
                const response = await request(app)
                    .post(`/search/${testingTable}`)
                    .set('session-token', validSession)
                    .send({
                        page: 1,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                ...testObject.search.defualtSingleWhereClause,
                                operator: "gt"
                            }
                        }
                    });
                expect(response.statusCode).toBe(400);
            });

            // keyword validations:
            const invalidKeywords = invalidTestingRange.invalidSearchKeywords;
            Object.keys(invalidKeywords).forEach((situation) => {
                it(`it shoult not return if the specified keyword is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: {
                                    ...testObject.search.defualtSingleWhereClause,
                                    keyword: invalidKeywords[situation]
                                }
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            it(`it should not return if invalid keywords are used for numeric types`, async () => {
                const response = await request(app)
                    .post(`/search/${testingTable}`)
                    .set('session-token', validSession)
                    .send({
                        page: 1,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                ...testObject.search.defualtSingleWhereClause,
                                target: "quantity",
                                keyword: "test123"
                            }
                        }
                    });
                expect(response.statusCode).toBe(400);
            });
            it(`it should not return if invalid keywords are used for date types`, async () => {
                const response = await request(app)
                    .post(`/search/${testingTable}`)
                    .set('session-token', validSession)
                    .send({
                        page: 1,
                        searchQuery: {
                            ...testObject.search.defaultStructure.searchQuery,
                            whereClause: {
                                ...testObject.search.defualtSingleWhereClause,
                                target: "transaction_date",
                                keyword: "test123"
                            }
                        }
                    });
                expect(response.statusCode).toBe(400);
            });

            // validating the specificcations:
            const invalidSpecifications = invalidTestingRange.invalidSpecificationValue;
            Object.keys(invalidSpecifications).forEach((situation) => {
                it(`it shoult not return if the specified specification is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: {
                                    ...testObject.search.defualtSingleWhereClause,
                                    specification: invalidSpecifications[situation]
                                }
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // validating the transform Types:
            const invalidTransformTypes = invalidTestingRange.invalidTransformType;
            Object.keys(invalidTransformTypes).forEach((situation) => {
                it(`it shoult not return if the specified transform type is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: {
                                    ...testObject.search.defualtSingleWhereClause,
                                    specification: "TEXT",
                                    transformType: invalidTransformTypes[situation]
                                }
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
            const invalidTransformValues = invalidTestingRange.invalidTransformationValue;
            Object.keys(invalidTransformValues).forEach((situation) => {
                it(`it shoult not return if the specified transform value is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                whereClause: invalidTransformValues[situation]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });
        });

        describe("Groupby CLAUSE input validations", () => {
            // validating the targets:
            const invalidColumnValues = invalidTestingRange.invalidColumnValue;
            Object.keys(invalidColumnValues).forEach((situation) => {
                it(`it shoult not return if the specified groupby selected target is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                groupByClause: [
                                    {
                                        ...testObject.search.defaultSingleGroupByClause,
                                        target: invalidColumnValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // validating the specifications:
            const invalidSpecificationValues = invalidTestingRange.invalidSpecificationValue;
            Object.keys(invalidSpecificationValues).forEach((situation) => {
                it(`it shoult not return if the specified groupby selected specification is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                groupByClause: [
                                    {
                                        ...testObject.search.defaultSingleGroupByClause,
                                        specification: invalidSpecificationValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

        });

        describe("ORDER BY CLAUSE input validations", () => {
            // validating the targets:
            const invalidColumnValues = invalidTestingRange.invalidColumnValue;
            Object.keys(invalidColumnValues).forEach((situation) => {
                it(`it shoult not return if the specified order by selected target is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                orderByClause: [
                                    {
                                        ...testObject.search.defaultSingleOrderByClause,
                                        target: invalidColumnValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            })

            // validating the specifications:
            const invalidSpecificationValues = invalidTestingRange.invalidSpecificationValue;
            Object.keys(invalidSpecificationValues).forEach((situation) => {
                it(`it shoult not return if the specified order by selected specification is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                orderByClause: [
                                    {
                                        ...testObject.search.defaultSingleOrderByClause,
                                        specification: invalidSpecificationValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

            // validate the order:
            const invalidOrderValues = invalidTestingRange.invalidOrder;
            Object.keys(invalidOrderValues).forEach((situation) => {
                it(`it shoult not return if the specified order by selected order is ${situation}`, async () => {
                    const response = await request(app)
                        .post(`/search/${testingTable}`)
                        .set('session-token', validSession)
                        .send({
                            page: 1,
                            searchQuery: {
                                ...testObject.search.defaultStructure.searchQuery,
                                orderByClause: [
                                    {
                                        ...testObject.search.defaultSingleOrderByClause,
                                        order: invalidOrderValues[situation]
                                    }
                                ]
                            }
                        });
                    expect(response.statusCode).toBe(400);
                });
            });

        });
    });

    describe("SELECT field specification validations", () => {
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
            });
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
    describe("WHERE clause specification validations", () => {
        it("it should return results if a single where clause object is provided", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: testObject.search.defualtSingleWhereClause
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for dual AND where clause objects", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: testObject.search.defaultDualWhereClause,
                        orderByClause: null
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for dual OR where clause objects", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: {
                            "OR": testObject.search.defaultDualWhereClause["AND"]
                        }
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for transformative single clause Object", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: {
                            ...testObject.search.defualtSingleWhereClause,
                            target: "transaction_date",
                            specification: "Month",
                            keyword: "6",
                            transformType: "integer"
                        }
                    }
                });
        });
        it("it should return results for transformative dual clause Array representation", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: testObject.search.transformativeDualWhereClause
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for an recursive where Clause structure", async () => {
            const response = await request(app)
                .post(`/search/clients`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: testObject.search.recursiveWhereClause
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });

        // validate the ability to query by the FK related entity's name
        it("it should return results for an where clause that search for a related entities name (transaction's related product name)", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        whereClause: {
                            target: "product",
                            specification: "default",
                            operator: "eq",
                            keyword: "print",
                            transformType: null
                        }
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
    });

    describe("Groupby clause specification validations", () => {
        it("it should return results if a single groupby clause object is used", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        groupByClause: [testObject.search.defaultSingleGroupByClause]
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for single functinal group by", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        fields: [
                            {
                                target: "id",
                                specification: "TEXT",
                                as: "id"
                            }
                        ],
                        groupByClause: [
                            {
                                ...testObject.search.defaultSingleGroupByClause,
                                specification: "TEXT"
                            }
                        ],
                        orderByClause: null
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for multiple groupby clause array representations", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        groupByClause: [
                            testObject.search.defaultSingleGroupByClause,
                            {
                                ...testObject.search.defaultSingleGroupByClause,
                                target: "status"
                            }
                        ]
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
    });

    describe("ORDER BY clause specification validations", () => {
        it("it should return results if a single order by clause is used", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        orderByClause: [testObject.search.defaultSingleOrderByClause]
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should return results for multiple order by clause array representations", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        orderByClause: [
                            testObject.search.defaultSingleOrderByClause,
                            {
                                ...testObject.search.defaultSingleOrderByClause,
                                target: "transaction_date",
                                specification: "MONTH",
                            }
                        ]
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
        it("it should be able to return without any order clause", async () => {
            const response = await request(app)
                .post(`/search/${testingTable}`)
                .set('session-token', validSession)
                .send({
                    ...testObject.search.defaultStructure,
                    searchQuery: {
                        ...testObject.search.defaultStructure.searchQuery,
                        orderByClause: null
                    }
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.count).toBeGreaterThan(0);
        });
    });
});