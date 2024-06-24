require('dotenv').config();
const validator = require('validator');

// Function to validate an array of addresses
async function validateAddresses(addresses, owner, id, target, db, req) {
    if (addresses && addresses.length > 0) {
        for (let address of addresses) {
            if (!address || !address.street || !address.city || !address.state || !address.country ||
                !address.postal || !address.category || !address.id || !address.message) {
                return { valid: false, message: 'Incomplete Address information' };
            }
            if (!validator.isAlphanumeric(address.street.replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '')) ||
                !validator.isAlphanumeric(address.city.replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '')) ||
                !validator.isAlphanumeric(address.state.replace(/ /g, '')) ||
                !validator.isAlphanumeric(address.country.replace(/ /g, '')) ||
                !validator.isAlphanumeric(address.postal.replace(/ /g, '')) ||
                !(address.message === "add" || address.message === "update" || address.message === "delete")) {
                return { valid: false, message: 'Invalid Format of Address information' };
            }
            if (!validator.isLength(address.street, { min: process.env.Min_Street_Length, max: process.env.Max_Street_Length }) ||
                !validator.isLength(address.city, { min: process.env.Min_City_Length, max: process.env.Max_City_Length }) ||
                !validator.isLength(address.state, { min: process.env.Min_State_Length, max: process.env.Max_State_Length }) ||
                !validator.isLength(address.country, { min: process.env.Min_Country_Length, max: process.env.Max_Country_Length }) ||
                !validator.isLength(address.postal, { min: process.env.Min_Postal_Length, max: process.env.Max_Postal_Length })) {
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
        !validator.isAlphanumeric(name.replaceAll(' ', '')) ||
        !validator.isLength(name, { min: process.env.Min_Name_Length, max: process.env.Max_Name_Length })) {
        return ({ valid: false, message: 'Invalid name provided' });
    }
    return { valid: true };
}

function validateEmail(email){
    if (email){
        if (!validator.isEmail(email) ||
        !validator.isLength(email, { min: process.env.Min_Email_Length, max: process.env.Max_Email_Length })) {
        return ({ valid: false, message: 'Invalid email' });
    }
    }
    return { valid: true };
}

function validatePhone(phone){
    if (phone){
        if (!validator.isLength(phone, { min: process.env.Min_Phone_Length, max: process.env.Max_Phone_Length }) ||
            !validator.isNumeric(phone.replaceAll('+', ''))) {
            return ({ valid: false, message: 'Invalid phone number' });
        }
    }
    return { valid: true };
}

function validateTaxNumber(taxNumber){
    if (taxNumber){
        if (!validator.isLength(taxNumber, { min: process.env.Min_Tax_Length, max: process.env.Max_Tax_Length }) ||
        !validator.isAlphanumeric(taxNumber.replaceAll(' ', ''))) {
        return ({ valid: false, message: 'Invalid tax number' });
    }
    }
    return { valid: true };
}

function validateSocialContacts(contacts, target){
    if (contacts){
        if (!validator.isLength(contacts, { min: process.env.Min_Social_Contact_Length, max: process.env.Max_Social_Contact_Length })) {
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

module.exports = {
    validateAddresses,
    validateEmail,
    validateName,
    validatePhone,
    validateTaxNumber,
    validateGenericID,
    validateSocialContacts,
    validateClients
};
