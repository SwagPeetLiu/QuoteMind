const express = require('express');
const router = express.Router();
const {
    validateName,
    validateTransactionStatus,
    validateTransactionDate,
    validateNumeric,
    validateDescriptions,
    validateInstances,
    validateString,
    validateInteger,
    validateColumnName
} = require('../../utils/Validator');
const { getSearchTerm } = require('../../utils/Formatter');
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

module.exports = (db) => {
    // route on obtaining all the transactions
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            let { target, keyword, page } = req.query;
            let searchQuery;
            const response = {};

            // validate searches & generate the serach term
            const searched = (!target && !keyword) ? false : true;
            if (searched){
                if (!target || !keyword) return res.status(400).json({ message: "search query is invalid" });
                const targetValidation = await validateColumnName(target, "transactions", keyword, db);
                if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                const type = targetValidation.type;
                searchQuery = getSearchTerm("transactions",target, keyword, type);
            }

            try{
                if (page){
                    page = parseInt(page);
                    if (!page) return res.status(400).json({ message: "page number is invalid" });
                    const pageValidation = validateInteger(page, "page number");
                    if (!pageValidation.valid) return res.status(400).json({ message: pageValidation.message });
                }
                else{
                    page = 1;
                    const count = await db.oneOrNone(`
                        SELECT COUNT(t.*) AS count 
                        FROM public.transactions as t
                        WHERE t.created_by = $1 ${searched? `AND ${searchQuery}`:''};
                    `, [owner]);
                    response.count = parseInt(count.count);
                }
                response.searched = searched;
                response.page = page;
                const limit = pageSize * page;
                const offset = (page - 1) * pageSize;

                const transactions = await db.any(`
                    SELECT 
                        t.transaction_date, t.creation_date, t.modified_date, t.status, t.id, t.name, t.quantity, 
                        t.price_per_unit, t.amount, t.note, t.colour, t.en_unit, t.ch_unit,
                        t.width, t.height, t.length, t.size, t.quantity_unit, t.size_unit,
                        CASE WHEN t.materials IS NULL OR array_length(t.materials, 1) = 0 THEN NULL
                        ELSE (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', m.id,
                                    'en_name', m.en_name,
                                    'ch_name', m.ch_name
                                )
                            )
                            FROM public.materials m
                            WHERE m.id = ANY(t.materials)
                        ) END as materials,
                        (
                            SELECT jsonb_build_object(
                                'id', p.id,
                                'en_name', p.en_name,
                                'ch_name', p.ch_name
                            )
                            FROM public.products p
                            WHERE p.id = t.product
                        ) as product,
                        (
                            SELECT co.full_name
                            FROM public.companies co
                            WHERE co.id = t.company
                        ) as company,
                        (
                            SELECT c.full_name
                            FROM public.clients c
                            WHERE c.id = t.client
                        ) as client
                    FROM public.transactions t 
                    WHERE t.created_by = $1 ${searched ? `AND ${searchQuery}` : ''}
                    ORDER BY t.modified_date DESC
                    LIMIT $2 OFFSET $3;
                `, [owner, limit, offset]);
                
                return res.status(200).json({ ...response, transactions: transactions });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ ...response, message: "failed to fetch transactions" });
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
                    SELECT t.id, t.transaction_date, t.creation_date, t.modified_date, t.status, t.name, t.quantity, t.price_per_unit, t.amount, t.note, t.colour, t.width,
                    t.height, t.length, t.en_unit, t.ch_unit, t.size, t.quantity_unit, t.size_unit,
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
                        'full_name', co.full_name
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
            try{
                await db.none(`UPDATE public.transactions SET modified_date = NOW(),
                    name = $1, status = $2, quantity = $3, price_per_unit = $4, amount = $5, note = $6,
                    colour = $7, width = $8, height = $9, length = $10, size = $11, en_unit = $12,
                    ch_unit = $13, product = $14::uuid, materials = $15::uuid[], company = $16::uuid,
                    client = $17::uuid, employee = $18::uuid[], addresses = $19::uuid[], quantity_unit = $20,
                    size_unit = $21, transaction_date = $22
                    WHERE id = $23 AND created_by = $24`, 
                    [
                        req.body.name, req.body.status,req.body.quantity, req.body.price_per_unit,
                        req.body.amount, req.body.note, req.body.colour, req.body.width, req.body.height,
                        req.body.length, req.body.size, req.body.en_unit, req.body.ch_unit,
                        req.body.product, req.body.materials, req.body.company, req.body.client, req.body.employee,
                        req.body.addresses, req.body.quantity_unit, req.body.size_unit, req.body.transaction_date,
                        id,owner
                    ]);
                return res.status(200).json({ message: "transaction updated successfully" });
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({ message: "failed to update transaction" });
            }
        })
        .post(async (req, res) => {
            try{
                const newTransaction = await db.oneOrNone(`INSERT INTO public.transactions (
                    creation_date, created_by, modified_date, name, status, quantity, price_per_unit, amount,
                    note, colour, width, height, length, size, en_unit, ch_unit, product, materials, company,
                    client, employee, addresses, quantity_unit, size_unit, transaction_date
                    ) VALUES (
                    NOW(), $1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15::uuid, $16::uuid[], $17::uuid, $18::uuid, $19::uuid[], $20::uuid[], $21, $22, $23
                    ) 
                    RETURNING id`, 
                    [
                        req.sessionEmail, req.body.name, req.body.status, req.body.quantity, req.body.price_per_unit,
                        req.body.amount, req.body.note, req.body.colour, req.body.width, req.body.height,
                        req.body.length, req.body.size, req.body.en_unit, req.body.ch_unit, req.body.product,
                        req.body.materials, req.body.company, req.body.client, req.body.employee, req.body.addresses,
                        req.body.quantity_unit, req.body.size_unit, req.body.transaction_date
                    ]);
                return res.status(200).json({ id: newTransaction.id, message: "transaction created successfully" });
            }
            catch(error) {
                console.error(error);
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
                console.error(error);
                return res.status(500).json({ message: "failed to delete transaction" });
            }
        });
    
    // middleare for user input validations:
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;
        if (id !== "new") {
            const existenceValidation = await validateInstances([id], owner, "transactions", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // validating dat payload
        if (req.method === "PUT" || req.method === "POST") {

            // Prevent any contractdicting information:
            if (!req.body.product || (!req.body.company && !req.body.client)) {
                return res.status(400).json({ message: "Basic information are required" });
            }
            if (req.body.width || req.body.height || req.body.length) {
                if (!req.body.en_unit || !req.body.ch_unit) {
                    return res.status(400).json({ message: "units are required" });
                }
            }
            if (!req.body.size_unit && req.body.size) return res.status(400).json({ message: "size unit is required" });
            if (req.body.size_unit && !req.body.size) return res.status(400).json({ message: "size is required" });
            if (!req.body.quantity) return res.status(400).json({ message: "quantity is required" });
            if (!req.body.quantity_unit) return res.status(400).json({ message: "quantity unit is required" });

            const validations = [
                validateName(req.body.name),
                validateTransactionStatus(req.body.status),
                validateInteger(req.body.quantity, "quantity"),
                validateNumeric(req.body.price_per_unit, "price_per_unit"),
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
                validateString(req.body.size_unit),
                validateTransactionDate(req.body.transaction_date), // nullable transaction date
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