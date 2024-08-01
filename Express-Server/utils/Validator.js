require('dotenv').config({
    path: process.env.NODE_ENV === 'development' ? '.env.test' : '.env.prod'
});
const validator = require('validator');
const { getConfiguration } = require('./Configurator');
const config = getConfiguration();
const { mapOperator } = require('./Formatter');
const unicodeRegex = /^[\p{L}\p{N}\p{P}\s]+$/u; // Regular expression to check for Unicode letters, numbers, and spaces

/*
 * ==============================================================================
 * Section used to validate the db References & preprocess them:
 * ==============================================================================
*/
function validateAndPreProcessQuery(body, tableName, dbReferences){
    let { searchQuery, page } = body;

    // obtaining the references for such querying table
    const references = dbReferences.filter(reference => reference.table === tableName);
    if (references.length === 0) return { valid: false, message: "unsupported tableName"};

    // validating page:
    if (page){
        const pageValidation = validateInteger(page, "page number");
        if (!pageValidation.valid) return pageValidation;
    }

    // validate the query itself:
    if (!searchQuery || typeof searchQuery !== "object") return { valid: false, message: "invalid query object" };

    // validating the querying fields:
    if ((!'fields' in searchQuery) || (searchQuery.fields !== "default" && !Array.isArray(searchQuery.fields))){
        return { valid: false, message: "invalid query fields" };
    }
    if (Array.isArray(searchQuery.fields)){
        if (searchQuery.fields.length === 0) return { valid: false, message: "empty query fields" };
        let mappedFields = [];
        for (const field of searchQuery.fields){
            const validation = validateField(field, references);
            if (!validation.valid) return validation;
            mappedFields.push({ ...field, type: validation.type });
        }
        searchQuery = { ...searchQuery, fields: mappedFields };
    }

    // validating the whereClause:
    if (!'whereClause' in searchQuery || (searchQuery.whereClause != null && typeof searchQuery.whereClause !== "object")){
        return { valid: false, message: "invalid whereClause" };
    }
    if (searchQuery.whereClause){
        const validatedClause = validateWhereClause(searchQuery.whereClause, references);
        if (!validatedClause) return { valid: false, message: "invalid whereClause" };
        searchQuery = { ...searchQuery, whereClause: validatedClause };
    }

    // validating the groupByClause:
    if (!'groupByClause' in searchQuery || 
        (searchQuery.groupByClause != null && !Array.isArray(searchQuery.groupByClause))){
        return { valid: false, message: "invalid groupByClause" };
    }
    if (Array.isArray(searchQuery.groupByClause)){
        if (searchQuery.groupByClause.length === 0) return { valid: false, message: "empty groupByClause" };
        let mappedGroupByClauses = [];
        for (const clause of searchQuery.groupByClause){
            const validation = validateGroupByClause(clause, references, searchQuery.fields);
            if (!validation.valid) return validation;
            mappedGroupByClauses.push({ ...clause, type: validation.type });
        }
        searchQuery = { ...searchQuery, groupByClause: mappedGroupByClauses };
    }

    // validating the Order BY Clause
    if (!'orderByClause' in searchQuery || 
        (searchQuery.orderByClause != null && !Array.isArray(searchQuery.orderByClause))){
        return { valid: false, message: "invalid orderByClause" };
    }
    if (Array.isArray(searchQuery.orderByClause)){
        if (searchQuery.orderByClause.length === 0) return { valid: false, message: "empty orderByClause" };
        let mappedOrderByClauses = [];
        for (const clause of searchQuery.orderByClause){
            const validation = validateOrderByClause(clause, references, searchQuery.fields);
            if (!validation.valid) return validation;
            mappedOrderByClauses.push({ ...clause, type: validation.type });
        }
        searchQuery = { ...searchQuery, orderByClause: mappedOrderByClauses };
    }
    console.log(searchQuery);
    return { valid: true, searchQuery: searchQuery };
}

