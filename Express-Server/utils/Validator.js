require('dotenv').config();
const validator = require('validator');
const { getConfiguration } = require('./Configurator');
const config = getConfiguration();
const unicodeRegex = /^[\p{L}\p{N}\p{P}\s]+$/u; // Regular expression to check for Unicode letters, numbers, and spaces

// Function to validate an array of addresses
async function validateAddresses(addresses, owner, id, target, db, req) {
    if (addresses && addresses.length > 0) {
        for (let address of addresses) {
            if (!address || !address.street || !address.city || !address.state || !address.country ||
                !address.postal || !address.category || !address.id || !address.message) {
                return { valid: false, message: 'Incomplete Address information' };
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
                    console.error(error);
                    return { valid: false, message: 'Invalid ID of Address information' };
                }
            }
            // Validate address categories
            if (address.category.length === 0) {
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
            if (!client || !client.id ||
                (client.message !== "add" && client.message !== "delete" && client.message !== "update")) {
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
                console.error(error);
                return { valid: false, message: 'Invalid Client ID' };
            }
        }
    }
    return { valid: true };
}

function validateName(name) {
    if (!name ||
        !unicodeRegex.test(name) ||
        !validator.isLength(name, { min: config.limitations.Min_Name_Length, max: config.limitations.Max_Name_Length })) {
        return ({ valid: false, message: 'Invalid name provided' });
    }
    return { valid: true };
}

// Acceptable for null inputs
function validateString(string) {
    if (string) {
        if (!unicodeRegex.test(string) ||
            !validator.isLength(string, { min: config.limitations.Min_String_Length, max: config.limitations.Max_String_Length })) {
            return ({ valid: false, message: 'Invalid string provided' });
        }
    }
    return { valid: true };
}
function validatePassword(password) {
    if (!validator.isLength(password, { min: config.limitations.Min_Password_Length, max: config.limitations.Max_Password_Length })) {
        return { valid: false, message: 'Invalid password' };
    }
    return { valid: true };
}

function validateEmail(email) {
    if (email) {
        if (!validator.isEmail(email) ||
            !validator.isLength(email, { min: config.limitations.Min_Email_Length, max: config.limitations.Max_Email_Length })) {
            return ({ valid: false, message: 'Invalid email' });
        }
    }
    return { valid: true };
}

function validatePhone(phone) {
    if (phone) {
        if (!validator.isLength(phone, { min: config.limitations.Min_Phone_Length, max: config.limitations.Max_Phone_Length }) ||
            !validator.isNumeric(phone.replaceAll('+', ''))) {
            return ({ valid: false, message: 'Invalid phone number' });
        }
    }
    return { valid: true };
}

function validateTaxNumber(taxNumber) {
    if (taxNumber) {
        if (!validator.isLength(taxNumber, { min: config.limitations.Min_Tax_Length, max: config.limitations.Max_Tax_Length }) ||
            !validator.isAlphanumeric(taxNumber.replaceAll(' ', ''))) {
            return ({ valid: false, message: 'Invalid tax number' });
        }
    }
    return { valid: true };
}

function validateSocialContacts(contacts, target) {
    if (contacts) {
        if (!validator.isLength(contacts, { min: config.limitations.Min_Social_Contact_Length, max: config.limitations.Max_Social_Contact_Length })) {
            return { valid: false, message: `invalid ${target} contact` };
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

async function validateEmployeePosition(position, db) {
    if (!position || !validator.isUUID(position)) {
        return { valid: false, message: 'Invalid ID of Position ID' };
    }
    try {
        const positionRecord = await db.oneOrNone('SELECT * FROM public.positions WHERE id = $1', [position]);
        if (!positionRecord) {
            return { valid: false, message: 'Invalid ID of Position ID' };
        }
    }
    catch (error) {
        console.error(error);
        return { valid: false, message: 'Invalid ID of Position ID' };
    }
    return { valid: true };
}

function validateDescriptions(descriptions) {
    if (descriptions) {
        if (!validator.isLength(descriptions, { min: config.limitations.Min_Descriptions_Length, max: config.limitations.Max_Descriptions_Length }) ||
            !unicodeRegex.test(descriptions)) {
            return { valid: false, message: 'Invalid descriptions' };
        }
    }
    return { valid: true };
}

function validateNumeric(value, target) {
    if (value) {
        // validate whether the value is a number
        if (typeof value !== "number") {
            return { valid: false, message: `invalid ${target}` };
        }
        const regex = /^\d{1,10}(\.\d+)?$/;
        if (!regex.test(value.toString())) {
            return { valid: false, message: `invalid ${target}` };
        }
    }
    return { valid: true };
}

function validateTransactionStatus(status) {
    if (!status || !validator.isAlpha(status)) {
        return { valid: false, message: 'Invalid Transaction Status' };
    }
    if (status !== "created" && status !== "quoted" && status !== "invoiced" && status !== "paid") {
        return { valid: false, message: 'Invalid Transaction Status' };
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
            console.error(error);
            return { valid: false, message: `invalid ${target}` };
        }
    }
    return { valid: true };
}

function validatePricingThreshold(quantity, size, en_unit, ch_unit, threshold) {
    // if numeric limitations are specified, then threshold operator should be there
    if (quantity || size) {

        // numeric validations on quantity and size
        const numericValidations = [validateNumeric(quantity, 'quantity'), validateNumeric(size, 'size')];
        if (numericValidations.some((validation) => !validation.valid)) {
            return { valid: false, message: 'Invalid Pricing Threshold' };
        }
        if (quantity && quantity <= 0) return { valid: false, message: "Invalid Pricing Threshold" };
        if (size && size <= 0) return { valid: false, message: "Invalid Pricing Threshold" };

        // validate the threshold operator
        if (!threshold) return { valid: false, message: 'Invalid Pricing Threshold' };
        if (!validator.isAlpha(threshold)) return { valid: false, message: 'Invalid Pricing Threshold' };
        if (threshold !== "eq" && threshold !== "gt" && threshold !== "ge" && threshold !== "lt" && threshold !== "le") {
            return { valid: false, message: 'Invalid Pricing Threshold' };
        }

        // validate units
        if (size) {
            const stringValidations = [validateName(en_unit), validateName(ch_unit)];
            if (stringValidations.some((validation) => !validation.valid)) {
                return { valid: false, message: 'Invalid Pricing Threshold' };
            }
        }
    }
    return { valid: true };
}

async function validateTableExistence(tableName, db) {
    try {
        const result = await db.one(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = $1
            );
        `, [tableName]);
        if (!result.exists) {
            return { valid: false, message: `Table does not exist` };
        }
        return { valid: true };
    } catch (error) {
        console.error('Error checking table existence:', error);
        return { valid: false, message: `Table does not exist` };
    }
}

module.exports = {
    validateAddresses,
    validateEmail,
    validateName,
    validatePhone,
    validateTaxNumber,
    validateGenericID,
    validateSocialContacts,
    validateClients,
    validateEmployeePosition,
    validatePassword,
    validateDescriptions,
    validateNumeric,
    validateTransactionStatus,
    validateInstances,
    validateString,
    validatePricingThreshold,
    validateTableExistence
};
