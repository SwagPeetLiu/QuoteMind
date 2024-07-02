const express = require('express');
const router = express.Router();
const {
    validatePricingThreshold,
    validateInstances,
    validateString,
    validateNumeric,
    validateInteger,
    validateColumnName
} = require('../utils/Validator');
const { getSearchTerm } = require('../utils/Formatter');
const { getConfiguration } = require("../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

// scripts for determining and managing the pricing strategies to improve
// the user experience on pricing automations
module.exports = (db) => {
    router.route("/conditions")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            let { searched, target, keyword, page } = req.body;
            let searchQuery;
            const response = {};

            // validate page number
            const pageValidation = validateInteger(req.query.page, "page number");
            if (!pageValidation.valid) return res.status(400).json({ message: pageValidation.message });
            page = req.query.page || 1;

            // set up the limits:
            const limit = pageSize * page;
            const offset = (page - 1) * pageSize;

            try {
                // setting up the potential search query setting:
                if (searched) {
                    // validate search query format:
                    if (!target || !keyword) return res.status(400).json({ message: "search query is invalid" });
                    const targetValidation = await validateColumnName(target, "pricing_conditions", keyword, db);
                    if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                    const type = targetValidation.type;

                    searchQuery = getSearchTerm("pricing_conditions",target, keyword, type);
                    if (page == 1){
                        const count = await db.oneOrNone(`
                            SELECT COUNT(cond.*) AS count 
                            FROM public.pricing_conditions as cond
                            WHERE cond.created_by = $1 AND ${searchQuery};
                        `, [owner]);
                        response.count = parseInt(count.count);
                    }
                }

                const pricing = await db.any(`
                    SELECT 
                        cond.id, 
                        cond.quantity, 
                        cond.size, 
                        cond.size_unit,
                        cond.quantity_unit,
                        cond.colour, 
                        cond.threshold,
                        CASE
                            WHEN p.id IS NOT NULL THEN jsonb_build_object(
                                'id', p.id,
                                'en_name', p.en_name,
                                'ch_name', p.ch_name
                            )
                            ELSE NULL
                        END as product,
                        CASE
                            WHEN cond.materials IS NULL OR array_length(cond.materials, 1) = 0 THEN NULL
                            ELSE (
                                SELECT json_agg(
                                    jsonb_build_object(
                                        'id', m.id,
                                        'en_name', m.en_name,
                                        'ch_name', m.ch_name
                                    )
                                )
                                FROM public.materials m
                                WHERE m.id = ANY(cond.materials)
                            )
                        END as materials,
                        CASE
                            WHEN c.id IS NOT NULL THEN jsonb_build_object(
                                'id', c.id,
                                'full_name', c.full_name
                            )
                            ELSE NULL
                        END as client,
                        CASE
                            WHEN co.id IS NOT NULL THEN jsonb_build_object(
                                'id', co.id,
                                'full_name', co.full_name
                            )
                            ELSE NULL
                        END as company
                    FROM public.pricing_conditions as cond
                    LEFT JOIN public.products as p ON p.id = cond.product
                    LEFT JOIN public.clients as c ON c.id = cond.client
                    LEFT JOIN public.companies as co ON co.id = cond.company
                    WHERE cond.created_by = $1 ${searched ? `AND ${searchQuery}` : ''}
                    GROUP BY cond.id, p.id, c.id, co.id
                    ORDER BY cond.id ASC
                    LIMIT $2 OFFSET $3
                `, [owner, limit, offset]);                
                return res.status(200).json({ ...response, page: page, pricing_conditions: pricing });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ page: page, message: error });
            }
        });

        // Function used to fetch all the Pricings rules defined by the user
        router.route("/rules")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            let { searched, target, keyword, page } = req.body;
            let searchQuery;
            const response = {};

            // validate page number
            const pageValidation = validateInteger(req.query.page, "page number");
            if (!pageValidation.valid) return res.status(400).json({ message: pageValidation.message });
            page = req.query.page || 1;

            // set up the limits:
            const limit = pageSize * page;
            const offset = (page - 1) * pageSize;

            try {
                // setting up the potential search query setting:
                if (searched) {
                    // validate search query format:
                    if (!target || !keyword) return res.status(400).json({ message: "search query is invalid" });
                    const targetValidation = await validateColumnName(target, "pricing_rules", keyword, db);
                    if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                    const type = targetValidation.type;

                    searchQuery = getSearchTerm("pricing_rules", target, keyword, type);
                    if (page == 1){
                        const count = await db.oneOrNone(`
                            SELECT COUNT(r.*) AS count 
                            FROM public.pricing_rules as r
                            WHERE r.created_by = $1 AND ${searchQuery};
                        `, [owner]);
                        response.count = parseInt(count.count);
                    }
                }

                const rules = await db.any(`
                    SELECT
                        r.id, r.price_per_unit,
                        json_agg(
                            jsonb_build_object(
                                'id', cond.id,
                                'quantity', cond.quantity,
                                'size', cond.size,
                                'size_unit', cond.size_unit,
                                'quantity_unit', cond.quantity_unit,
                                'colour', cond.colour,
                                'threshold', cond.threshold,
                                'product', jsonb_build_object(
                                    'id', p.id,
                                    'en_name', p.en_name,
                                    'ch_name', p.ch_name
                                ),
                                'materials', (
                                    CASE WHEN cond.materials IS NULL THEN NULL
                                    ELSE (
                                        SELECT json_agg(
                                            jsonb_build_object(
                                                'id', m.id,
                                                'en_name', m.en_name,
                                                'ch_name', m.ch_name
                                            )
                                        )
                                        FROM public.materials m
                                        WHERE m.id = ANY(cond.materials)
                                    )
                                    END
                                ),
                                'client', CASE WHEN cond.client IS NULL THEN NULL 
                                ELSE jsonb_build_object(
                                    'id', c.id,
                                    'full_name', c.full_name
                                ) END,
                                'company', CASE WHEN cond.company IS NULL THEN NULL 
                                ELSE jsonb_build_object(
                                    'id', co.id,
                                    'full_name', co.full_name
                                ) END
                            )
                            ORDER BY cond.id ASC
                        ) as conditions
                    FROM public.pricing_rules as r
                    LEFT JOIN public.pricing_conditions as cond ON cond.id = ANY(r.conditions)
                    LEFT JOIN public.products as p ON p.id = cond.product
                    LEFT JOIN public.clients as c ON c.id = cond.client
                    LEFT JOIN public.companies as co ON co.id = cond.company
                    WHERE r.created_by = $1 ${searched ? `AND ${searchQuery}` : ''}
                    GROUP BY r.id
                    ORDER BY r.id ASC
                    LIMIT $2 OFFSET $3;
                `, [owner, limit, offset]);
                return res.status(200).json({ ...response, page: page, pricing_rules: rules });
            } catch (error) { 
                console.error(error);
                return res.status(500).json({ page: page, message: error });
            }
        });
    
    // manipulations on the records of pricing conditions
    router.route("/conditions/:id")
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {quantity, size, size_unit, quantity_unit,colour, threshold, materials, product, client, company} = req.body;
            try{
                await db.none(`
                    UPDATE public.pricing_conditions
                    SET
                        quantity = $1,
                        size = $2,
                        size_unit = $3,
                        quantity_unit = $4,
                        colour = $5,
                        threshold = $6,
                        materials = $7::uuid[],
                        product = $8::uuid,
                        client = $9::uuid,
                        company = $10::uuid
                    WHERE id = $11
                    AND created_by = $12
                `, [quantity, size, size_unit, quantity_unit, colour, threshold, materials, product, client, company, id, owner]);
                return res.status(200).json({ message: "condition updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {quantity, size, size_unit, quantity_unit, colour, threshold, materials, product, client, company} = req.body;
            try{
                const condition = await db.oneOrNone(`
                    INSERT INTO public.pricing_conditions
                    (quantity, size, size_unit, quantity_unit, colour, threshold, materials, product, client, company, created_by)
                    VALUES
                    ($1, $2, $3, $4, $5, $6, $7::uuid[], $8::uuid, $9::uuid, $10::uuid, $11)
                    RETURNING id
                `, [quantity, size, size_unit, quantity_unit, colour, threshold, materials, product, client, company, owner]);
                return res.status(200).json({ id: condition.id, message: "condition created successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ id: null, message: err });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try{
                await db.tx(async (transaction) => {
                    // deleting the condition from the pricing rules:
                    transaction.none(`DELETE FROM public.pricing_rules
                        WHERE created_by = $1
                        AND EXISTS (
                            SELECT 1
                            FROM unnest(conditions) AS condition_id
                            WHERE condition_id = $2::UUID
                        );`, [owner, id]);
                        
                    // deleting the condition itself:
                    transaction.none('DELETE FROM public.pricing_conditions WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: "condition deleted successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        });

    // manipulations on a specific record of pricing rule
    router.route("/rules/:id")
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {price_per_unit, conditions} = req.body;
            try{
                await db.none(`
                    UPDATE public.pricing_rules
                    SET
                        price_per_unit = $1,
                        conditions = $2::UUID[]
                    WHERE id = $3
                    AND created_by = $4
                `, [price_per_unit, conditions, id, owner]);
                return res.status(200).json({ message: "rule updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {price_per_unit, conditions} = req.body;
            try{
                const rule = await db.oneOrNone(`
                    INSERT INTO public.pricing_rules
                    (price_per_unit, conditions, created_by)
                    VALUES
                    ($1, $2::UUID[], $3)
                    RETURNING id
                `, [price_per_unit, conditions, owner]);
                return res.status(200).json({ id : rule.id, message: "rule created successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ id: null, message: err });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try{
                await db.none(`
                    DELETE FROM public.pricing_rules
                    WHERE id = $1
                    AND created_by = $2
                `, [id, owner]);
                return res.status(200).json({ message: "rule deleted successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        });
    
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;
        const target = req.url.includes("conditions") ? "pricing_conditions" : "pricing_rules";

        // validate existence:
        if (id !== "new") {
            const existanceValidation = await validateInstances([id], owner, target, db);
            if (!existanceValidation.valid) return res.status(400).json({ message: existanceValidation.message });
        }

        // validate the payloads:
        if (req.method === "POST" || req.method === "PUT") {
            if (target === "pricing_conditions") {
                const {quantity, size, size_unit, colour, threshold, materials, product, client, company} = req.body;
                if (!product) return res.status(400).json({ message: "product is required" });
                const validations = [
                    validatePricingThreshold(quantity, size, size_unit, threshold),
                    await validateInstances(materials, owner, "materials", db),
                    await validateInstances([product], owner, "products", db),
                    await validateInstances(client ? [client] : null, owner, "clients", db),
                    await validateInstances(company ? [company] : null, owner, "companies", db),
                    validateString(colour)
                ];
                for (const validation of validations) if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
            else if (target === "pricing_rules") {
                const {price_per_unit, conditions} = req.body;
                if (!price_per_unit) return res.status(400).json({ message: "price per unit is required" });
                const validations = [
                    await validateInstances(conditions, owner, "pricing_conditions", db),
                    validateNumeric(price_per_unit, "price_per_unit")
                ];
                for (const validation of validations) if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });
    return router;
};
