require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const { getConfiguration } = require('../utils/Configurator');
const config = getConfiguration();
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
    invalidSearchTargets: {
        "invalid target" : "invalid target",
        "forbidden target" : process.env.FORBIDDEN_SEARCH_TARGET,
        "missing target" : undefined,
        "empty target" : ""
    },
    invalidSearchKeywords : {
        "missing keyword" : undefined,
        "empty keyword" : "",
    },
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
    },
    company : {
        validSearchObject :{
            id: "1e101",
            full_name: "glob",
            email: "1522",
            phone: "6789"
        },
        invalidSearchObject : {
            id: "!@#$%^&*",
            full_name: "!@#$%^&*",
            email: "!7#$%^&*",
            phone: "-&^6111111"
        },
        validNewAddress : validNewAddress,
        validTestingObject : {
            full_name: "Express Company",
            email: "test517@gmail.com",
            phone: "64370423",
            tax_number: "2214512342",
            addresses : [validNewAddress],
            clients: null
        },
        updateTestingObject :{
            full_name: "Express Company Updated",
            email: "updated517@gmail.com",
            phone: "64370456",
            tax_number: "2214512983",
            addresses: [{...validNewAddress, message: "delete"}, {...validNewAddress, message: "add"}], // testing the deletability of addresses
            clients: null
        }
    },
    addresses : {
        lengthTests : {
            "street" : {
                "empty String" : "",
                "too short" : `${"t".repeat(config.limitations.Min_Address_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_Address_Length + 1)}`,
            },
            "city" : {
                "empty String" : "",
                "too short" : `${"t".repeat(config.limitations.Min_City_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_City_Length + 1)}`,
            },
            "state" : {
                "empty String" : "",
                "too short" : `${"t".repeat(config.limitations.Min_State_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_State_Length + 1)}`,
            },
            "country" : {
                "empty String" : "",
                "too short" : `${"t".repeat(config.limitations.Min_Country_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_Country_Length + 1)}`,
            },
            "postal" : {
                "empty String" : "",
                "too short" : `${"t".repeat(config.limitations.Min_Postal_Length - 1)}`,
                "too long" : `${"t".repeat(config.limitations.Max_Postal_Length + 1)}`,
            },
            "category" : {
                "empty Array" : [],
                "invalid type" : ["test", "run"]
            }
        }
    },
    employee:{
        validSearchObject : {
            id: "dc450",
            name: "Jane",
            email: "smith",
            wechat_contact: "smith",
            qq_contact: "7890",
            phone: "6003",
            position: "Assembler"
        },
        invalidSearchObject : {
            id: "!@#$%^&*",
            name: "!@#$%^&*",
            email: "!7#$%^&*",
            wechat_contact: "@*(@#)98",
            qq_contact: "@*(@#)98",
            phone: "-&^6111111",
            position: "!@#,$%^&*"
        },
        validTestingObject : {
            name: "Express Employee",
            email: "test517@gmail.com",
            wechat_contact: "test517",
            qq_contact: "129384517@qq.com",
            phone: "13400094005",
            position: "" // to be attached
        },
        updateTestingObject : {
            name: "Express Employee Updated",
            email: "updated517@gmail.com",
            wechat_contact: "updated-517",
            qq_contact: "129384518@qq.com",
            phone: "13910404216",
            position: "" // to be attached
        }
    },
    position : {
        validSearchObject : {
            id: "f330",
            name: "ins"
        },
        invalidSearchObject : {
            id: "!@#$%^&*",
            name: "!@#$%^&*"
        },
        validTestingObject : {
            name: "Express Position",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject : {
            name: "Express Position Updated",
            descriptions: "Testing updates with descriptions"
        }
    },
    material : {
        validSearchObject : {
            id : "742d",
            en_name : "X-ray",
            ch_name : "相纸"
        },
        invalidSearchObject : {
            id : "!@#$%^&*",
            en_name : "!@#$%^&*",
            ch_name : "!@#$%^&*"
        },
        validTestingObject : {
            en_name: "Express Material",
            ch_name: "Express 材料",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject : {
            en_name: "Express Material Updated",
            ch_name: "Express 材料更新",
            descriptions: "Testing updates with descriptions"
        }
    },
    product : {
        validSearchObject : {
            id: "d5770",
            en_name: "seal",
            ch_name: "公章"
        },
        invalidSearchObject : {
            id : "!@#$%^&*",
            en_name : "!@#$%^&*",
            ch_name : "!@#$%^&*"
        },
        validTestingObject : { 
            en_name: "Express Product",
            ch_name: "Express 产品",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject : {
            en_name: "Express Product Updated",
            ch_name: "Express 产品更新",
            descriptions: "Testing updates with descriptions"
        }
    },
    pricing_condition : {
        validSearchObject : {
            id: "2ad7",
            quantity: "250个", // allow searches by numbe & units
            size: "5", // allow searches by number
            colour: "blue",
            product: "宣传",
            materials: "Acrylic",
            client: "two",
            company: "CUNTY"
        },
        invalidSearchObject : {
            id : "!@#$%^&*",
            quantity : "9999",
            size : "9999",
            colour : "!@#$%^&*",
            product : "!@#$%^&*",
            materials : "!@#$%^&*",
            client : "!@#$%^&*",
            company : "!@#$%^&*"
        },
        validTestingObject : {
            quantity: 500,
            quantity_unit: "个",
            size: 5,
            size_unit: "平米",
            colour: "red",
            product: null, // to be attached
            material: null, // to be attached
            client: null, // to be attached
            company: null, // to be attached
            threshold: "gt"
        },
        updateTestingObject : {
            quantity: 600,
            quantity_unit: "张",
            size: 10,
            size_unit: "平",
            colour: "blue",
            product: null, // to be attached
            material: null, // to be attached
            client: null, // to be attached
            company: null, // to be attached
            threshold: "lt"
        }
    },
    pricing_rule : {
        validSearchObject : {
            id: "c7a7c",
            price_per_unit: "50.1"
        },
        invalidSearchObject : {
            id : "!@#$%^&*",
            price_per_unit : "999"
        },
        validTestingObject : {
            price_per_unit: 95,
            conditions: null // to be attached
        },
        updateTestingObject : {
            price_per_unit: 70,
            conditions: null // to be attached
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
function isCompanyValid(company) {
    if ('id' in company &&
        'full_name' in company &&
        'email' in company &&
        'phone' in company
    ) {
        return true;
    }
    return false;
}
function isSpecificCompanyValid(company) {
    if ('id' in company &&
        'full_name' in company &&
        'email' in company &&
        'phone' in company &&
        'tax_number' in company &&
        'addresses' in company &&
        'clients' in company
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
        return true;
    }
    return false;
}
function isEmployeeValid(employee) {
    if ('id' in employee &&
        'name' in employee &&
        'wechat_contact' in employee &&
        'qq_contact' in employee &&
        'phone' in employee &&
        'position' in employee
    ) {
        return true;
    }
    return false;
}
function isSpecificEmployeeValid(employee){
    if ('id' in employee &&
        'name' in employee &&
        'email' in employee &&
        'wechat_contact' in employee &&
        'qq_contact' in employee &&
        'phone' in employee &&
        'position' in employee
    ) {
        if ('id' in employee.position &&
            'name' in employee.position &&
            'descriptions' in employee.position
        ){
            return true;
        }
    }
    return false;
}

function isPositionValid(position) {
    if ('id' in position &&
        'name' in position &&
        'descriptions' in position
    ) {
        return true;
    }
    return false;
}
function isMaterialValid(material) {
    if ('id' in material &&
        'en_name' in material &&
        'ch_name' in material
    ){
        return true;
    }
    return false;
}
function isSpecificMaterialValid(material) {
    if ('id' in material &&
        'en_name' in material &&
        'ch_name' in material &&
        'descriptions' in material
    ){
        return true;
    }
    return false;
}
function isProductValid(product) {
    if ('id' in product &&
        'en_name' in product &&
        'ch_name' in product
    ){
        return true;
    }
    return false;
}
function isSpecificProductValid(product) {
    if ('id' in product &&
        'en_name' in product &&
        'ch_name' in product &&
        'descriptions' in product
    ){
        return true;
    }
    return false;
}
function isConditionValid(condition) {
    if ('id' in condition &&
        'quantity' in condition &&
        'size' in condition &&
        'size_unit' in condition &&
        'quantity_unit' in condition &&
        'colour' in condition &&
        'threshold' in condition &&
        'product' in condition &&
        'materials' in condition &&
        'client' in condition && 
        'company' in condition
    ){
        const isProductValid = 
            'id' in condition.product && 
            'en_name' in condition.product && 
            'ch_name' in condition.product;

        function isMaterialValid() {
            if (condition.materials == null) return true;
            if ('id' in condition.materials[0] &&
                'en_name' in condition.materials[0] &&
                'ch_name' in condition.materials[0]
            ){
                return true;
            }
            return false;
        }

        function isClientValid() {
            if (condition.client == null) return true;
            if ('id' in condition.client &&
                'full_name' in condition.client
            ){
                return true;
            }
            return false;
        }

        function isCompanyValid() {
            if (condition.company == null) return true;
            if ('id' in condition.company &&
                'full_name' in condition.company
            ){
                return true;
            }
            return false;
        }

        if (isProductValid && isMaterialValid() && isClientValid() && isCompanyValid()){
            return true;
        }
    }
    return false;
}

function isRuleValid(rule) {
    if ('id' in rule &&
        'price_per_unit' in rule){
        const isValidCondition = isConditionValid(rule.conditions[0]);
        if (isValidCondition) return true;
    }
    return false;
}


/**
 * Section of functions used to manage the valid testing cases 
 */
async function getTestSession(app){
    const response = await request(app).post('/auth').send({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PW
    });
    return response.body.session;
}
async function getTestCompany(app, session){
    const response = await request(app)
        .get('/companies')
        .set('session-token', session)
        .set('page', 1);
    return response.body.companies[0];
}
async function getTestClient(app, session){
    const response = await request(app)
        .get('/clients')
        .set('session-token', session)
        .set('page', 1);
    return response.body.clients[0];
}
async function getTestEmployee(app, session){
    const response = await request(app)
        .get('/employees')
        .set('session-token', session)
        .set('page', 1);
    return response.body.employees[0];
}
async function getTestPosition(app, session){ 
    const response = await request(app)
        .get('/positions')
        .set('session-token', session)
        .set('page', 1);
    return response.body.positions[0];
}
async function getTestMaterial(app, session){
    const response = await request(app)
        .get('/materials')
        .set('session-token', session)
        .set('page', 1);
    return response.body.materials[0];
}
async function getTestProduct(app, session){
    const response = await request(app)
        .get('/products')
        .set('session-token', session)
        .set('page', 1);
    return response.body.products[0];
}
async function getTestPricingCondition(app, session){
    const response = await request(app)
        .get('/pricings/conditions')
        .set('session-token', session)
        .set('page', 1);
    return response.body.pricing_conditions[0];
}
async function getTestPricingRule(app, session){
    const response = await request(app)
        .get('/pricings/rules')
        .set('session-token', session)
        .set('page', 1);
    return response.body.pricing_rules[0];
}


module.exports = {
    getTestSession,
    getTestCompany,
    getTestClient,
    getTestEmployee,
    getTestPosition,
    getTestMaterial,
    getTestProduct,
    getTestPricingCondition,
    getTestPricingRule,
    testObject,
    isClientValid,
    isSpecificClientValid,
    isCompanyValid,
    isSpecificCompanyValid,
    isSpecificAddressValid,
    isEmployeeValid,
    isSpecificEmployeeValid,
    isPositionValid,
    isMaterialValid,
    isSpecificMaterialValid,
    isProductValid,
    isSpecificProductValid,
    isConditionValid,
    isRuleValid
}