// validate the existence of the table
function validateTableExistence(tableName, dbReferences) {
    try {
        const tableNames = dbReferences.map(reference => reference.table);
        if (tableNames.includes(tableName)){
            return { valid: true };
        }
        else{
            return { valid: false, message: `Table does not exist` };
        }
    } catch (error) {
        return { valid: false, message: `enable to validate table` };
    }
}

// validate the fields of the query (references are from this table specifically)
function validateField(field, references) {
    if (!'target' in field || !'specification' in field || !'as' in field){
        return { valid: false, message: "invalid query fields" };
    }
    const validations = [validateName(field.target), validateName(field.specification), validateString(field.as)];
    if (validations.some(validation => !validation.valid)){
        return { valid: false, message: "invalid query fields" };
    }

    // Using a for...of loop instead of forEach
    for (const ref of references) {
        if (ref.column === field.target){
            return { valid: true, type: ref.type };
        }
    }
    return { valid: false, message: "invalid query fields" };
}

// validate the nester whereclause:
function validateWhereClause(whereClause, references) {
    const keys = Object.keys(whereClause);

    // on operator level
    if (keys.length == 1 && (keys[0] == "AND" || keys[0] == "OR")) {
        const operator = keys[0];
        const clauses = whereClause[operator];
        const validatedClauses = clauses.map(clause => validateWhereClause(clause, references));
        if (validatedClauses.every(clause => clause !== null)) {
            return { [operator]: validatedClauses };
        }
        return null;
    }
    // if clause on the comparison level
    else if (Array.isArray(whereClause)) {
        const validatedClauses = whereClause.map(clause => validateWhereClause(clause, references));
        if (validatedClauses.every(clause => clause !== null)) {
            return validatedClauses;
        }
        return null;
    }
    // single clause iteration level
    else if (typeof whereClause == "object" &&
        'target' in whereClause &&
        'operator' in whereClause &&
        'keyword' in whereClause) {
        const validation = validateSingleWhereClause(whereClause, references);
        if (validation.valid) {
            return { ...whereClause, type: validation.type };
        }
        return null;
    }
    else {
        return null;
    }
}

// validate single where clause:
function validateSingleWhereClause(whereClause, references) {
    // validate the existence of the key properties
    const { target, operator, keyword } = whereClause;
    if (!target || !operator || !keyword) return { valid: false , message: "invalid whereClause" };

    // attaching the type refrences and validate the search keywords:
    const type = references.find(reference => reference.column == target).type;
    if (!type) return { valid: false, message: "invalid whereClause" };

    // operater must be a string (and valid)
    const operatorValidation = validateName(operator);
    if (!operatorValidation.valid) return { valid: false, message: "invalid operator" };
    const mappedOperator = mapOperator(operator);
    if (mappedOperator == "") return { valid: false, message: "invalid operator" };

    // if the type is string, validate the keyword and oeprator
    if (type.includes("character") || type == "uuid" || type == "USER-DEFINED" || type == "ARRAY") {
        const stringValidation = validateName(keyword);
        if (!stringValidation.valid) return { valid: false, message: "invalid keyword" };
        if (operator != "eq" && operator != "ne") return { valid: false, message: "invalid operator" };
    }

    // allwoing inputs of both quantity & quantity units (inclusion of units must have a operator equals to eq)
    if (type == "numeric" || type == "integer") {
        if (!unicodeRegex.test(keyword.toString().replace(".", ""))) {
            return { valid: false, message: "invalid integer keyword" };
        }
        if (!(/^[1-9]/.test(keyword))) { // if the numerical search does not begin with a valid positive number, it is invalid
            return { valid: false, message: "invalid integer keyword" };
        }
    }

    // allowing inputs of time comparisons:
    if (type.includes("timestamp")) {
        const timeValidation = validateTransactionDate(keyword);
        if (!timeValidation.valid) return { valid: false, message: "invalid timestamp keyword" };
    }
    return { valid: true, type: type };
}

