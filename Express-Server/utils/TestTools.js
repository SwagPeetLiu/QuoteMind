require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.test'
});
const { getConfiguration } = require('../utils/Configurator');
const config = getConfiguration();
const request = require('supertest');

// Objects to construct the testing cases:
const validNewAddress = {
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
    invalidEmailSuffix: "@g.com",
    register: {
        validTestUsername: "test Express",
        validTestEmail: "testExpress@gmail.com",
        validTestPassword: "testPassword%586",
    },
    client: {
        validSearchObject: {
            id: "eef39",
            full_name: "one",
            email: "one",
            phone: "13800",
            wechat_contact: "wo5678",
            qq_contact: "7890",
            company: "glob"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            full_name: "!@#$%^&*",
            email: "!7#$%^&*",
            phone: "-611111111111",
            wechat_contact: "@*(@#)98",
            qq_contact: "@*(@#)98",
            company: "!@#$%^&*",
        },
        validNewAddress: validNewAddress,
        validTestingObject: {
            full_name: "Test Client",
            email: "test517@gmail.com",
            phone: "13910404215",
            wechat_contact: "test-517",
            qq_contact: "129384517@qq.com",
            company: "", // to be assigned if needed
            addresses: [validNewAddress]
        },
        updateTestingObject: {
            full_name: "Test Client Updated",
            email: "updated517@gmail.com",
            phone: "13910404216",
            wechat_contact: "updated-517",
            qq_contact: "129384518@qq.com",
            company: null, // test for removal of connections
            addresses: [{ ...validNewAddress, message: "update" }, { ...validNewAddress, message: "add" }]
        }
    },
    company: {
        validSearchObject: {
            id: "1e101",
            full_name: "glob",
            email: "1522",
            phone: "6789"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            full_name: "!@#$%^&*",
            email: "!7#$%^&*",
            phone: "-&^6111111"
        },
        validNewAddress: validNewAddress,
        validTestingObject: {
            full_name: "Express Company",
            email: "test517@gmail.com",
            phone: "64370423",
            tax_number: "2214512342",
            addresses: [validNewAddress],
            clients: null
        },
        updateTestingObject: {
            full_name: "Express Company Updated",
            email: "updated517@gmail.com",
            phone: "64370456",
            tax_number: "2214512983",
            addresses: [{ ...validNewAddress, message: "delete" }, { ...validNewAddress, message: "add" }], // testing the deletability of addresses
            clients: null
        }
    },
    employee: {
        validSearchObject: {
            id: "dc450",
            name: "Jane",
            email: "smith",
            wechat_contact: "smith",
            qq_contact: "7890",
            phone: "6003",
            position: "Assembler"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            name: "!@#$%^&*",
            email: "!7#$%^&*",
            wechat_contact: "@*(@#)98",
            qq_contact: "@*(@#)98",
            phone: "-&^6111111",
            position: "!@#,$%^&*"
        },
        validTestingObject: {
            name: "Express Employee",
            email: "test517@gmail.com",
            wechat_contact: "test517",
            qq_contact: "129384517@qq.com",
            phone: "13400094005",
            position: "" // to be attached
        },
        updateTestingObject: {
            name: "Express Employee Updated",
            email: "updated517@gmail.com",
            wechat_contact: "updated-517",
            qq_contact: "129384518@qq.com",
            phone: "13910404216",
            position: "" // to be attached
        }
    },
    position: {
        validSearchObject: {
            id: "f330",
            name: "ins"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            name: "!@#$%^&*"
        },
        validTestingObject: {
            name: "Express Position",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject: {
            name: "Express Position Updated",
            descriptions: "Testing updates with descriptions"
        }
    },
    material: {
        validSearchObject: {
            id: "742d",
            en_name: "X-ray",
            ch_name: "相纸"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            en_name: "!@#$%^&*",
            ch_name: "!@#$%^&*"
        },
        validTestingObject: {
            en_name: "Express Material",
            ch_name: "Express 材料",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject: {
            en_name: "Express Material Updated",
            ch_name: "Express 材料更新",
            descriptions: "Testing updates with descriptions"
        }
    },
    product: {
        validSearchObject: {
            id: "d5770",
            en_name: "seal",
            ch_name: "公章"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            en_name: "!@#$%^&*",
            ch_name: "!@#$%^&*"
        },
        validTestingObject: {
            en_name: "Express Product",
            ch_name: "Express 产品",
            descriptions: "Testing tools with descriptions"
        },
        updateTestingObject: {
            en_name: "Express Product Updated",
            ch_name: "Express 产品更新",
            descriptions: "Testing updates with descriptions"
        }
    },
    pricing_condition: {
        validSearchObject: {
            id: "2ad7",
            quantity: "250个", // allow searches by numbe & units
            size: "5", // allow searches by number
            colour: "red",
            product: "宣传",
            materials: "Acrylic",
            client: "two",
            company: "CUNTY"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            quantity: "9999",
            size: "9999",
            colour: "!@#$%^&*",
            product: "!@#$%^&*",
            materials: "!@#$%^&*",
            client: "!@#$%^&*",
            company: "!@#$%^&*"
        },
        validTestingObject: {
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
        updateTestingObject: {
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
    pricing_rule: {
        validSearchObject: {
            id: "c7a7c",
            price_per_unit: "50.1"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            price_per_unit: "999"
        },
        validTestingObject: {
            price_per_unit: 95,
            conditions: null // to be attached
        },
        updateTestingObject: {
            price_per_unit: 70,
            conditions: null // to be attached
        }
    },
    transaction: {
        validSearchObject: {
            id: "dc572a6",
            status: "created",
            product: "展",
            quantity: "50items",
            materials: "不锈钢",
            name: "Exhibition",
            price_per_unit: "10", // mimic the ability to search float by inputing a integer
            amount: "500.0",
            note: "noted",
            colour: "red",
            company: "glob",
            client: "two",
            width: "5.2",
            height: "3.8cm",
            length: "6.6",
            size: "19.76square M"
        },
        invalidSearchObject: {
            id: "!@#$%^&*",
            status: "!@#$%^&*",
            product: "!@#$%^&*",
            quantity: "999pas",
            materials: "!@#$%^&*",
            name: "!@#$%^&*",
            price_per_unit: "999x",
            amount: "999kg",
            note: "!@#$%^&*",
            colour: "!@#$%^&*",
            company: "!@#$%^&*",
            client: "!@#$%^&*",
            width: "999.9xxxx",
            height: "999.9px",
            length: "999.9sss",
            size: "999.9cm"
        },
        validTestingObject: {
            status: "created",
            name: "Express Transaction",
            transaction_date: null,
            product: null, // to be attached
            quantity: 95,
            materials: null, // to be attached
            price_per_unit: 1, // to be attached
            amount: 95,
            note: "test,note",
            colour: "yellow",
            company: null,
            client: null,
            width: 6.0,
            height: 5,
            length: 2,
            size: 60,
            en_unit: "m",
            ch_unit: "米",
            size_unit: "平米",
            quantity_unit: "个",
            addresses: null // to be attached
        },
        updateTestingObject: {
            status: "quoted",
            name: "Express Transaction Updated",
            transaction_date: "2024-07-09T00:00:00.000Z",
            product: null, // to be attached
            quantity: 113,
            materials: null, // to be attached
            price_per_unit: 1, // to be attached
            amount: 113,
            note: "test,note updated",
            colour: "RGB colour",
            company: null,
            client: null,
            width: 6.0,
            height: 5,
            length: 4,
            size: 120,
            en_unit: "m",
            ch_unit: "米",
            size_unit: "平米总和",
            quantity_unit: "个总和",
            addresses: null // to be attached
        }
    },
    profile: {
        validTestingObject: {
            email: process.env.TEST_EMAIL,
            username: "Test Account",
            password: process.env.TEST_PW
        },
        updateTestingObject: {
            email: process.env.TEST_EMAIL,
            username: "Test Account updated",
            password: `${process.env.TEST_PW}test`
        }
    },
    counter: {
        validSearchObject: config.counter.availableTargets,
        invalidSearchObject: config.counter.forbiddenTargets
    },
    search: {
        defaultStructure: {
            searchQuery: {
                fields: "default",
                whereClause: null,
                groupByClause: null,
                orderByClause: "default"
            },
            page: null
        },
        defaultfield: {
            target: "id",
            specification: "default",
            as: null
        },
        defualtSingleWhereClause: {
            target: "name",
            operator: "eq",
            keyword: "express",
            specification: "default",
            transformType: null
        },
        defaultDualWhereClause: {
            "AND": [
                {
                    target: "name",
                    operator: "eq",
                    keyword: "express",
                    specification: "default",
                    transformType: null
                },
                {
                    target: "id",
                    operator: "eq",
                    keyword: "1",
                    specification: "default",
                    transformType: null
                }
            ]
        },
        transformativeDualWhereClause: [
            {
                target: "transaction_date",
                operator: "eq",
                keyword: "6",
                specification: "MONTH",
                transformType: "integer"
            },
            {
                target: "transaction_date",
                operator: "ne",
                keyword: "2023",
                specification: "YEAR",
                transformType: "integer"
            }
        ],
        recursiveWhereClause: {
            "OR": [
                {
                    "AND": [
                        {
                            target: "full_name",
                            operator: "eq",
                            keyword: "cli",
                            specification: "default",
                            transformType: null
                        }
                    ]
                },
                {
                    target: "full_name",
                    operator: "eq",
                    keyword: "4",
                    specification: "default",
                    transformType: null
                },
                {
                    target: "full_name",
                    operator: "ne",
                    keyword: "3",
                    specification: "default",
                    transformType: null
                }
            ]
        },
        defaultSingleGroupByClause: {
            target: "id",
            specification: "default",
        },
        defaultSingleOrderByClause: {
            target: "id",
            specification: "default",
            order: "ASC"
        }
    }
}

// object to test the user input
const invalidTestingRange = {
    invalidColumnValue: {
        "numeric value": 1,
        "boolean value": true,
        "invalud column": "testV",
        "empty string": "",
        "undefined": undefined
    },
    invalidSpecificationValue: {
        "numeric value": 1,
        "boolean value": true,
        "invalud specification": "testV",
        "empty string": "",
        "undefined": undefined
    },
    invalidAlias: {
        "numeric value": 1,
        "boolean value": true,
        "empty string": "",
        "undefined": undefined,
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    invalidOperator: {
        "numeric value": 1,
        "boolean value": true,
        "empty string": "",
        "undefined": undefined,
        "invalid operator": "!@#",
    },
    invalidTransformType: {
        "numeric value": 1,
        "boolean value": true,
        "empty string": "",
        "undefined": undefined,
        "invalid transform type": "test",
    },
    invalidTransformationValue: {
        "invalid numeric specification": {
            ...testObject.search.defaultSingleWhereClause,
            specification: "TEXT",
            transformType: "numeric"
        },
        "invalid integer specification": {
            ...testObject.search.defaultSingleWhereClause,
            specification: "default",
            transformType: "integer"
        },
        "invalid text specification": {
            ...testObject.search.defaultSingleWhereClause,
            target: "transaction_date",
            specification: "MONTH",
            transformType: "text"
        }
    },
    invalidOrder: {
        "numeric value": 1,
        "boolean value": true,
        "empty string": "",
        "undefined": undefined,
        "invalid order": "UP",
    },
    invalidSearchKeywords: {
        "numeric value": 1,
        "boolean value": true,
        "missing keyword": undefined,
        "empty keyword": "",
        "too long": `${"是".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    invalidSearchTargets: {
        "invalid target": "invalid target",
        "forbidden target": process.env.FORBIDDEN_SEARCH_TARGET,
        "missing target": undefined,
        "empty target": ""
    },
    page: {
        "invalid value": "test",
        "negative": -1,
        "zero": 0
    },
    invalidCounterTargets: {
        "invalid target": "invalid target",
        "forbidden table name": testObject.counter.invalidSearchObject[0],
        "missing target": undefined
    },
    email: {
        "invalid value": "!@#$%^&*",
        "invalid type": 1,
        "less than minimum": `t${testObject.invalidEmailSuffix}`,
        "too long": `${"t".repeat(config.limitations.Max_Email_Length)}${testObject.invalidEmailSuffix}`,
        "unmatching email": process.env.ANOTHER_EMAIL
    },
    phone: {
        "invalid format": "!@#$%^&*",
        "invalid type": 1,
        "too short": `${"1".repeat(config.limitations.Min_Phone_Length - 1)}`,
        "too long": `${"1".repeat(config.limitations.Max_Phone_Length + 1)}`,
    },
    wechat_contact: {
        "invalid format": "!@#$%^&*",
        "invalid type": 1,
        "too short": `${"t".repeat(config.limitations.Min_Social_Contact_Length - 1)}`,
        "too long": `${"t".repeat(config.limitations.Max_Social_Contact_Length + 1)}`,
    },
    qq_contact: {
        "invalid format": "1324sa32",
        "invalid type": 1,
        "too short": "1@qq.com",
        "too long": `${"1".repeat(config.limitations.Max_Social_Contact_Length + 1)}@qq.com`,
    },
    company: {
        "non-UUID": "1324sa32",
        "invalid type": 1,
        "non-existing UUID": "e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f" // randomly formatted string
    },
    client: {
        "invalid type": 9,
        "non-UUID": "1324sa32",
        "non-existing UUID": "e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"
    },
    position: {
        "invalid type": 9,
        "non-UUID": "string",
        "non-existing UUID": "e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"
    },
    addresses: {
        "invalid type": "string",
        "invalid value": [1],

        "missing street": [{ ...validNewAddress, street: undefined }],
        "street name is invalid type": [{ ...validNewAddress, street: 1 }],
        "street name is too short": [{ ...validNewAddress, street: `${"t".repeat(config.limitations.Min_Address_Length - 1)}` }],
        "street name is too long": [{ ...validNewAddress, street: `${"t".repeat(config.limitations.Max_Address_Length + 1)}` }],

        "missing city": [{ ...validNewAddress, city: undefined }],
        "city name is invalid type": [{ ...validNewAddress, city: 1 }],
        "city name is too short": [{ ...validNewAddress, city: `${"t".repeat(config.limitations.Min_City_Length - 1)}` }],
        "city name is too long": [{ ...validNewAddress, city: `${"t".repeat(config.limitations.Max_City_Length + 1)}` }],

        "missing state": [{ ...validNewAddress, state: undefined }],
        "state name is invalid type": [{ ...validNewAddress, state: 1 }],
        "state name is too short": [{ ...validNewAddress, state: `${"t".repeat(config.limitations.Min_State_Length - 1)}` }],
        "state name is too long": [{ ...validNewAddress, state: `${"t".repeat(config.limitations.Max_State_Length + 1)}` }],

        "missing country": [{ ...validNewAddress, country: undefined }],
        "country name is invalid type": [{ ...validNewAddress, country: 1 }],
        "country name is too short": [{ ...validNewAddress, country: `${"t".repeat(config.limitations.Min_Country_Length - 1)}` }],
        "country name is too long": [{ ...validNewAddress, country: `${"t".repeat(config.limitations.Max_Country_Length + 1)}` }],

        "missing postal": [{ ...validNewAddress, postal: undefined }],
        "postal code is invalid type": [{ ...validNewAddress, postal: 1 }],
        "postal code is too short": [{ ...validNewAddress, postal: `${"t".repeat(config.limitations.Min_Postal_Length - 1)}` }],
        "postal code is too long": [{ ...validNewAddress, postal: `${"t".repeat(config.limitations.Max_Postal_Length + 1)}` }],

        "missing category": [{ ...validNewAddress, category: undefined }],
        "category is invalid value": [{ ...validNewAddress, category: ["invalid category"] }],
        "category is invalid type": [{ ...validNewAddress, category: [1] }],
        "category is empty": [{ ...validNewAddress, category: [] }],
        "category is invalid type (non-array)": [{ ...validNewAddress, category: "invalid category" }]
    },
    password: {
        "empty string": "",
        "invalid credential": "!@#$%^&*",
        "invalid type": 1,
        "less than minimum": `${"t".repeat(config.limitations.Min_Password_Length - 1)}`,
        "too long": `${"t".repeat(config.limitations.Max_Password_Length + 1)}`
    },
    loggOutToken: {
        "empty string": "",
        "invalid type": 1,
        "missing": undefined,
    },
    full_name: {
        "invalid type": 1,
        "invalid input": "!@#$%^&*",
        "empty": "",
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
        "missing": undefined
    },
    tax_number: {
        "invalid format": "!@#$%^&*",
        "too short": `${"1".repeat(config.limitations.Min_Tax_Length - 1)}`,
        "too long": `${"1".repeat(config.limitations.Max_Tax_Length + 1)}`,
        "invalid type": 1
    },
    status: {
        "invalid type": 1,
        "missing": undefined,
        "empty": "",
        "invalid value": "invalid status"
    },
    transaction_date: {
        "invalid type": 1,
        "invalid format": "invalid date",
        "future Date": getFutureDate(7), // 7 days into the future
    },
    quantity: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015,
        "decimal value": 4.5
    },
    quantity_unit: {
        "invalid type": 1,
        "invalid value": "!@#$%^&*",
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    price_per_unit: {
        "invalid type": "x t4st撒",
        "eual to 0": 0,
        "negative": -1,
        "large value": 123456789015.1256
    },
    amount: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015.1234
    },
    colour: {
        "invalid type": 1,
        "invalid value": "!@#$%^&*",
        "too long": `${"测".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    width: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015.1256
    },
    height: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015.1256
    },
    length: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015.1256
    },
    en_unit: {
        "invalid type": 1,
        "invalid value": "!@#$%^&*",
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    ch_unit: {
        "invalid type": 1,
        "invalid value": "!@#$%^&*",
        "too long": `${"测".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    size: {
        "invalid type": "x t4st",
        "negative": -1,
        "large value": 123456789015.1256
    },
    size_unit: {
        "invalid type": 1,
        "invalid value": "!@#$%^&*",
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
    },
    product: {
        "invalid type": 1,
        "Non-UUId": "invalid id",
        "invalid uuid": "e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f",
        "missing": undefined
    },
    materials: {
        "invalid value": ["string"],
        "non-UUID": [9],
        "none-array": "string",
        "invalid-UUID": ["e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"]
    },
    conditions: {
        "invalid type": [9],
        "non-UUID": "string",
        "missing": undefined,
        "invalid-UUID": ["e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"]
    },
    en_name: {
        "missing": undefined,
        "empty": "",
        "too long": `${"t".repeat(config.limitations.Max_Name_Length + 1)}`,
        "invalid type": 1
    },
    ch_name: {
        "missing": undefined,
        "empty": "",
        "too long": `${"测".repeat(config.limitations.Max_Name_Length + 1)}`,
        "invalid type": 1
    },
    descriptions: {
        "too long": `${"测".repeat(config.limitations.Max_Descriptions_Length + 1)}`,
        "invalid type": 1
    },
    threshold: {
        "invalid type": 9,
        "invalid value": "string",
    },
    clientOpMessage: {
        "invalid type": 1,
        "invalid input": "invalid",
        "forbidden type": "update"
    },
    transactionAddress: {
        "invalid type": 1,
        "invalid type": "invalid",
        "non-UUID": ["invalid"],
        "invalid-UUID": ["e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"]
    },
    employee: {
        "invalid type": 1,
        "non-UUID": ["invalid"],
        "invalid-UUID": ["e3f1d8d8-0581-48ea-a80b-82b5b3a8f10f"]
    }
}

/*
* ======================================================================
* helper function to validate the test response of the endpoints
* ======================================================================
*/
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
function isAssociatedClientValid(client) {
    if ('id' in client &&
        'full_name' in client
    ) {
        return true;
    }
    return false
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
function isCompanyValid(company) { // record in the general listing
    if ('id' in company &&
        'full_name' in company &&
        'email' in company &&
        'phone' in company
    ) {
        return true;
    }
    return false;
}
function isAssociatedCompanyValid(company) { // records in the associated route
    if ('id' in company &&
        'full_name' in company
    ) {
        return true;
    }
    return false
}
function isSpecificCompanyValid(company) { // records in the specific route
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
function isSpecificAddressValid(address) {
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
function isAssociatedEmployeeValid(employee) {
    if ('id' in employee &&
        'name' in employee
    ) {
        return true;
    }
    return false
}
function isSpecificEmployeeValid(employee) {
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
        ) {
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
    ) {
        return true;
    }
    return false;
}
function isSpecificMaterialValid(material) {
    if ('id' in material &&
        'en_name' in material &&
        'ch_name' in material &&
        'descriptions' in material
    ) {
        return true;
    }
    return false;
}
function isProductValid(product) {
    if ('id' in product &&
        'en_name' in product &&
        'ch_name' in product
    ) {
        return true;
    }
    return false;
}
function isSpecificProductValid(product) {
    if ('id' in product &&
        'en_name' in product &&
        'ch_name' in product &&
        'descriptions' in product
    ) {
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
    ) {
        // validate asociations
        const isPValid = isProductValid(condition.product);
        const isMValid = condition.materials ? isMaterialValid(condition.materials[0]) : true;
        const isCValid = condition.client ? isAssociatedClientValid(condition.client) : true;
        const isCOValid = condition.company ? isAssociatedCompanyValid(condition.company) : true;

        if (isPValid &&
            isMValid &&
            isCValid &&
            isCOValid) {
            return true;
        }
    }
    return false;
}

function isRuleValid(rule) {
    if ('id' in rule &&
        'price_per_unit' in rule) {
        const isValidCondition = isConditionValid(rule.conditions[0]);
        if (isValidCondition) return true;
    }
    return false;
}

// covers both general listing and specific listing of a company
function isTransactionValid(transaction, granularity) {
    if ('transaction_date' in transaction &&
        'creation_date' in transaction &&
        'modified_date' in transaction &&
        'status' in transaction &&
        'id' in transaction &&
        'name' in transaction &&
        'quantity' in transaction &&
        'price_per_unit' in transaction &&
        'amount' in transaction &&
        'note' in transaction &&
        'colour' in transaction &&
        'en_unit' in transaction &&
        'ch_unit' in transaction &&
        'width' in transaction &&
        'height' in transaction &&
        'length' in transaction &&
        'size' in transaction &&
        'quantity_unit' in transaction &&
        'size_unit' in transaction &&
        'materials' in transaction &&
        'product' in transaction &&
        'company' in transaction &&
        'client' in transaction
    ) {
        const isassociatedMaterialValid = transaction.materials ? isMaterialValid(transaction.materials[0]) : true;
        const isassociatedProductValid = transaction.product ? isProductValid(transaction.product) : true;
        const isassociatedClientValid = (transaction.client && typeof transaction.client !== 'string') ? isAssociatedClientValid(transaction.client) : true;
        const isassociatedCompanyValid = (transaction.company && typeof transaction.company !== 'string') ? isAssociatedCompanyValid(transaction.company) : true;
        function isAddressValid() {
            if ('addresses' in transaction) {
                return transaction.addresses ? isSpecificAddressValid(transaction.addresses[0]) : true;
            }
            return true;
        };
        function isEmployeeValid() {
            if ('employee' in transaction) {
                return transaction.employee ? isAssociatedEmployeeValid(transaction.employee[0]) : true;
            }
            return true;
        };
        if (isassociatedMaterialValid &&
            isassociatedProductValid &&
            isassociatedClientValid &&
            isassociatedCompanyValid &&
            isAddressValid() &&
            isEmployeeValid()) {
            return true;
        }
        return false;
    }
    return false;
}

function isSearchTargetValid(targets) {
    if (!Array.isArray(targets)) return false;
    if (targets.length === 0) return false;
    for (const target of targets) {
        if (!("table" in target) || (!"column" in target) || !("type" in target)) return false;

        // cannot contain forbidden columns:
        if (config.search.forbiddenTargets.includes(target.column.toLowerCase())) return false;

        // cannot contain forbidden tables:
        if (config.counter.forbiddenTargets.includes(target.table.toLowerCase())) return false;
    }
    return true;
}

/*
* ============================================================================================
* Utility Sections
* ============================================================================================
*/
function getFutureDate(daysInFuture) {
    const now = new Date();
    now.setDate(now.getDate() + daysInFuture);

    // Format the date to "YYYY-MM-DDTHH:mm:ss.sssZ"
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() is zero-based
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}

// function used to generate a functional field
function getTestAlias(reference) {
    if (reference.type === "timestamp with time zone") {
        return {
            target: reference.column,
            specification: "MONTH",
            as: "test"
        }
    }
    if (reference.type.includes("character") || reference.type === "uuid" || reference.type === "USER-DEFINED") {
        return {
            target: reference.column,
            specification: "TEXT",
            as: "test"
        }
    }
    if (reference.type === "ARRAY") {
        return {
            target: reference.column,
            specification: "ARRAY_DIMS",
            as: "test"
        }
    }
    if (reference.type === "numeric" || reference.type === "integer") {
        return {
            target: reference.column,
            specification: "ABS",
            as: "test"
        }
    }
    return {
        target: reference.column,
        specification: "TEXT",
        as: "test"
    }
}

/**
 * ============================================================================================
 * Section of functions used to manage the valid testing cases 
 * ============================================================================================
 */
async function getTestSession(app) {
    const response = await request(app).post('/auth').send({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PW
    });
    return response.body.session;
}
async function getTestCompany(app, session) {
    const response = await request(app)
        .get('/companies')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.companies[0];
}
async function getTestSpecificCompany(app, session, id) {
    const response = await request(app)
        .get(`/companies/${id}`)
        .set('session-token', session);
    return response.body.company;
}
async function getTestClient(app, session) {
    const response = await request(app)
        .get('/clients')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.clients[0];
}
async function getTestEmployee(app, session) {
    const response = await request(app)
        .get('/employees')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.employees[0];
}
async function getTestPosition(app, session) {
    const response = await request(app)
        .get('/positions')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.positions[0];
}
async function getTestMaterial(app, session) {
    const response = await request(app)
        .get('/materials')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.materials[0];
}
async function getTestProduct(app, session) {
    const response = await request(app)
        .get('/products')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.products[0];
}
async function getTestPricingCondition(app, session) {
    const response = await request(app)
        .get('/pricings/conditions')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.pricing_conditions[0];
}
async function getTestPricingRule(app, session) {
    const response = await request(app)
        .get('/pricings/rules')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.pricing_rules[0];
}
async function getTestTransaction(app, session) {
    const response = await request(app)
        .get('/transactions')
        .set('session-token', session)
        .query({ page: 1 });
    return response.body.transactions[0];
}

module.exports = {
    getTestSession,
    getTestCompany,
    getTestSpecificCompany,
    getTestClient,
    getTestEmployee,
    getTestPosition,
    getTestMaterial,
    getTestProduct,
    getTestPricingCondition,
    getTestPricingRule,
    getTestTransaction,
    testObject,
    invalidTestingRange,
    getFutureDate,
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
    isRuleValid,
    isTransactionValid,
    isSearchTargetValid,
    getTestAlias,
}