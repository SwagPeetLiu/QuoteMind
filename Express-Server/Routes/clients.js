require("dotenv").config();
const express = require('express');
const router = express.Router();
const { validateAddresses,
    validateEmail,
    validateName,
    validatePhone,
    validateSocialContacts,
    validateInstances
    } = require ('../utils/Validator');

module.exports = (db) => {
    // endpoint on fetching all the clients created by the user
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const clients = await db.any(`
                    SELECT c.id, c.full_name, c.email, c.phone, c.wechat_contact, c.qq_contact, 
                    co.full_name AS company_name
                    FROM public.clients c
                    LEFT JOIN public.companies co ON c.company = co.id
                    WHERE c.created_by = $1
                    ORDER BY c.full_name ASC;
                `, [owner]);
                return res.status(200).json({ clients: clients });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ clients: null, message: "failed to fetch clients" });
            }
        })

    router.route("/:id")
        // fetching a specific client 
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const client = await db.oneOrNone(`
                    SELECT c.id, 
                    c.full_name, 
                    c.email, 
                    c.phone, 
                    c.wechat_contact, 
                    c.qq_contact, 
                    CASE WHEN c.company IS NULL THEN NULL
                            ELSE jsonb_build_object(
                                'id', co.id,
                                'full_name', co.full_name
                                )
                    END AS company,
                    CASE WHEN (SELECT count(id) FROM public.addresses WHERE client = c.id) = 0 THEN NULL 
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
                                WHERE a.client = c.id
                            )
                    END AS addresses
                FROM public.clients AS c 
                LEFT JOIN public.companies AS co ON c.company = co.id
                WHERE c.id = $1 AND c.created_by = $2
                GROUP BY c.id, co.id, co.full_name;
                `, [id, owner]);
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
                                    INSERT INTO public.addresses (street_address, city, state, country, postal_code, category, created_by, client)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
                                `, [address.street, address.city, address.state, address.country, address.postal, address.category, owner, id]);
                            }
                            else if (address.message === "update") {
                                await transaction.none(`
                                    UPDATE public.addresses
                                    SET street_address = $1, city = $2, state = $3, country = $4, postal_code = $5, category = $6
                                    WHERE id = $7 AND created_by = $8 AND client = $9;
                                `, [address.street, address.city, address.state, address.country, address.postal, address.category, address.id, owner, id]);
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
                                    INSERT INTO public.addresses (street_address, city, state, country, postal_code, category, created_by, client)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
                                `, [address.street, address.city, address.state, address.country, address.postal, address.category, owner, client.id]);
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