// function used to validate single group by clause:
function validateGroupByClause(clause, references, fields){
    
    // validate user specific inputs:
    if (!'target' in clause || !'specification' in clause) {
        return { valid: false, message: "invalid group by clause" };
    }
    const { target, specification } = clause;
    const validations = [validateName(target), validateName(specification)];
    if (validations.some(validation => !validation.valid)) {
        return { valid: false, message: "invalid group by clause" };
    }
    const fValidation = validateFunctions(specification);
    if (!fValidation.valid) return { valid: false, message: "invalid group by function" };

    // validating the group by clauses available:
    const matchedDefault = references.find(reference => reference.column == target);
    const isDefaultReference = matchedDefault? matchedDefault.type: null;

    // validating the group
    if (!isDefaultReference) return { valid: false, message: "invalid group by clause" };
    return { valid: true, type: isDefaultReference};
}

// function used to validate single order by clause:
function validateOrderByClause(clause, references, fields){

    // validate user specific inputs:
    if (!'target' in clause || !'specification' in clause || !'order' in clause) {
        return { valid: false, message: "invalid order by clause" };
    }
    const { target, specification, order } = clause;
    const validations = [validateName(target), validateName(specification), validateName(order)];
    if (validations.some(validation => !validation.valid)) {
        return { valid: false, message: "invalid order by clause" };
    }
    const fValidation = validateFunctions(specification);
    if (!fValidation.valid) return { valid: false, message: "invalid order by clause" };
    if (order != "ASC" && order != "DESC") return { valid: false, message: "invalid order by clause" };

    // validating the group by clauses available:
    const matchedDefault = references.find(reference => reference.column == target);
    const isDefaultReference = matchedDefault? matchedDefault.type: null;

    // validating the group
    if (!isDefaultReference) return { valid: false, message: "invalid group by clause" };
    return { valid: true, type: isDefaultReference};
}


/*
 * ==============================================================================
 * Tookit for validing API edpoint inputs
 * ==============================================================================
*/

function validateToken(token) {
    if (typeof token !== "string") return { valid: false, message: "invalid token" };
    if (!validator.isLength(token, { min: config.limitations.Min_Token_Length, max: config.limitations.Max_Token_Length })) return { valid: false, message: "invalid token" };
    return { valid: true };
}

function validateName(name) {
    if (!name ||
        typeof name !== "string" ||
        !unicodeRegex.test(name) ||
        !validator.isLength(name, { min: config.limitations.Min_Name_Length, max: config.limitations.Max_Name_Length })) {
        return ({ valid: false, message: 'Invalid name provided' });
    }
    return { valid: true };
}

// Acceptable for null inputs
function validateString(string) {
    if (string) {
        if (typeof string !== "string") {
            return ({ valid: false, message: 'Invalid string provided' });
        }
        if (!unicodeRegex.test(string) ||
            !validator.isLength(string, { min: config.limitations.Min_Name_Length, max: config.limitations.Max_Name_Length })) {
            return ({ valid: false, message: 'Invalid string provided' });
        }
    }
    return { valid: true };
}

function validateUserName(username) {
    if (typeof username !== "string") {
        return { valid: false, message: 'Invalid username' };
    }
    if (!validator.isLength(username, { min: config.limitations.Min_Username_Length, max: config.limitations.Max_Username_Length })) {
        return { valid: false, message: 'Invalid username' };
    }
    return { valid: true };
}

function validatePassword(password) {
    if (typeof password !== "string") {
        return { valid: false, message: 'Invalid password' };
    }
    if (!validator.isLength(password, { min: config.limitations.Min_Password_Length, max: config.limitations.Max_Password_Length })) {
        return { valid: false, message: 'Invalid password' };
    }

    // Check if the password contains at least 3 digits
    const digits = password.match(/\d/g);
    if (!digits || digits.length < 3) {
        return { valid: false, message: 'Password must contain at least 3 digits' };
    }

    // Check if the password contains at least 3 letters
    const letters = password.match(/[a-zA-Z]/g);
    if (!letters || letters.length < 3) {
        return { valid: false, message: 'Password must contain at least 3 letters' };
    }

    // Check if the password contains at least 1 uppercase letter
    const uppercase = password.match(/[A-Z]/g);
    if (!uppercase || uppercase.length < 1) {
        return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
    }

    // Check if the password contains at least 1 special character
    const specialCharacters = password.match(/[^a-zA-Z0-9]/g);
    if (!specialCharacters || specialCharacters.length < 1) {
        return { valid: false, message: 'Password must contain at least 1 special character' };
    }
    return { valid: true };
}

