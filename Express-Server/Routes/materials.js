require("dotenv").config();
const express = require('express');
const router = express.Router();
const {
    validateInstances,
    validateName,
    validateDescriptions,
    validateInteger,
    validateColumnName
} = require('../utils/Validator');
const { getSearchTerm } = require('../utils/Formatter');
const { getConfiguration } = require("../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

module.exports = (db) => {
    // fetching all the materials
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
                    const targetValidation = await validateColumnName(target, "materials", keyword, db);
                    if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                    const type = targetValidation.type;

                    searchQuery = getSearchTerm("materials",target, keyword, type);
                    if (page == 1){
                        const count = await db.oneOrNone(`
                            SELECT COUNT(m.*) AS count 
                            FROM public.materials AS m
                            WHERE m.created_by = $1 AND ${searchQuery};
                        `, [owner]);
                        response.count = parseInt(count.count);
                    }
                }

                const materials = await db.any(`
                    SELECT m.id, m.en_name, m.ch_name 
                    FROM public.materials AS m
                    WHERE m.created_by = $1 ${searched ? `AND ${searchQuery}` : ""}
                    ORDER BY m.ch_name ASC
                    LIMIT $2 OFFSET $3`
                    , [owner, limit, offset]);
                return res.status(200).json({ ...response, page: page, materials: materials });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ page: page, message: error, materials: null });
                }
            }
        });

    // fetching a specific material
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const material = await db.oneOrNone(`
                    SELECT id, en_name, ch_name, description 
                    FROM public.materials 
                    WHERE id = $1 and created_by = $2`, 
                    [id, owner]);
                return res.status(200).json({ material: material });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, material: null });
                }
            }
        })
        .put(async (req, res) => {
            const id = req.params.id;
            const owner = req.sessionEmail;
            const { en_name, ch_name, description } = req.body;
            try{
                await db.none('UPDATE public.materials SET en_name = $1, ch_name = $2, description = $3 WHERE id = $4 AND created_by = $5'
                    , [en_name, ch_name, description, id, owner]);
                return res.status(200).json({ message: "material updated successfully" });
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({ message: "failed to update material" });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { en_name, ch_name, description } = req.body;
            try{
                const newMaterial = await db.oneOrNone('INSERT INTO public.materials (en_name, ch_name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id'
                    , [en_name, ch_name, description, owner]);
                return res.status(200).json({ id: newMaterial.id, message: "material created successfully" });
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({ id: null, message: "failed to create material" });
            }
        })
        .delete(async (req, res) => {
            const id = req.params.id;
            const owner = req.sessionEmail;
            try{
                db.tx(async (transaction) => {
                    // remove the references of material in transactions:
                    transaction.none(`UPDATE public.transactions SET materials = array_remove(materials, $1) WHERE created_by = $2`, [id, owner]);

                    // deleting any pricing references to the material:
                    const conditions = await transaction.any(`DELETE FROM public.pricing_conditions WHERE created_by = $1 AND $2 = ANY(materials)
                        RETURNING id;`, [owner, id]);
                    const deletedIDs = conditions.map((condition) => condition.id);
                    transaction.none(`DELETE FROM public.pricing_rules
                                        WHERE created_by = $1
                                        AND EXISTS (
                                            SELECT 1
                                            FROM unnest(conditions) AS condition_id
                                            WHERE condition_id = ANY($2::UUID[])
                                        );`, [owner, deletedIDs]);

                    // deleting the material itself:
                    transaction.none('DELETE FROM public.materials WHERE id = $1 AND created_by = $2', [id, owner]);
                });
                return res.status(200).json({ message: "material deleted successfully" });
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({ message: "failed to delete material" });
            }
        });

    // middleware on validating user inputs on materials:
    router.param("id", async (req, res, next, id) => {
        if (id !== "new") {
            const existenceValidation = await validateInstances([id], req.sessionEmail, "materials", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
        }

        // validate the payload on the definition of such material:
        if (req.method === "POST" || req.method === "PUT") {
            const { en_name, ch_name, description } = req.body;
            validations = [
                validateName(en_name),
                validateName(ch_name),
                validateDescriptions(description)];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });

    return router;
}