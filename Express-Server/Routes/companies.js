require("dotenv").config();
const express = require('express');
const router = express.Router();
const { validateAddresses,
        validateEmail,
        validateName,
        validatePhone,
        validateTaxNumber,
        validateClients,
        validateInstances
    } = require ('../utils/Validator');

module.exports = (db) => {
    router.route("/")
        // route on getting all the companies created by the user
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const companies 
                = await db.any('SELECT id, full_name, email, phone FROM public.companies WHERE created_by = $1 ORDER BY full_name ASC'
                    , [owner]);
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
                const company = await db.oneOrNone(`
                    SELECT co.id, co.full_name, co.email, co.phone, co.tax_number,
                    CASE WHEN (SELECT count(id) FROM public.addresses WHERE company = co.id) = 0 THEN NULL 
                            ELSE (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', a.id, 
                                        'street', a.street_address, 
                                        'city', a.city, 
                                        'state', a.state, 
                                        'country', a.country, 
                                        'postal', a.postal_code, 
                                        'category', a.category
                                    )
                                )
                                FROM public.addresses a
                                WHERE a.company = co.id
                            )
                    END AS addresses,
                    CASE WHEN (SELECT count(id) FROM public.clients WHERE company = co.id) = 0 THEN NULL 
                            ELSE (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', c.id, 
                                        'full_name', c.full_name
                                    )
                                )
                                FROM public.clients c
                                WHERE c.company = co.id
                            )
                    END AS clients
                    FROM public.companies as co
                    WHERE id = $1 AND created_by = $2
                    `, [id, owner]);
                return res.status(200).json({ company: company });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ company: null , message: "failed to fetch company" });
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
                                await transaction.none('INSERT INTO public.addresses (street_address, city, state, country, postal_code, category, created_by, company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                                    [address.street, address.city, address.state, address.country, address.postal, address.category, owner, id]);
                            }
                            else if (address.message === "delete") {
                                await transaction.none('DELETE FROM public.addresses WHERE id = $1 AND created_by = $2 AND company = $3', [address.id, owner, id]);
                            }
                            else {
                                await transaction.none('UPDATE public.addresses SET street_address = $1, city = $2, state = $3, country = $4, postal_code = $5, category = $6 WHERE id = $7 AND created_by = $8 AND company = $9',
                                    [address.street, address.city, address.state, address.country, address.postal, address.category, address.id, owner, id]);
                            }
                        }
                    }
                    // Attach the clients to the company or remove it accoringly
                    if (clients && clients.length > 0) {
                        for (client of clients) {
                            if (client.message === "add") {
                                await transaction.none('UPDATE public.clients SET company = $1 WHERE id = $2 AND created_by = $3', [id, client.id, owner]);
                            }
                            else {
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
                    await transaction.none('DELETE FROM public.transactions WHERE company = $1 AND created_by = $2', [id, owner]);
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
        // validate company id
        const owner = req.sessionEmail;
        if (id !== "new") {
            const existenceValidation = await validateInstances([id], owner, "companies", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
        }

        // Validation for company record updates and creations:
        if (req.method === "PUT" || req.method === "POST") {
            const { basic_info, addresses, clients } = req.body;

            // validate input of informations:
            if (!basic_info || !basic_info.full_name){
                return res.status(400).json({ message: 'Basic information are required' });
            }
            let validations = 
            [validateName(basic_info.full_name), 
                validateEmail(basic_info.email),
                validatePhone(basic_info.phone),
                validateTaxNumber(basic_info.tax_number),
                await validateAddresses(addresses, owner, id, "company", db, req),
                await validateClients(clients, owner, db)
            ];
            for (let validation of validations) {
                if (!validation.valid){
                    return res.status(400).json({ message: validation.message });
                };
            }
        }
        next();
    })
    return router;
}