function validateEmail(email) {
    if (email) {
        if (typeof email !== "string") {
            return ({ valid: false, message: 'Invalid email' });
        }
        if (!validator.isEmail(email) ||
            !validator.isLength(email, { min: config.limitations.Min_Email_Length, max: config.limitations.Max_Email_Length })) {
            return ({ valid: false, message: 'Invalid email' });
        }
    }
    return { valid: true };
}

function validatePhone(phone) {
    if (phone) {
        if (typeof phone !== "string") {
            return ({ valid: false, message: 'Invalid phone number' });
        }
        if (!validator.isLength(phone, { min: config.limitations.Min_Phone_Length, max: config.limitations.Max_Phone_Length })) {
            return ({ valid: false, message: 'Invalid phone number' });
        }
        // if it does not satisfy both landline or mobile, it is invalid
        const isNotMobile = !validator.isMobilePhone(phone, "any");
        const isNotLandLine = !(/^[0-9]{2,4}-[0-9]{6,8}$/).test(phone);
        if (isNotMobile && isNotLandLine) {
            return ({ valid: false, message: 'Invalid phone number' });
        }
    }
    return { valid: true };
}

function validateTaxNumber(taxNumber) {
    if (taxNumber) {
        if (typeof taxNumber !== "string") {
            return ({ valid: false, message: 'Invalid tax number' });
        }
        if (!validator.isLength(taxNumber, { min: config.limitations.Min_Tax_Length, max: config.limitations.Max_Tax_Length }) ||
            !validator.isAlphanumeric(taxNumber.replaceAll(' ', ''))) {
            return ({ valid: false, message: 'Invalid tax number' });
        }
    }
    return { valid: true };
}

function validateSocialContacts(contacts, target) {
    if (contacts) {
        if (typeof contacts !== "string") {
            return { valid: false, message: `invalid ${target} contact` };
        }
        if (!validator.isLength(contacts, { min: config.limitations.Min_Social_Contact_Length, max: config.limitations.Max_Social_Contact_Length })) {
            return { valid: false, message: `invalid ${target} contact` };
        }
        if (target == "qq") {
            // must be numbers with an email suffice
            const qqRegex = /^[1-9][0-9]*$/;
            const accountid = contacts.replace(/@qq\.com/g, '').replace(/@foxmail\.com/g, '');
            if (!qqRegex.test(accountid)) {
                return { valid: false, message: `invalid ${target} contact` };
            }
            if (accountid.length < config.limitations.Min_Social_Contact_Length){
                return { valid: false, message: `invalid ${target} contact` };
            }
        }
        if (target == "wechat") {
            // must start with a letter, allows to contain contain letters, numbers, underscores, and hyphens
            const weChatRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
            if (!weChatRegex.test(contacts)) {
                return { valid: false, message: `invalid ${target} contact` };
            }
        }
    }
    return { valid: true };
}

function validateGenericID(id, target) {
    if (!id) {
        return { valid: false, message: `invalid ${target} ID` };
    }
    if (typeof id !== "string") {
        return { valid: false, message: `invalid ${target} ID` };
    }
    if (!validator.isUUID(id)) {
        return { valid: false, message: `invalid ${target} ID` };
    }
    return { valid: true };
}

