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
            if (address.message !== "add" && req.method !== "POST") {
                // Validate existing address updates
                try{
                    // postgresql does not allow placeholders for column name itselfs, so use dynamic string instead
                    const existingAddress = await db.oneOrNone(`SELECT * FROM public.addresses WHERE id = $1 AND created_by = $2 AND ${target} = $3`,
                        [address.id, owner, id]);
                    if (!existingAddress) {
                        return { valid: false, message: 'Invalid ID of Address information' };
                    }
                }
                catch(err){
                    return { valid: false, message: 'Invalid ID of Address information' };
                }
            }
            // Validate address categories
            if (address.category.length === 0){
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
        for (client of clients) {
            if (!client || !client.id || (client.message !== "add" && client.message !== "delete" && client.message !== "update")) {
                return { valid: false, message: 'Incomplete Client information' };
            }
            // validate the existing client - for both associated with a company & not associated
            if (client.message !== "add") {
                try{
                    const existingClient = await db.oneOrNone(
                        'SELECT * FROM public.clients WHERE id = $1 AND created_by = $2',
                        [client.id, owner]
                    );
                    if (!existingClient) {
                        return { valid: false, message: 'Invalid Client ID' };
                    }
                }
                catch(err){
                    return { valid: false, message: 'Invalid Client ID' };
                }
            }
        }
    }
    return { valid: true };
}

function validateName(name){
    if (!name ||
        !unicodeRegex.test(name) ||
        !validator.isLength(name, { min: config.limitations.Min_Name_Length, max: config.limitations.Max_Name_Length })) {
        return ({ valid: false, message: 'Invalid name provided' });
    }
    return { valid: true };
}

function validatePassword(password){
    if (!validator.isLength(password, { min: config.limitations.Min_Password_Length, max: config.limitations.Max_Password_Length })) {
        return { valid: false, message: 'Invalid password' };
    }
    return { valid: true };
}

function validateEmail(email){
    if (email){
        if (!validator.isEmail(email) ||
        !validator.isLength(email, { min: config.limitations.Min_Email_Length, max: config.limitations.Max_Email_Length })) {
        return ({ valid: false, message: 'Invalid email' });
    }
    }
    return { valid: true };
}

function validatePhone(phone){
    if (phone){
        if (!validator.isLength(phone, { min: config.limitations.Min_Phone_Length, max: config.limitations.Max_Phone_Length }) ||
            !validator.isNumeric(phone.replaceAll('+', ''))) {
            return ({ valid: false, message: 'Invalid phone number' });
        }
    }
    return { valid: true };
}

function validateTaxNumber(taxNumber){
    if (taxNumber){
        if (!validator.isLength(taxNumber, { min: config.limitations.Min_Tax_Length, max: config.limitations.Max_Tax_Length }) ||
        !validator.isAlphanumeric(taxNumber.replaceAll(' ', ''))) {
        return ({ valid: false, message: 'Invalid tax number' });
    }
    }
    return { valid: true };
}

function validateSocialContacts(contacts, target){
    if (contacts){
        if (!validator.isLength(contacts, { min: config.limitations.Min_Social_Contact_Length, max: config.limitations.Max_Social_Contact_Length })) {
            return { valid: false, message: `invalid ${target} contact` };
        }
    }
    return { valid: true };
}

function validateGenericID(id, target){
    if (!id) {
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
    try{
        const positionRecord = await db.oneOrNone('SELECT * FROM public.positions WHERE id = $1', [position]);
        if (!positionRecord) {
            return { valid: false, message: 'Invalid ID of Position ID' };
        }
    }
    catch(err){
        return { valid: false, message: 'Invalid ID of Position ID' };
    }
    return { valid: true };
}

function validateDescriptions(descriptions){
    if (descriptions){
        if (!validator.isLength(descriptions, { min: config.limitations.Min_Descriptions_Length, max: config.limitations.Max_Descriptions_Length }) ||
            !unicodeRegex.test(descriptions)) {
            return { valid: false, message: 'Invalid descriptions' };
        }
    }
    return { valid: true };
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
    validateDescriptions
};
