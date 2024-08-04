require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const request = require('supertest');
const app = global.testApp;

// importing the testing tools:
const {
    getTestSession,
    getTestMaterial,
    getTestProduct,
    getTestClient,
    getTestCompany,
    getTestEmployee,
    getTestSpecificCompany,
    getTestTransaction,
    testObject,
    invalidTestingRange,
    isTransactionValid
} = require('../../utils/TestTools');

describe("/transactions Router", () => {
    let validSession;
    let testTransactionID;
    let exsitingTransaction;
    let exsitingMaterial;
    let existingProduct;
    let existingClient;
    let existingCompany;
    let existingEmployee;
    let validTestingObject = testObject.transaction.validTestingObject;
    let updateTestingObject = testObject.transaction.updateTestingObject;

    beforeAll(async () => {
        validSession = await getTestSession(app);
        [
            exsitingMaterial,
            existingProduct,
            existingClient,
            existingCompany,
            existingEmployee,
            exsitingTransaction]
            = await Promise.all([
                getTestMaterial(app, validSession),
                getTestProduct(app, validSession),
                getTestClient(app, validSession),
                getTestCompany(app, validSession),
                getTestEmployee(app, validSession),
                getTestTransaction(app, validSession)
            ]);
        const specificCompany = await getTestSpecificCompany(app, validSession, existingCompany.id);

        // updating the testing object:
        validTestingObject = {
            ...validTestingObject,
            materials: [exsitingMaterial.id],
            product: existingProduct.id,
            client: existingClient.id,
            company: existingCompany.id,
            employee: [existingEmployee.id],
            addresses: specificCompany.addresses.map(address => address.id)
        };
        updateTestingObject = {
            ...updateTestingObject,
            materials: [exsitingMaterial.id],
            product: existingProduct.id,
            client: existingClient.id,
            company: existingCompany.id,
            employee: null,
            addresses: null
        };
    });

    describe("POST: Creation of a transaction", () => {
        it ("it should not allow post with wrong id indication", async () => {
            const response = await request(app)
                .post('/transactions/test')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        it ("it should not allow post with an id that indicate an existing transaction", async () => {
            const response = await request(app)
                .post(`/transactions/${exsitingTransaction.id}`)
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(400);
        });
        describe("Creation Input Valdiation", () => {
            const testRange = {
                status: invalidTestingRange.status,
                name: invalidTestingRange.full_name,
                transaction_date: invalidTestingRange.transaction_date,
                quantity: invalidTestingRange.quantity,
                quantity_unit: invalidTestingRange.quantity_unit,
                price_per_unit: invalidTestingRange.price_per_unit,
                amount: invalidTestingRange.amount,
                note: invalidTestingRange.descriptions,
                colour: invalidTestingRange.colour,
                width: invalidTestingRange.width,
                height: invalidTestingRange.height,
                length: invalidTestingRange.length,
                en_unit: invalidTestingRange.en_unit,
                ch_unit: invalidTestingRange.ch_unit,
                size: invalidTestingRange.size,
                size_unit: invalidTestingRange.size_unit,
                product: invalidTestingRange.product,
                materials: invalidTestingRange.materials,
                client: invalidTestingRange.client,
                company: invalidTestingRange.company,
                addresses: invalidTestingRange.transactionAddress,
                employee: invalidTestingRange.employee
            };
            Object.keys(testRange).forEach((property) => {
                Object.keys(testRange[property]).forEach((situation) => {
                    it (`it should not create a transaction if ${property} is ${situation}`, async () => {
                        const invalidObject = { ...validTestingObject, [property] : testRange[property][situation] };
                        const response = await request(app)
                            .post('/transactions/new')
                            .set('session-token', validSession)
                            .send(invalidObject);
                        expect(response.statusCode).toBe(400);
                    });
                });
            });
        });

        describe("combinational valdiations", () => {
            it ("it should not allow post with both null client & company", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, client : null, company : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it cannot post with both null en_unit & ch_unit while length is specified", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, en_unit : null, ch_unit : null, width : null, height : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it cannot post with both null en_unit & ch_unit while width is specified", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, en_unit : null, ch_unit : null, length : null, height : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it cannot post with both null en_unit & ch_unit while height is specified", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, en_unit : null, ch_unit : null, width : null, length : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it should not create properly even with a single unit specification for dimenions", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, en_unit : null});
                expect(response.statusCode).toBe(400);
            });
            it ("it should not create properly if size unit is not provided, but size is", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, size_unit : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it should not create properly if size unit is provided but not size", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, size : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it should not create properly if quantity is missing", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, quantity : null });
                expect(response.statusCode).toBe(400);
            });
            it ("it should not create properly if quantity_unit is missing", async () => {
                const response = await request(app)
                    .post('/transactions/new')
                    .set('session-token', validSession)
                    .send({ ...validTestingObject, quantity_unit : null });
                expect(response.statusCode).toBe(400);
            });
        });
        it ("it should be creatable with null properties", async () => {
            const response = await request(app)
                .post('/transactions/new')
                .set('session-token', validSession)
                .send({ 
                    ...validTestingObject,
                    transaction_date: null,
                    materials: null,
                    price_per_unit: null,
                    amount: null,
                    note: null,
                    colour: null,
                    company: null,
                    width: null,
                    height: null, 
                    length: null, 
                    size: null, 
                    size_unit: null,
                    addresses: null
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();

            const deleteResponse = await request(app)
                .delete(`/transactions/${response.body.id}`)
                .set('session-token', validSession);
            expect(deleteResponse.statusCode).toBe(200);
        });
    });
    describe("GET a specific transaction", () => {
        it ("it should be creatable with full set of information", async () => {
            const response = await request(app)
                .post('/transactions/new')
                .set('session-token', validSession)
                .send(validTestingObject);
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBeTruthy();
            testTransactionID = response.body.id;
            
            const getResponse = await request(app)
                .get(`/transactions/${testTransactionID}`)
                .set('session-token', validSession);
            expect(getResponse.statusCode).toBe(200);
            expect(isTransactionValid(getResponse.body.transaction)).toBe(true);
            expect(getResponse.body.transaction.id).toBe(testTransactionID);
            expect(getResponse.body.transaction.name).toBe(validTestingObject.name);
            expect(getResponse.body.transaction.status).toBe(validTestingObject.status);
            expect(getResponse.body.transaction).toHaveProperty('creation_date');
            expect(getResponse.body.transaction).toHaveProperty('modified_date');
            expect(getResponse.body.transaction.transaction_date).toBe(validTestingObject.transaction_date);
            expect(getResponse.body.transaction.quantity).toBe(validTestingObject.quantity);
            expect(getResponse.body.transaction.quantity_unit).toBe(validTestingObject.quantity_unit);
            expect(getResponse.body.transaction.price_per_unit).toBe(validTestingObject.price_per_unit);
            expect(getResponse.body.transaction.amount).toBe(validTestingObject.amount);
            expect(getResponse.body.transaction.note).toBe(validTestingObject.note);
            expect(getResponse.body.transaction.colour).toBe(validTestingObject.colour);
            expect(getResponse.body.transaction.company.id).toBe(validTestingObject.company);
            expect(getResponse.body.transaction.client.id).toBe(validTestingObject.client);
            expect(getResponse.body.transaction.width).toBe(validTestingObject.width);
            expect(getResponse.body.transaction.height).toBe(validTestingObject.height);
            expect(getResponse.body.transaction.length).toBe(validTestingObject.length);
            expect(getResponse.body.transaction.size).toBe(validTestingObject.size);
            expect(getResponse.body.transaction.size_unit).toBe(validTestingObject.size_unit);
            expect(getResponse.body.transaction.product.id).toBe(validTestingObject.product);
            expect(getResponse.body.transaction.materials.length).toBe(validTestingObject.materials.length);
            expect(getResponse.body.transaction.materials[0].id).toBe(validTestingObject.materials[0]);
            expect(getResponse.body.transaction.addresses.length).toBe(validTestingObject.addresses.length);
            expect(getResponse.body.transaction.addresses[0].id).toBe(validTestingObject.addresses[0]);
        });
    });
    describe("PUT: UPDATE a specific transaction", () => {
        it ("it should be able to update the transaction correctly", async () => {
            const response = await request(app)
                .put(`/transactions/${testTransactionID}`)
                .set('session-token', validSession)
                .send(updateTestingObject);
            expect(response.statusCode).toBe(200);

            const getResponse = await request(app)
                .get(`/transactions/${testTransactionID}`)
                .set('session-token', validSession);
            expect(getResponse.statusCode).toBe(200);
            expect(isTransactionValid(getResponse.body.transaction)).toBe(true);
            expect(getResponse.body.transaction.id).toBe(testTransactionID);
            expect(getResponse.body.transaction.name).toBe(updateTestingObject.name);
            expect(getResponse.body.transaction.status).toBe(updateTestingObject.status);
            expect(getResponse.body.transaction.transaction_date).toBe(updateTestingObject.transaction_date);
            expect(getResponse.body.transaction.quantity).toBe(updateTestingObject.quantity);
            expect(getResponse.body.transaction.quantity_unit).toBe(updateTestingObject.quantity_unit);
            expect(getResponse.body.transaction.price_per_unit).toBe(updateTestingObject.price_per_unit);
            expect(getResponse.body.transaction.amount).toBe(updateTestingObject.amount);
            expect(getResponse.body.transaction.note).toBe(updateTestingObject.note);
            expect(getResponse.body.transaction.colour).toBe(updateTestingObject.colour);
            expect(getResponse.body.transaction.company.id).toBe(updateTestingObject.company);
            expect(getResponse.body.transaction.client.id).toBe(updateTestingObject.client);
            expect(getResponse.body.transaction.width).toBe(updateTestingObject.width);
            expect(getResponse.body.transaction.height).toBe(updateTestingObject.height);
            expect(getResponse.body.transaction.length).toBe(updateTestingObject.length);
            expect(getResponse.body.transaction.size).toBe(updateTestingObject.size);
            expect(getResponse.body.transaction.size_unit).toBe(updateTestingObject.size_unit);
            expect(getResponse.body.transaction.product.id).toBe(updateTestingObject.product);
            expect(getResponse.body.transaction.materials.length).toBe(updateTestingObject.materials.length);
            expect(getResponse.body.transaction.materials[0].id).toBe(updateTestingObject.materials[0]);
            expect(getResponse.body.transaction.addresses).toBe(null);
        });
    });
    describe("DELETE: DELETE a specific transaction", () => {
        it ("it should be able to delete the transaction correctly", async () => {
            const response = await request(app)
                .delete(`/transactions/${testTransactionID}`)
                .set('session-token', validSession);
            expect(response.statusCode).toBe(200);
        });
    });
});