function validateDescriptions(descriptions) {
    if (descriptions) {
        if (typeof descriptions !== "string") {
            return { valid: false, message: 'Invalid descriptions' };
        }
        if (!validator.isLength(descriptions, { min: config.limitations.Min_Descriptions_Length, max: config.limitations.Max_Descriptions_Length }) ||
            !unicodeRegex.test(descriptions)) {
            return { valid: false, message: 'Invalid descriptions' };
        }
    }
    return { valid: true };
}

//validate integer values
function validateInteger(value, target) {
    if (value || value == 0) {
        // Check if the value is of type 'number'
        if (typeof value !== "number" || !Number.isInteger(value)) {
            return { valid: false, message: `invalid ${target}` };
        }

        // assuming positive inputs
        if (value <= 0) return { valid: false, message: `invalid ${target}` };

        // Check if the integer is within the range of 1 to 10 digits
        const regex = /^\d{1,10}$/;
        if (!regex.test(value.toString())) {
            return { valid: false, message: `invalid ${target}` };
        }
    }
    return { valid: true };
}

// function used to validate numeric float values (10 digits with 2 digits behind decimals)
function validateNumeric(value, target) {
    if (value || value == 0) {
        // validate whether the value is a number
        if (typeof value !== "number") {
            return { valid: false, message: `invalid ${target}` };
        }
        if (value <= 0) return { valid: false, message: `invalid ${target}` }; 
        const regex = /^\d{1,10}(\.\d{1,2})?$/;
        if (!regex.test(value.toString())) {
            return { valid: false, message: `invalid ${target}` };
        }
    }
    return { valid: true };
}

function validateTransactionStatus(status) {
    if (typeof status !== "string") {
        return { valid: false, message: 'Invalid Transaction Status' };
    }
    if (!status || !validator.isAlpha(status)) {
        return { valid: false, message: 'Invalid Transaction Status' };
    }
    if (status !== "created" && status !== "quoted" && status !== "invoiced" && status !== "paid") {
        return { valid: false, message: 'Invalid Transaction Status' };
    }
    return { valid: true };
}

function validateTransactionDate(date){
    if (date) {
        if (typeof date !== "string") {
            return { valid: false, message: 'Invalid Transaction Date' };
        }
        if (!validator.isISO8601(date)) {
            return { valid: false, message: 'Invalid Transaction Date' };
        }
        // Check if the date includes timezone information
        if (!date.endsWith('Z') && !date.match(/[+-]\d{2}:\d{2}$/)) {
            return { valid: false, message: 'Transaction Date must include timezone information' };
        }
        try {
            const transactionDate = new Date(date);
            const currentUTCDate = new Date().toISOString();
            if (transactionDate > new Date(currentUTCDate)) {
                return { valid: false, message: 'Transaction Date must be in the past' };
            }
        }
        catch (error) {
            console.error(error);
            return { valid: false, message: 'Invalid Transaction Date' };
        }
    }
    return { valid: true };
}

