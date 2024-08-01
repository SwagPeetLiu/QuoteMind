const express = require('express');
const router = express.Router();
const { 
    validateInstances,
    validateName,
    validateDescriptions
} = require ('../../utils/Validator');
const { 
    mapDefaultQueryColumns,
    mapFromClause,
    mapQueryPrefix
 } = require('../../utils/Formatter');

module.exports = (db) => {

    // endpoints for a single product
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try {
                query += ` ${mapDefaultQueryColumns("products", true)}`; // with details
                query += ` ${mapFromClause("products")}`;
                query += ` WHERE ${mapQueryPrefix("products")}.id = $1 AND ${mapQueryPrefix("products")}.created_by = $2;`;
                const product = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ product: product });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ product: null, message: "failed to fetch this product" });
                }
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { en_name, ch_name, descriptions } = req.body;
            try {
                await db.none('UPDATE public.products SET en_name = $1, ch_name = $2, descriptions = $3 WHERE id = $4 and created_by = $5', 
                    [en_name, ch_name, descriptions, id, owner]);
                return res.status(200).json({ message: "product updated successfully" });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: "failed to update product" });
                }
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { en_name, ch_name, descriptions } = req.body;
            try {
                const newProduct = await db.oneOrNone('INSERT INTO public.products (en_name, ch_name, descriptions, created_by) VALUES ($1, $2, $3, $4) RETURNING id', 
                    [en_name, ch_name, descriptions, owner]);
                return res.status(200).json({ id : newProduct.id, message: "product created successfully" });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: "failed to create product" });
                }
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                db.tx(async (transaction) => {
                    // deleting its relations with existing transactions (use reminders to tell end-user on this issue)
                    transaction.none('DELETE FROM public.transactions WHERE product = $1 AND created_by = $2', [id, owner]);

                    // delete the related pricings:
                    const conditions = await transaction.any(`DELETE FROM public.pricing_conditions WHERE created_by = $1 AND product = $2
                        RETURNING id;`, [owner, id]);
                    const deletedIDs = conditions.map((condition) => condition.id);
                    transaction.none(`DELETE FROM public.pricing_rules
                                        WHERE created_by = $1
                                        AND EXISTS (
                                            SELECT 1
                                            FROM unnest(conditions) AS condition_id
                                            WHERE condition_id = ANY($2::UUID[])
                                        );`, [owner, deletedIDs]);

                    // deleting the product itself:
                    transaction.none('DELETE FROM public.products WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: "product deleted successfully" });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: "failed to delete product" });
                }
            }
        });

    // middleware on user inputs for products
    router.param("id", async (req, res, next, id) => {
        if (id != "new"){
            const existenceValidation = await validateInstances([id], req.sessionEmail ,"products", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // check if for the payload for the product details:
        if (req.method === "POST" || req.method === "PUT") {
            const {en_name, ch_name, descriptions} = req.body;
            validations = [
                validateName(en_name),
                validateName(ch_name),
                validateDescriptions(descriptions)
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    })
    return router;
}