require("dotenv").config();
const express = require('express');
const validator = require('validator');
const router = express.Router();
const { 
    validateEmployeePosition,
    validateName,
    validateDescriptions
} = require ('../utils/Validator');

module.exports = (db) => {
    // fetch all positions on employee creations
    router.route("/")
    .get(async (req, res) => {
        try{
            const positions = await db.any('SELECT * FROM public.positions ORDER BY name ASC');
            return res.status(200).json({ positions: positions });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error, positions: null });
        }}
    });

    // router for a specific position
    router.route("/:id")
    .get(async (req, res) => {
        const id = req.params.id;
        try{
            const position = await db.oneOrNone('SELECT * FROM public.positions WHERE id = $1', [id]);
            return res.status(200).json({ position: position });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error, position: null });
        }};
    })
    .put(async (req, res) => {
        const id = req.params.id;
        const { name, descriptions } = req.body;
        try{
            await db.none('UPDATE public.positions SET name = $1, descriptions = $2 WHERE id = $3', [name, descriptions, id]);
            return res.status(200).json({ message: 'Position updated successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error });
        }}
    })
    .post(async (req, res) => {
        const { name, descriptions } = req.body;
        try{
            const newPosition = await db.oneOrNone('INSERT INTO public.positions (name, descriptions) VALUES ($1, $2) RETURNING id', [name, descriptions]);
            return res.status(201).json({ id: newPosition.id, message: 'Position created successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ id : null, message: error });
        }}
    })
    .delete(async (req, res) => {
        const id = req.params.id;
        try{
            await db.none('DELETE FROM public.positions WHERE id = $1', [id]);
            return res.status(200).json({ message: 'Position deleted successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error });
        }}
    });

    // get all the related employees for a specific position
    router.route("/:id/employees")
    .get(async (req, res) => {
        const id = req.params.id;
        try{
            const employees = await db.any('SELECT * FROM public.employees WHERE position = $1 ORDER BY name ASC', [id]);
            return res.status(200).json({ employees: employees });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error, employees: null });
        }}
    });

    router.param('id', async (req, res, next, id) => {
        // validate existing users
        if (id !== "new"){
            const idValidation = await validateEmployeePosition(id, db);
            if (!idValidation.valid) return res.status(400).json({ message: idValidation.message });
        }

        // validating content body:
        if ((req.method === "PUT" || req.method === "POST") && (!req.url.includes("employees"))) {
            const { name, descriptions } = req.body;
            const validations = [validateName(name), validateDescriptions(descriptions)];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });

    return router;
}