function validatePricingThreshold(quantity, quantity_unit, size, size_unit, threshold) {
    // if numeric limitations are specified, then threshold operator should be there
    if (quantity || size) {

        // cannot post two numeric conditions at the same time:
        if (quantity && size) return { valid: false, message: 'Invalid Pricing Threshold' };

        // numeric validations on quantity and size
        const numericValidations = [validateInteger(quantity, 'quantity'), validateNumeric(size, 'size')];
        if (numericValidations.some((validation) => !validation.valid)) {
            return { valid: false, message: 'Invalid Pricing Threshold' };
        }
        if (quantity && quantity <= 0) return { valid: false, message: "Invalid Pricing Quantity" };
        if (size && size <= 0) return { valid: false, message: "Invalid Pricing Size" };

        // validate the threshold operator
        if (!threshold || typeof threshold !== "string") return { valid: false, message: 'Invalid Pricing Threshold' };
        if (!validator.isAlpha(threshold)) return { valid: false, message: 'Invalid Pricing Threshold' };
        if (threshold !== "eq" && threshold !== "gt" && threshold !== "ge" && threshold !== "lt" && threshold !== "le") {
            return { valid: false, message: 'Invalid Pricing Threshold' };
        }

        // validate unit
        if (size) {
            const stringValidation = validateName(size_unit);
            if (!stringValidation.valid) return { valid: false, message: 'Invalid Pricing Threshold' };
        }
        if (quantity) {
            const stringValidation = validateName(quantity_unit);
            if (!stringValidation.valid) return { valid: false, message: 'Invalid Pricing Threshold' };
        }
    }
    if (threshold && !quantity && !size) return { valid: false, message: 'Invalid Pricing Threshold for size or quantity' };
    if (quantity_unit && !quantity) return { valid: false, message: "Invalid Pricing Quantity" };
    if (size_unit && !size) return { valid: false, message: "Invalid Pricing Size" };
    return { valid: true };
}
function validateFunctions(specification) {
    const functionList = [
        "default",
        // Aggregate Functions
        "SUM", "AVG", "COUNT", "MAX", "MIN",
        // String Functions
        "CONCAT", "SUBSTRING", "LOWER", "UPPER", "TRIM", "LENGTH",
        // Date Functions
        "DATE", "YEAR", "MONTH", "DAY", 
        // Numeric Functions
        "ABS", "ROUND", "FLOOR", "CEILING",
        // Conditional Functions
        "COALESCE", "NULLIF", "CASE",
        // Type Conversion
        "CAST",
        // Window Functions
        "ROW_NUMBER", "RANK", "DENSE_RANK", "LEAD", "LAG",
        // Other Common Functions
        "DISTINCT", "GROUP_CONCAT"
    ];
    if (!functionList.includes(specification)) 
        return { valid: false, message: 'Invalid Function' };
    
    return { valid: true };
}

/*
 * ==============================================================================
 * Tookit for Asynchronous validation procedure
 * ==============================================================================
*/
async function validateEmployeePosition(position, db) {
    if (position) {
        try {
            // validating id
            if (!validator.isUUID(position)) {
                return { valid: false, message: 'Invalid ID of Position ID' };
            }
            // validating instance
            const positionRecord = await db.oneOrNone('SELECT * FROM public.positions WHERE id = $1', [position]);
            if (!positionRecord) {
                return { valid: false, message: 'Invalid ID of Position ID' };
            }
        }
        catch (error) {
            return { valid: false, message: 'Invalid ID of Position ID' };
        }
    }
    return { valid: true };
}

//generic validation function for the existence of a list of instance id
async function validateInstances(instances, owner, target, db) {
    if (Array.isArray(instances) && instances.length > 0) {
        // validate whether all attachments are UUIDs
        const uuidValidations = instances.map((id) => validateGenericID(id, target));
        if (uuidValidations.some((validation) => !validation.valid)) {
            return { valid: false, message: `invalid ${target}` };
        }

        // validate whether all attachments exist in the database
        try {
            const existingRecords = await Promise.all(instances.map((id) =>
                db.oneOrNone(`SELECT id FROM public.${target} WHERE id = $1 AND created_by = $2`, [id, owner])));
            if (existingRecords.some((record) => !record)) {
                return { valid: false, message: `invalid ${target}` };
            }
        }
        catch (error) {
            return { valid: false, message: `invalid ${target}` };
        }
    }
    if (instances && !Array.isArray(instances)) return { valid: false, message: `invalid ${target}` };
    return { valid: true };
}

