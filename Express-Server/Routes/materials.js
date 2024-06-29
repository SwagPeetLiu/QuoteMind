require("dotenv").config();
const express = require('express');
const router = express.Router();
const {
    validateInstances,
    validateName,
    validateDescriptions
} = require('../utils/Validator');

module.exports = (db) => {
    // fetching all the materials
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const materials = await db.any('SELECT * FROM public.materials WHERE created_by = $1 ORDER BY ch_name ASC', [owner]);
                return res.status(200).json({ materials: materials });
            }
            catch {
                (error) => {
                    console.error(error);
                    return res.status(500).json({ message: error, materials: null });
                }
            }
        });

    // fetching a specific material
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const material = await db.oneOrNone('SELECT * FROM public.materials WHERE id = $1 and created_by = $2', [id, owner]);
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
                    // deleting the related transactions:
                    transaction.none(`UPDATE public.transactions SET materials = array_remove(materials, $1) WHERE created_by = $2`, [id, owner]);

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