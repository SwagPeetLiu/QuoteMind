require("dotenv").config();
const express = require('express');
const validator = require('validator');
const router = express.Router();

module.exports = (db) => {
    router.route("/")
        // route on getting all the companies created by the user
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const companies = await db.any('SELECT id, full_name, email, phone, tax_number FROM public.companies WHERE created_by = $1', [owner]);
                return res.status(200).json({ companies: companies });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ companies: null, message: "failed to fetch companies" });
            }
        });

    // route on operating for a signle company:
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const addressQuery = `
            SELECT id, street_address AS street, city, state, country, postal_code AS postal, category
            FROM public.addresses
            WHERE company = $1 AND created_by = $2`;
                const clientsQuery = `SELECT id, full_name AS name
            FROM public.clients
            WHERE company = $1 AND created_by = $2`;
                const address = db.any(addressQuery, [id, owner]);
                const clients = db.any(clientsQuery, [id, owner]);

                // execute quries conceurrently for better performance:
                const [addressResult, clientsResult] = await Promise.all([address, clients]);
                return res.status(200).json({ addresses: addressResult, clients: clientsResult });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ addresses: null, clients: null, message: "failed to fetch company" });
            }
        })

        // updating an existing company
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { basic_info, addresses, clients } = req.body;
            try {
                await db.tx(async transaction =>{
                    await transaction.none('UPDATE public.companies SET full_name = $1, email = $2, phone = $3, tax_number = $4 WHERE id = $5 AND created_by = $6',
                        [basic_info.full_name, basic_info.email, basic_info.phone, basic_info.tax_number, id, owner]);
    
                    // Attach the addresses to the company or remove it accoringly
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message === "add") {
                                console.log('Inserting new address:', address);
                                await transaction.none('INSERT INTO public.addresses (street_address, city, state, country, postal_code, category, created_by, company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                                    [address.street, address.city, address.state, address.country, address.postal, address.category, owner, id]);
                            }
                            else if (address.message === "delete") {
                                console.log('Deleting address:', address);
                                await transaction.none('DELETE FROM public.addresses WHERE id = $1 AND created_by = $2 AND company = $3', [address.id, owner, id]);
                            }
                            else {
                                console.log('Updating address:', address);
                                await transaction.none('UPDATE public.addresses SET street_address = $1, city = $2, state = $3, country = $4, postal_code = $5, category = $6 WHERE id = $7 AND created_by = $8 AND company = $9',
                                    [address.street, address.city, address.state, address.country, address.postal, address.category, address.id, owner, id]);
                            }
                        }
                    }
                    // Attach the clients to the company or remove it accoringly
                    if (clients && clients.length > 0) {
                        for (client of clients) {
                            if (client.message === "add") {
                                console.log('adding new client:', client);
                                await transaction.none('UPDATE public.clients SET company = $1 WHERE id = $2 AND created_by = $3', [id, client.id, owner]);
                            }
                            else {
                                console.log('removing existing client association:', client);
                                await transaction.none('UPDATE public.clients SET company = NULL WHERE id = $1 AND created_by = $2', [client.id, owner]);
                            }
                        }
                    }
                })
                return res.status(200).json({ message: 'Information Updated Successfully' });
            } catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        })
        // creating a new company record
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { basic_info, addresses, clients } = req.body;
            try{
                await db.tx(async transaction => {
                    const newCompany = await transaction.one(
                        'INSERT INTO public.companies (full_name, email, phone, tax_number, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                        [basic_info.full_name, basic_info.email, basic_info.phone, basic_info.tax_number, owner]
                    );
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message === "add") {
                                await transaction.none('INSERT INTO public.addresses (street_address, city, state, country, postal_code, category, created_by, company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                                    [address.street, address.city, address.state, address.country, address.postal, address.category, owner, newCompany.id]);
                            }
                        }
                    }
                    if (clients && clients.length > 0) { // assuming clients have been priorly created
                        for (client of clients) {
                            if (client.message === "add") {
                                await transaction.none('UPDATE public.clients SET company = $1 WHERE id = $2 AND created_by = $3', [newCompany.id, client.id, owner]);
                            }
                        }
                    }
                });
                return res.status(200).json({ message: 'Information Updated Successfully' });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        })
        // deleting an existing company
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                await db.tx(async transaction => {
                    await transaction.none('UPDATE public.clients SET company = NULL WHERE company = $1 AND created_by = $2', [id, owner]);
                    await transaction.none('DELETE FROM public.addresses WHERE company = $1 AND created_by = $2', [id, owner]);
                    await transaction.none('DELETE FROM public.companies WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: 'Information Updated Successfully' });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });

    // establish the middleware used for validate input of company ID:
    router.param("id", async (req, res, next, id) => {
        if (!validator.isAlphanumeric(id.replace(' ', ''))) {
            res.status(400).json({ message: "invalid company ID" });
        }
        if (!validator.isLength(id, { min: 1, max: process.env.Max_Generic_ID_Length })) {
            res.status(400).json({ message: "invalid company ID" });
        }
        const owner = req.sessionEmail;
        let existingCompany;
        if (req.method === "PUT" || req.method === "DELETE") {
            existingCompany = await db.oneOrNone('SELECT * FROM public.companies WHERE id = $1 AND created_by = $2', [id, owner]);
            if (!existingCompany) {
                return res.status(400).json({ message: 'Company does not exist' });
            }
        }

        // Validation for company record updates and creations:
        if (req.method === "PUT" || req.method === "POST") {
            const { basic_info, addresses, clients } = req.body;

            // validate basic info
            if (!basic_info || !basic_info.full_name) {
                return res.status(400).json({ message: 'Basic information are required' });
            }
            if (!validator.isAlphanumeric(basic_info.full_name.replaceAll(' ', '')) ||
                !validator.isLength(basic_info.full_name, { min: process.env.Min_Username_Length, max: process.env.Max_Username_Length })) {
                return res.status(400).json({ message: 'Invalid company name' });
            }
            if (basic_info.email) {
                if (!validator.isEmail(basic_info.email) ||
                    !validator.isLength(basic_info.email, { min: process.env.Min_Email_Length, max: process.env.Max_Email_Length })) {
                    return res.status(400).json({ message: 'Invalid email address' });
                }
            }
            if (basic_info.phone) {
                if (!validator.isLength(basic_info.phone, { min: process.env.Min_Phone_Length, max: process.env.Max_Phone_Length }) ||
                    !validator.isNumeric(basic_info.phone.replaceAll('+', ''))) {
                    return res.status(400).json({ message: 'Invalid phone number' });
                }
            }
            if (basic_info.tax_number) {
                if (!validator.isLength(basic_info.tax_number, { min: process.env.Min_Tax_Length, max: process.env.Max_Tax_Length }) ||
                    !validator.isAlphanumeric(basic_info.tax_number.replaceAll(' ', ''))) {
                    return res.status(400).json({ message: 'Invalid tax number' });
                }
            }
            // validate addresses
            if (addresses && addresses.length > 0) {
                for (address of addresses) {
                    if (!address || !address.street || !address.city || !address.state || !address.country ||
                        !address.postal || !address.category || !address.id || !address.message) {
                        return res.status(400).json({ message: 'Incomplete Address information' });
                    }
                    if (!validator.isAlphanumeric(address.street.replaceAll(' ', '')) ||
                        !validator.isAlphanumeric(address.city.replaceAll(' ', '')) ||
                        !validator.isAlphanumeric(address.state.replaceAll(' ', '')) ||
                        !validator.isAlphanumeric(address.country.replaceAll(' ', '')) ||
                        !validator.isAlphanumeric(address.postal.replaceAll(' ', '')) ||
                        (address.message !== "add" && address.message !== "update" && address.message !== "delete")) {
                        return res.status(400).json({ message: 'Invalid Format of Address information' });
                    }
                    if (!validator.isLength(address.street, { min: process.env.Min_Street_Length, max: process.env.Max_Street_Length }) ||
                        !validator.isLength(address.city, { min: process.env.Min_City_Length, max: process.env.Max_City_Length }) ||
                        !validator.isLength(address.state, { min: process.env.Min_State_Length, max: process.env.Max_State_Length }) ||
                        !validator.isLength(address.country, { min: process.env.Min_Country_Length, max: process.env.Max_Country_Length }) ||
                        !validator.isLength(address.postal, { min: process.env.Min_Postal_Length, max: process.env.Max_Postal_Length })) {
                        return res.status(400).json({ message: 'Invalid Length of Address information' });
                    }
                    if (address.message !== "add" && req.method !== "POST") { // validate the existing address updates
                        const existingAddress = await db.oneOrNone('SELECT * FROM public.addresses WHERE id = $1 AND created_by = $2 AND company = $3',
                            [address.id, owner, id]);
                        if (!existingAddress) {
                            return res.status(400).json({ message: 'Invalid ID of Address information' });
                        }
                    }
                    // Address should at least belong to one of the following categories:
                    if (address.category.length === 0) return res.status(400).json({ message: 'Invalid Address Category' });
                    for (category of address.category) {
                        if (category !== "mail" && category !== "bill" && category !== "delivery&install") {
                            return res.status(400).json({ message: 'Invalid Address Category' });
                        }
                    }
                }
            }

            // validate clients - all inputted clients should be already been resgistered
            if (clients && clients.length > 0) {
                for (client of clients) {
                    if (!client || !client.id || (client.message !== "add" && client.message !== "delete")) {
                        return res.status(400).json({ message: 'Incomplete Client information' });
                    }
                    // validate the existing client - for both associated with a company & not associated
                    const existingClient = await db.oneOrNone(
                        'SELECT * FROM public.clients WHERE id = $1 AND created_by = $2',
                        [client.id, owner]
                    );
                    if (!existingClient) {
                        return res.status(400).json({ message: 'Invalid Client information' });
                    }
                }
            }
        }
        next();
    })
    return router;
}