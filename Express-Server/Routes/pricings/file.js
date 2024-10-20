const express = require('express');
const router = express.Router();
const {
    validatePricingThreshold,
    validateInstances,
    validateString,
    validateNumeric
} = require('../../utils/Validator');
const { 
    mapDefaultQueryColumns,
    mapFromClause,
    mapQueryPrefix
 } = require('../../utils/Formatter');
 
// scripts for determining and managing the pricing strategies to improve
// the user experience on pricing automations
module.exports = (db) => {
    
    // manipulations on the records of pricing conditions
    router.route("/conditions/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try{
                query += ` ${mapDefaultQueryColumns("pricing_conditions", true)}`;
                query += ` ${mapFromClause("pricing_conditions")}`;
                query += ` WHERE ${mapQueryPrefix("pricing_conditions")}.id = $1 AND ${mapQueryPrefix("pricing_conditions")}.created_by = $2;`;
                const condition = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ condition: condition });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ condition: null, message: "failed to fetch condition" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {quantity, size, size_unit, quantity_unit,colour, threshold, materials, client, company} = req.body;
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
                        client = $8::uuid,
                        company = $9::uuid
                    WHERE id = $10
                    AND created_by = $11
                `, [quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, id, owner]);
                return res.status(200).json({ message: "condition updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const {quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company} = req.body;
            try{
                const condition = await db.oneOrNone(`
                    INSERT INTO public.pricing_conditions
                    (quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, created_by)
                    VALUES
                    ($1, $2, $3, $4, $5, $6, $7::uuid[], $8::uuid, $9::uuid, $10)
                    RETURNING id
                `, [quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, owner]);
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
                    // delete the related pricing rules to ensure the integrity of the pricings:
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
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try{
                query += ` ${mapDefaultQueryColumns("pricing_rules", true)}`;
                query += ` ${mapFromClause("pricing_rules")}`;
                query += ` WHERE ${mapQueryPrefix("pricing_rules")}.id = $1 AND ${mapQueryPrefix("pricing_rules")}.created_by = $2;`;
                const rule = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ rule: rule });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ rule: null, message: "failed to fetch rule" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const {product, price_per_unit, conditions} = req.body;
            try{
                await db.none(`
                    UPDATE public.pricing_rules
                    SET
                        product = $1::UUID,
                        price_per_unit = $2,
                        conditions = $3::UUID[]
                    WHERE id = $4
                    AND created_by = $5
                `, [product, price_per_unit, conditions, id, owner]);
                return res.status(200).json({ message: "rule updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { product, price_per_unit, conditions } = req.body;
            try{
                const rule = await db.oneOrNone(`
                    INSERT INTO public.pricing_rules
                    (product, price_per_unit, conditions, created_by)
                    VALUES
                    ($1::UUID, $2, $3::UUID[], $4)
                    RETURNING id
                `, [product, price_per_unit, conditions, owner]);
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
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // validate the payloads:
        if (req.method === "POST" || req.method === "PUT") {
            if (target === "pricing_conditions") {
                const { quantity, quantity_unit, size, size_unit, colour, threshold, materials, client, company } = req.body;
                const validations = [
                    validatePricingThreshold(quantity, quantity_unit, size, size_unit, threshold),
                    await validateInstances(materials, owner, "materials", db),
                    await validateInstances(client ? [client] : null, owner, "clients", db),
                    await validateInstances(company ? [company] : null, owner, "companies", db),
                    validateString(colour)
                ];
                for (const validation of validations) if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
            else if (target === "pricing_rules") {
                const { product, price_per_unit, conditions } = req.body;
                if (!product) return res.status(400).json({ message: "product is required" });
                if (!price_per_unit) return res.status(400).json({ message: "price per unit is required" });
                if (!conditions || conditions.length === 0) return res.status(400).json({ message: "conditions are required" });
                const validations = [
                    await validateInstances([product], owner, "products", db),
                    await validateInstances(conditions, owner, "pricing_conditions", db),
                    validateNumeric(price_per_unit, "price_per_unit")
                ];
                for (const validation of validations) if (!validation.valid) return res.status(400).json({ message: validation.message });
                if (price_per_unit <= 0) return res.status(400).json({ message: "price per unit must be positive" });
            }
        }
        next();
    });
    return router;
};