// Function to validate an array of addresses
async function validateAddresses(addresses, owner, id, target, db, req) {
    if (addresses) {
        if (!Array.isArray(addresses)) return { valid: false, message: 'Invalid Format of Address information' };
        if (addresses.length === 0) return { valid: true }; // allow empty array
        for (let address of addresses) {
            if (!address || !address.street || !address.city || !address.state || !address.country ||
                !address.postal || !address.category || !address.id || !address.message) {
                return { valid: false, message: 'Incomplete Address information' };
            }
            if (typeof address.street !== "string" || typeof address.city !== "string" || typeof address.state !== "string" ||
                typeof address.country !== "string" || typeof address.postal !== "string" || !Array.isArray(address.category) ||
                typeof address.id !== "string" || typeof address.message !== "string") {
                return { valid: false, message: 'Invalid Format of Address information' };
            }
            if (!unicodeRegex.test(address.street.replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '')) ||
                !unicodeRegex.test(address.city.replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '')) ||
                !unicodeRegex.test(address.state.replace(/ /g, '')) ||
                !unicodeRegex.test(address.country.replace(/ /g, '')) ||
                !unicodeRegex.test(address.postal.replace(/ /g, '')) ||
                !(address.message === "add" || address.message === "update" || address.message === "delete")) {
                return { valid: false, message: 'Invalid Format of Address information' };
            }
            if (!validator.isLength(address.street, { min: config.limitations.Min_Street_Length, max: config.limitations.Max_Street_Length }) ||
                !validator.isLength(address.city, { min: config.limitations.Min_City_Length, max: config.limitations.Max_City_Length }) ||
                !validator.isLength(address.state, { min: config.limitations.Min_State_Length, max: config.limitations.Max_State_Length }) ||
                !validator.isLength(address.country, { min: config.limitations.Min_Country_Length, max: config.limitations.Max_Country_Length }) ||
                !validator.isLength(address.postal, { min: config.limitations.Min_Postal_Length, max: config.limitations.Max_Postal_Length })) {
                return { valid: false, message: 'Invalid Length of Address information' };
            }
            // Validate existing address updates
            if (address.message !== "add" && req.method !== "POST") {
                const idValidation = validateGenericID(address.id, "address");
                if (!idValidation.valid) return { valid: false, message: 'Invalid Address ID' };
                try {
                    // postgresql does not allow placeholders for column name itselfs, so use dynamic string instead
                    const existingAddress = await db.oneOrNone(`SELECT * FROM public.addresses WHERE id = $1 AND created_by = $2 AND ${target} = $3`,
                        [address.id, owner, id]);
                    if (!existingAddress) {
                        return { valid: false, message: 'Invalid ID of Address information' };
                    }
                }
                catch (error) {
                    return { valid: false, message: 'Invalid ID of Address information' };
                }
            }
            // Validate address categories
            if (address.category.length === 0 || address.category.length > config.limitations.MAX_ADDRESS_CATEGORY_LENGTH) {
                return { valid: false, message: 'Invalid Address Category' };
            }
            for (let category of address.category) {
                if (category !== "mail" && category !== "bill" && category !== "delivery&install") {
                    return { valid: false, message: 'Invalid Address Category' };
                }
            }
        }
    }
    return { valid: true };
}

async function validateClients(clients, owner, db) {
    if (clients && clients.length > 0) {
        for (const client of clients) {
            if (!client || !client.id || typeof client.message !== "string" ||
                (client.message !== "add" && client.message !== "delete")) {
                return { valid: false, message: 'Incomplete Client information' };
            }

            // validate the existing client
            const idValidation = validateGenericID(client.id, "client");
            if (!idValidation.valid) return { valid: false, message: 'Invalid Client ID' };

            try {
                const existingClient = await db.oneOrNone(
                    'SELECT * FROM public.clients WHERE id = $1::UUID AND created_by = $2',
                    [client.id, owner]
                );
                if (!existingClient) {
                    return { valid: false, message: 'Invalid Client ID' };
                }
            }
            catch (error) {
                return { valid: false, message: 'Invalid Client ID' };
            }
        }
    }
    return { valid: true };
}

module.exports = {
    validateAndPreProcessQuery,
    validateAddresses,
    validateEmail,
    validateName,
    validatePhone,
    validateTaxNumber,
    validateGenericID,
    validateSocialContacts,
    validateClients,
    validateEmployeePosition,
    validateUserName,
    validatePassword,
    validateDescriptions,
    validateNumeric,
    validateInteger,
    validateTransactionStatus,
    validateTransactionDate,
    validateInstances,
    validateString,
    validatePricingThreshold,
    validateTableExistence,
    validateToken
};
