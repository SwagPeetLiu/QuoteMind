const express = require('express');
const router = express.Router();
const { 
    validateInstances,
    validateName,
    validateDescriptions,
    validateInteger,
    validateColumnName
} = require ('../utils/Validator');
const { getSearchTerm } = require('../utils/Formatter');
const { getConfiguration } = require("../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

module.exports = (db) => {
    // endpoints for fetching all the products
    router.route("/")
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
                    const targetValidation = await validateColumnName(target, "products", keyword, db);
                    if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                    const type = targetValidation.type;

                    searchQuery = getSearchTerm("products",target, keyword, type);
                    if (page == 1){
                        const count = await db.oneOrNone(`
                            SELECT COUNT(p.*) AS count 
                            FROM public.products as p
                            WHERE p.created_by = $1 AND ${searchQuery};
                        `, [owner]);
                        response.count = parseInt(count.count);
                    }
                }

                const products = await db.any(`
                    SELECT p.id, p.en_name, p.ch_name
                    FROM public.products AS p
                    WHERE p.created_by = $1 ${searched ? `AND ${searchQuery}` : ""}
                    ORDER BY p.ch_name ASC
                    LIMIT $2 OFFSET $3`, 
                    [owner, limit, offset]);
                return res.status(200).json({ ...response, page: page, products: products });
            }
            catch (error){
                console.error(error);
                return res.status(500).json({ page: page, message: error, products: null });
            }
        })

    // endpoints for a single product
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const product = await db.oneOrNone(`
                    SELECT id, en_name, ch_name, description 
                    FROM public.products 
                    WHERE id = $1 and created_by = $2`, 
                    [id, owner]);
                return res.status(200).json({ product: product });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, product: null });
                }
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { en_name, ch_name, description } = req.body;
            try {
                await db.none('UPDATE public.products SET en_name = $1, ch_name = $2, description = $3 WHERE id = $4 and created_by = $5', 
                    [en_name, ch_name, description, id, owner]);
                return res.status(200).json({ message: "product updated successfully" });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, message: "failed to update product" });
                }
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { en_name, ch_name, description } = req.body;
            try {
                const newProduct = await db.oneOrNone('INSERT INTO public.products (en_name, ch_name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id', 
                    [en_name, ch_name, description, owner]);
                return res.status(200).json({ id : newProduct.id, message: "product created successfully" });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ id: null, message: error, message: "failed to create product" });
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
                    return res.status(500).json({ message: error, message: "failed to delete product" });
                }
            }
        });

    // middleware on user inputs for products
    router.param("id", async (req, res, next, id) => {
        if (id != "new"){
            const existenceValidation = await validateInstances([id], req.sessionEmail ,"products", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
        }

        // check if for the payload for the product details:
        if (req.method === "POST" || req.method === "PUT") {
            const {en_name, ch_name, description} = req.body;
            validations = [
                validateName(en_name),
                validateName(ch_name),
                validateDescriptions(description)
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    })
    return router;
}