const express = require('express');
const router = express.Router();
const { 
    validateInstances,
    validateName,
    validateDescriptions
} = require ('../utils/Validator');

module.exports = (db) => {
    // endpoints for fetching all the products
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const products = await db.any('SELECT * FROM public.products WHERE created_by = $1 ORDER BY ch_name ASC', [owner]);
                return res.status(200).json({ products: products });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, products: null });
                }
            }
        })

    // endpoints for a single product
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const product = await db.oneOrNone('SELECT * FROM public.products WHERE id = $1 and created_by = $2', [id, owner]);
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