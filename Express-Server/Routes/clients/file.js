require("dotenv").config();
const express = require('express');
const router = express.Router();
const { validateAddresses,
    validateEmail,
    validateName,
    validatePhone,
    validateSocialContacts,
    validateInstances,
    } = require ('../../utils/Validator');
const { 
    mapDefaultQueryColumns,
    mapFromClause,
    mapQueryPrefix
 } = require('../../utils/Formatter');

module.exports = (db) => {
    router.route("/:id")

        // fetching a specific client 
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try {
                query += ` ${mapDefaultQueryColumns("clients", true)}`; // with details
                query += ` ${mapFromClause("clients")}`;
                query += ` WHERE ${mapQueryPrefix("clients")}.id = $1 AND ${mapQueryPrefix("clients")}.created_by = $2;`;
                const client = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ client: client });
            } catch (err) {
                console.error(err);
                return res.status(500).json({ client: null, message: "failed to fetch client" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { company, full_name, email, phone, wechat_contact, qq_contact, addresses } = req.body;
            try {
                await db.tx(async (transaction) => {
                    // update the client
                    await transaction.none(`
                        UPDATE public.clients
                        SET company = $1, full_name = $2, email = $3, phone = $4, wechat_contact = $5, qq_contact = $6
                        WHERE id = $7 AND created_by = $8;
                    `, [company, full_name, email, phone, wechat_contact, qq_contact, id, owner]);

                    // update the addresses
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message === "add") {
                                await transaction.none(`
                                    INSERT INTO public.addresses (name, address, district, city, state, country, postal_code, category, created_by, client)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                                `, [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, owner, id]);
                            }
                            else if (address.message === "update") {
                                await transaction.none(`
                                    UPDATE public.addresses
                                    SET name = $1, address = $2, district = $3, city = $4, state = $5, country = $6, postal_code = $7, category = $8
                                    WHERE id = $9 AND created_by = $10 AND client = $11;
                                `, [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, address.id, owner, id]);
                            }
                            else if (address.message === "delete") {
                                await transaction.none('DELETE FROM public.addresses WHERE id = $1 AND created_by = $2 AND client = $3', [address.id, owner, id]);
                            }
                        }
                    }
                });
                return res.status(200).json({ message: "client updated successfully" });
            } 
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: "failed to update client" });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { company, full_name, email, phone, wechat_contact, qq_contact, addresses } = req.body;
            try {
                await db.tx(async (transaction) => {
                    // create the client
                    const client = await transaction.oneOrNone(`
                        INSERT INTO public.clients (company, full_name, email, phone, wechat_contact, qq_contact, created_by)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id;
                    `, [company, full_name, email, phone, wechat_contact, qq_contact, owner]);

                    // create the addresses associated
                    if (addresses && addresses.length > 0) {
                        for (address of addresses) {
                            if (address.message == "add") {
                                await transaction.none(`
                                    INSERT INTO public.addresses (name, address, district, city, state, country, postal_code, category, created_by, client)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                                `, [address.name, address.address, address.district, address.city, address.state, address.country, address.postal, address.category, owner, client.id]);
                            }
                        }
                    }
                    return res.status(200).json({ id: client.id, message: "client created successfully" });
                });
            }
            catch(err) {
                console.error(err);
                return res.status(500).json({id: null, message: "failed to create client" });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try{
                await db.tx(async (transaction) => {
                    // delete the associated addresses
                    transaction.none('DELETE FROM public.addresses WHERE created_by = $1 AND client = $2', [owner, id]);

                    // delete the related definitions of the pricings based on client (using unset to map all listed conditions in each rule to 
                    // individual element and check if they match to any related condition)
                    const conditions = await transaction.any(`DELETE FROM public.pricing_conditions WHERE created_by = $1 AND client = $2
                        RETURNING id;`, [owner, id]);
                    const deletedIDs = conditions.map((condition) => condition.id);
                    transaction.none(`DELETE FROM public.pricing_rules
                                        WHERE created_by = $1
                                        AND EXISTS (
                                            SELECT 1
                                            FROM unnest(conditions) AS condition_id
                                            WHERE condition_id = ANY($2::UUID[])
                                        );`, [owner, deletedIDs]);
                    
                    // delete the client
                    transaction.none('DELETE FROM public.clients WHERE created_by = $1 AND id = $2', [owner, id]);
                })
                return res.status(200).json({ message: "client deleted successfully" });
            }
            catch(err) {
                console.error(err);
                return res.status(500).json({ message: "failed to delete client" });
            }
        });

    // Middleware on user input of client id
    router.param("id", async (req, res, next, id) => {
        // validate client id
        const owner = req.sessionEmail;
        if (id !== "new"){
            const existenceValidation = await validateInstances([id], owner, "clients", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // validate for updating the complete information of the client
        if ((req.method === 'PUT' || req.method === 'POST')) {
            const { company, full_name, email, phone, wechat_contact, qq_contact, addresses } = req.body;
            if (company){
                const existenceValidation = await validateInstances([company], owner, "companies", db);
                if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
            }

            let validations = [
                validateName(full_name),
                validateEmail(email),
                validatePhone(phone),
                validateSocialContacts(wechat_contact, "wechat"),
                validateSocialContacts(qq_contact, "qq"),
                await validateAddresses(addresses, owner, id, "client", db, req)
            ];
            for (let validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });
    return router;
}