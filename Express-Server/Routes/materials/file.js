require("dotenv").config();
const express = require('express');
const router = express.Router();
const {
    validateInstances,
    validateName,
    validateDescriptions,
} = require('../../utils/Validator');
const { 
    mapDefaultQueryColumns,
    mapFromClause,
    mapQueryPrefix
 } = require('../../utils/Formatter');

module.exports = (db) => {

    // fetching a specific material
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            let query = "SELECT";
            try {
                query += ` ${mapDefaultQueryColumns("materials", true)}`;
                query += ` ${mapFromClause("materials")}`;
                query += ` WHERE ${mapQueryPrefix("materials")}.id = $1 AND ${mapQueryPrefix("materials")}.created_by = $2;`;
                const material = await db.oneOrNone(query, [id, owner]);
                return res.status(200).json({ material: material });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: "failed to count", material: null });
                }
            }
        })
        .put(async (req, res) => {
            const id = req.params.id;
            const owner = req.sessionEmail;
            const { en_name, ch_name, descriptions } = req.body;
            try{
                await db.none('UPDATE public.materials SET en_name = $1, ch_name = $2, descriptions = $3 WHERE id = $4 AND created_by = $5'
                    , [en_name, ch_name, descriptions, id, owner]);
                return res.status(200).json({ message: "material updated successfully" });
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({ message: "failed to update material" });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { en_name, ch_name, descriptions } = req.body;
            try{
                const newMaterial = await db.oneOrNone('INSERT INTO public.materials (en_name, ch_name, descriptions, created_by) VALUES ($1, $2, $3, $4) RETURNING id'
                    , [en_name, ch_name, descriptions, owner]);
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
                await db.tx(async (transaction) => {
                    // remove the references of material in transactions:
                    await transaction.none(`UPDATE public.transactions 
                        SET materials = CASE 
                            WHEN array_length(materials, 1) = 1 THEN NULL 
                            ELSE array_remove(materials, $1) 
                            END
                        WHERE created_by = $2 AND $1 = ANY(materials)
                    `, [id, owner]);

                    // deleting any pricing references to the material:
                    await transaction.none(`DELETE FROM public.pricings WHERE created_by = $1 AND $2 = ANY(materials);`, [owner, id]);

                    // deleting the material itself:
                    await transaction.none('DELETE FROM public.materials WHERE id = $1 AND created_by = $2', [id, owner]);
                    return res.status(200).json({ message: "material deleted successfully" });
                });
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
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
        }

        // validate the payload on the definition of such material:
        if (req.method === "POST" || req.method === "PUT") {
            const { en_name, ch_name, descriptions } = req.body;
            validations = [
                validateName(en_name),
                validateName(ch_name),
                validateDescriptions(descriptions)];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });

    return router;
}