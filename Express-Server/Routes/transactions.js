const express = require('express');
const router = express.Router();
const {
    validateName,
    validateTransactionStatus,
    validateNumeric,
    validateDescriptions,
    validateInstances,
    validateString
} = require('../utils/Validator');

module.exports = (db) => {
    // route on obtaining all the transactions
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const transactions = await db.any(`SELECT t.*, p.en_name as product_en_name, p.ch_name as product_ch_name,
                    co.full_name as company_name, c.full_name as client_name
                    FROM public.transactions as t 
                    LEFT JOIN public.products as p ON t.product = p.id
                    LEFT JOIN public.companies as co ON t.company = co.id
                    LEFT JOIN public.clients as c ON t.client = c.id
                    WHERE t.created_by = $1 ORDER BY t.modified_date DESC`, [owner]);

                // joing the basic details of the transactions:
                const materialQueries = await Promise.all(transactions.map(transaction => db.any('SELECT id, ch_name, en_name FROM public.materials WHERE created_by = $1 AND id = ANY($2::uuid[])', 
                    [owner, transaction.materials])));
                for (let i = 0; i < transactions.length; i++) {
                    transactions[i].materials = materialQueries[i];
                }
                return res.status(200).json({ transactions: transactions });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, transactions: null });
                }
            }
        });
    
    // Grabing all the relevant details for a specific transaction
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const transaction = await db.oneOrNone(`
                    SELECT t.id, t.creation_date, t.modified_date, t.status, t.name, t.quantity, t.price_per_unit, t.amount, t.note, t.colour, t.width,
                    t.height, t.length, t.en_unit, t.ch_unit, t.size, t.quantity_unit,
                    jsonb_build_object(
                        'id', p.id,
                        'en_name', p.en_name,
                        'ch_name', p.ch_name
                    ) as product, 
                    CASE WHEN t.materials IS NULL OR array_length(t.materials, 1) = 0 THEN NULL
                    ELSE (SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', m.id,
                            'en_name', m.en_name,
                            'ch_name', m.ch_name
                        ))
						FROM public.materials m
                    	WHERE m.id = ANY(t.materials)
                    ) 
					END as materials,
                    CASE WHEN t.company IS NULL THEN NULL
                    ELSE jsonb_build_object(
                        'id', co.id,
                        'full_name', co.full_name,
                        'email', co.email,
                        'tax_number', co.tax_number
                    ) END as company,
                    CASE WHEN t.client IS NULL THEN NULL
                    ELSE jsonb_build_object(
                        'id', c.id,
                        'full_name', c.full_name
                    ) END as client,
                    CASE WHEN t.addresses IS NULL OR array_length(t.addresses, 1) = 0 THEN NULL
                    ELSE ( SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', a.id,
                            'street', a.street_address,
                            'city', a.city,
                            'state', a.state,
                            'country', a.country,
                            'postal', a.postal_code,
                            'category', a.category
                        ))
						FROM public.addresses a
						WHERE a.id = ANY(t.addresses)
                    ) END as addresses,
                    CASE WHEN t.employee IS NULL OR array_length(t.addresses, 1) = 0 THEN NULL
                    ELSE (SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', e.id,
                            'name', e.name
                        ))
						FROM public.employees e
						WHERE e.id = ANY(t.employee)
                    ) END as employee
                    FROM public.transactions as t
                    LEFT JOIN public.products as p ON p.id = t.product
                    LEFT JOIN public.companies as co ON co.id = t.company
                    LEFT JOIN public.clients as c ON c.id = t.client
                    WHERE t.id = $1 AND t.created_by = $2
                    GROUP BY t.id, p.id, co.id, c.id;
                    `, 
                    [id, owner]);

                return res.status(200).json({ transaction: transaction });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "failed to fetch transaction" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            console.log("checked")
            try{
                await db.none(`UPDATE public.transactions SET modified_date = NOW(),
                    name = $1, status = $2, quantity = $3, price_per_unit = $4, amount = $5, note = $6,
                    colour = $7, width = $8, height = $9, length = $10, size = $11, en_unit = $12,
                    ch_unit = $13, product = $14::uuid, materials = $15::uuid[], company = $16::uuid,
                    client = $17::uuid, employee = $18::uuid[], addresses = $19::uuid[], quantity_unit = $20,
                    WHERE id = $21 AND created_by = $22`, 
                    [
                        req.body.name, req.body.status,req.body.quantity, req.body.price_per_unit,
                        req.body.amount, req.body.note, req.body.colour, req.body.width, req.body.height,
                        req.body.length, req.body.size, req.body.en_unit, req.body.ch_unit,
                        req.body.product, req.body.materials, req.body.company, req.body.client, req.body.employee,
                        req.body.addresses, req.body.quantity_unit,
                        id,owner
                    ]);
                return res.status(200).json({ message: "transaction updated successfully" });
            }
            catch(error) {
                console.log(error);
                return res.status(500).json({ message: "failed to update transaction" });
            }
        })
        .post(async (req, res) => {
            try{
                const newTransaction = await db.oneOrNone(`INSERT INTO public.transactions (
                    creation_date, created_by, modified_date, name, status, quantity, price_per_unit, amount,
                    note, colour, width, height, length, size, en_unit, ch_unit, product, materials, company,
                    client, employee, addresses, quantity_unit
                    ) VALUES (
                    NOW(), $1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15::uuid, $16::uuid[], $17::uuid, $18::uuid, $19::uuid[], $20::uuid[], $21
                    ) 
                    RETURNING id`, 
                    [
                        req.sessionEmail, req.body.name, req.body.status, req.body.quantity, req.body.price_per_unit,
                        req.body.amount, req.body.note, req.body.colour, req.body.width, req.body.height,
                        req.body.length, req.body.size, req.body.en_unit, req.body.ch_unit, req.body.product,
                        req.body.materials, req.body.company, req.body.client, req.body.employee, req.body.addresses,
                        req.body.quantity_unit
                    ]);
                return res.status(200).json({ id: newTransaction.id, message: "transaction created successfully" });
            }
            catch(error) {
                console.log(error);
                return res.status(500).json({ id : null, message: "failed to create transaction" });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try{
                await db.none(`DELETE FROM public.transactions WHERE id = $1 AND created_by = $2`, [id, owner]);
                return res.status(200).json({ message: "transaction deleted successfully" });
            }
            catch(error) {
                console.log(error);
                return res.status(500).json({ message: "failed to delete transaction" });
            }
        });
    
    // middleare for user input validations:
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;
        if (id !== "new") {
            const existenceValidation = await validateInstances([id], owner, "transactions", db);
            if (!existenceValidation.valid) return res.status(404).json({ message: existenceValidation.message });
        }

        // validating dat payload
        if (req.method === "PUT" || req.method === "POST") {

            // Prevent any contractdicting information:
            if (!req.body.product || (!req.body.company && !req.body.client)) {
                return res.status(400).json({ message: "Basic information are required" });
            }
            if (req.body.width || req.body.height || req.body.length || req.body.size) {
                if (!en_unit || !ch_unit) {
                    return res.status(400).json({ message: "units are required" });
                }
            }
            if (!req.body.quantity) return res.status(400).json({ message: "quantity is required" });

            const validations = [
                validateName(req.body.name),
                validateTransactionStatus(req.body.status),
                validateNumeric(req.body.quantity, "quantity"),
                validateNumeric(req.body.price_per_unit, "price per unit"),
                validateNumeric(req.body.amount, "amount"),
                validateNumeric(req.body.width, "width"),
                validateNumeric(req.body.height, "height"),
                validateNumeric(req.body.length, "height"),
                validateNumeric(req.body.size, "size"),
                validateString(req.body.colour),
                validateString(req.body.quantity_unit),
                validateDescriptions(req.body.note),
                validateString(req.body.en_unit),
                validateString(req.body.ch_unit),
                await validateInstances([req.body.product], owner, "products", db),
                await validateInstances(req.body.materials, owner, "materials", db), // assume list input
                await validateInstances(req.body.company ? [req.body.company] : null, owner, "companies", db),
                await validateInstances(req.body.client ? [req.body.client]: null, owner, "clients", db),
                await validateInstances(req.body.employee, owner, "employees", db), // assume list input
                await validateInstances(req.body.addresses, owner, "addresses", db), // assume list input
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });

    return router;
}