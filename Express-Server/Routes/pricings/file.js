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
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try {
                query += ` ${mapDefaultQueryColumns("pricings", true)}`;
                query += ` ${mapFromClause("pricings")}`;
                query += ` WHERE ${mapQueryPrefix("pricings")}.id = $1 AND ${mapQueryPrefix("pricings")}.created_by = $2;`;
                const pricing = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ pricing: pricing });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ pricing: null, message: "failed to fetch pricing" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { product, price_per_unit, quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company } = req.body;
            try {
                await db.none(`
                    UPDATE public.pricings
                    SET
                        product = $1,
                        price_per_unit = $2,
                        quantity = $3,
                        size = $4,
                        size_unit = $5,
                        quantity_unit = $6,
                        colour = $7,
                        threshold = $8,
                        materials = $9::uuid[],
                        client = $10::uuid,
                        company = $11::uuid
                    WHERE id = $12
                    AND created_by = $13
                `, [product, price_per_unit, quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, id, owner]);
                return res.status(200).json({ message: "pricing updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { product, price_per_unit, quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company } = req.body;
            try {
                const pricing = await db.oneOrNone(`
                    INSERT INTO public.pricings
                    (product, price_per_unit, quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, created_by)
                    VALUES
                    ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::uuid[], $10::uuid, $11::uuid, $12)
                    RETURNING id
                `, [product, price_per_unit, quantity, size, size_unit, quantity_unit, colour, threshold, materials, client, company, owner]);
                return res.status(200).json({ id: pricing.id, message: "pricing created successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ id: null, message: err });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                await db.tx(async (transaction) => {
                    // deleting the condition itself:
                    transaction.none('DELETE FROM public.pricings WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: "pricing deleted successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: err });
            }
        });


    // middleware on pricing matainance:
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;

        // validate existence:
        if (id !== "new") {
            const existanceValidation = await validateInstances([id], owner, 'pricings', db);
            if (!existanceValidation.valid) return res.status(400).json({ message: existanceValidation.message });
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // validate the payloads:
        if (req.method === "POST" || req.method === "PUT") {
            const { product, price_per_unit, quantity, quantity_unit, size, size_unit, colour, threshold, materials, client, company } = req.body;
            
            // product and price_per_unit must be provided
            if (!product || !price_per_unit) return res.status(400).json({ message: "Incomplete Pricing information" });
            
            const validations = [
                await validateInstances([product], owner, "products", db),
                validateNumeric(price_per_unit, "price_per_unit"),
                validatePricingThreshold(quantity, quantity_unit, size, size_unit, threshold),
                await validateInstances(materials, owner, "materials", db),
                await validateInstances(client ? [client] : null, owner, "clients", db),
                await validateInstances(company ? [company] : null, owner, "companies", db),
                validateString(colour)
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
            if (parseFloat(price_per_unit) <= 0) return res.status(400).json({ message: "price per unit must be positive" });
        }
        next();
    });
    return router;
};
