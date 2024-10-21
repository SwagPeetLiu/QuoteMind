const express = require('express');
const router = express.Router();
const { validateAddresses,
        validateEmail,
        validateName,
        validatePhone,
        validateTaxNumber,
        validateClients,
        validateInstances,
    } = require ('../../utils/Validator');
const { 
        mapDefaultQueryColumns,
        mapFromClause,
        mapQueryPrefix
     } = require('../../utils/Formatter');

module.exports = (db) => {

    // Route on operating for a signle company:
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try {
                query += ` ${mapDefaultQueryColumns("companies", true)}`;
                query += ` ${mapFromClause("companies")}`;
                query += ` WHERE ${mapQueryPrefix("companies")}.id = $1 AND ${mapQueryPrefix("companies")}.created_by = $2;`;
                const company = await db.oneOrNone(query, [id, owner]);
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
            const { full_name, email, phone, tax_number, addresses, clients } = req.body;
            try {
                await db.tx(async transaction =>{
                    await transaction.none('UPDATE public.companies SET full_name = $1, email = $2, phone = $3, tax_number = $4 WHERE id = $5 AND created_by = $6',
                        [full_name, email, phone, tax_number, id, owner]);
    
                    // Attach the addresses to the company or remove it accoringly
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message === "add") {
                                await transaction.none('INSERT INTO public.addresses (name, address, district, city, state, country, postal_code, category, created_by, company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                                    [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, owner, id]);
                            }
                            else if (address.message === "delete") {
                                await transaction.none('DELETE FROM public.addresses WHERE id = $1 AND created_by = $2 AND company = $3', [address.id, owner, id]);
                            }
                            else {
                                await transaction.none('UPDATE public.addresses SET name = $1, address = $2, district = $3, city = $4, state = $5, country = $6, postal_code = $7, category = $8 WHERE id = $9 AND created_by = $10 AND company = $11',
                                    [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, address.id, owner, id]);
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
                return res.status(200).json({ message: 'Company Updated Successfully' });
            } catch (err) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        })
        // creating a new company record
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { full_name, email, phone, tax_number, addresses, clients } = req.body;
            try{
                await db.tx(async transaction => {
                    const newCompany = await transaction.oneOrNone(
                        'INSERT INTO public.companies (full_name, email, phone, tax_number, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                        [full_name, email, phone, tax_number, owner]
                    );
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message === "add") {
                                await transaction.none('INSERT INTO public.addresses (name, address, district, city, state, country, postal_code, category, created_by, company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                                    [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, owner, newCompany.id]);
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
                    return res.status(200).json({ id : newCompany.id, message: 'Comapny created Successfully' });
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ id : null, message: 'Internal server error' });
            }
        })
        // deleting an existing company
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                await db.tx(async transaction => {
                    transaction.none('UPDATE public.clients SET company = NULL WHERE company = $1 AND created_by = $2', [id, owner]);
                    transaction.none('DELETE FROM public.addresses WHERE company = $1 AND created_by = $2', [id, owner]);
                    transaction.none('DELETE FROM public.transactions WHERE company = $1 AND created_by = $2', [id, owner]);

                    // delete the related pricings
                    await transaction.none(`DELETE FROM public.pricings WHERE created_by = $1 AND company = $2`, [owner, id]);

                    // delete the company
                    transaction.none('DELETE FROM public.companies WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: 'Company Deleted Successfully' });
            }
            catch (err) {
                console.error(error);
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
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // Validation for company record updates and creations:
        if (req.method === "PUT" || req.method === "POST") {
            const { full_name, email, phone, tax_number ,addresses, clients } = req.body;

            // validate input of informations:
            if (!full_name){
                return res.status(400).json({ message: 'Basic information are required' });
            }
            let validations = 
            [validateName(full_name), 
                validateEmail(email),
                validatePhone(phone),
                validateTaxNumber(tax_number),
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