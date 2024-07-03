const {
    validateGenericID
} = require('./Validator');
const request = require('supertest');

// Objects to construct the testing cases:
const validNewAddress =  {
    message: "add",
    id: "new",
    street: "Test Street",
    city: "Sydney",
    state: "北京市",
    country: "Australia",
    postal: "658097",
    category: ["bill"]
}

const testObject = {
    invalidEmailSuffix : "@g.com",
    register : {
        validTestUsername: "test Express",
        validTestEmail: "testExpress@gmail.com",
        validTestPassword: "testPassword%586",
    },
    client : {
        validSearchObject : {
            id: "eef39",
            full_name: "one",
            email: "one",
            phone: "6789",
            wechat_contact: "wo5678",
            qq_contact: "7890",
            company: "glob"
        },
        invalidSearchObject : {
            id: "!@#$%^&*",
            full_name: "!@#$%^&*",
            email: "!7#$%^&*",
            phone: "-611111111111",
            wechat_contact: "@*(@#)98",
            qq_contact: "@*(@#)98",
            company: "!@#$%^&*",
        },
        validNewAddress : validNewAddress,
        validTestingObject : {
            full_name: "Test Client",
            email: "test517@gmail.com",
            phone: "13910404215",
            wechat_contact: "test-517",
            qq_contact: "129384517@qq.com",
            company: "", // to be assigned if needed
            addresses: [validNewAddress]
        },
        updateTestingObject :{
            full_name: "Test Client Updated",
            email: "updated517@gmail.com",
            phone: "13910404216",
            wechat_contact: "updated-517",
            qq_contact: "129384518@qq.com",
            company: null, // test for removal of connections
            addresses: [{...validNewAddress, message: "update"}, {...validNewAddress, message: "add"}]
        }
    }
}

// helper function to validate the test response of the endpoints
function isClientValid(client) {
    if ('id' in client &&
        'full_name' in client &&
        'email' in client &&
        'phone' in client &&
        'wechat_contact' in client &&
        'qq_contact' in client &&
        'company' in client
    ) {
        return true;
    }
    return false;
}
function isSpecificClientValid(client) {
    if ('id' in client &&
        'full_name' in client &&
        'email' in client &&
        'phone' in client &&
        'wechat_contact' in client &&
        'qq_contact' in client &&
        'company' in client &&
        'addresses' in client
    ) {
        return true;
    }
    return false;
}
function isSpecificAddressValid(address, reference = null) {
    if ('id' in address &&
        'street' in address &&
        'city' in address &&
        'state' in address &&
        'country' in address &&
        'postal' in address &&
        'category' in address
    ) {
        // if (reference != null) {
        //     if (validateGenericID(address.id, "address")) 
        // }
        
        return true;
    }
    return false;
}

async function getTestSession(app){
    const response = await request(app).post('/auth').send({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PW
    });
    return response.body.session;
}

//getting a valid company in the testing Database
async function getTestCompany(app, session){
    const response = await request(app)
        .get('/companies')
        .set('session-token', session)
        .send({ page: 1 });
    return response.body.companies[0];
}

module.exports = {
    getTestSession,
    getTestCompany,
    testObject,
    isClientValid,
    isSpecificClientValid,
    isSpecificAddressValid
}