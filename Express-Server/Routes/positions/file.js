const express = require('express');
const router = express.Router();
const { 
    validateEmployeePosition,
    validateName,
    validateDescriptions,
} = require ('../../utils/Validator');
const { 
    mapDefaultQueryColumns,
    mapFromClause,
    mapQueryPrefix
 } = require('../../utils/Formatter');

module.exports = (db) => {
    // router for a specific position
    router.route("/:id")
    .get(async (req, res) => {
        const owner = req.sessionEmail;
        const id = req.params.id;
        let query = "SELECT";
        try {
            query += ` ${mapDefaultQueryColumns("positions", true)}`;
            query += ` ${mapFromClause("positions")}`;
            query += ` WHERE ${mapQueryPrefix("positions")}.id = $1 AND ${mapQueryPrefix("positions")}.created_by = $2;`;
            const position = await db.oneOrNone(query, [id, owner]);
            return res.status(200).json({ position: position });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: "failed to fetch position", position: null });
        }};
    })
    .put(async (req, res) => {
        const owner = req.sessionEmail;
        const id = req.params.id;
        const { name, descriptions } = req.body;
        try{
            await db.none('UPDATE public.positions SET name = $1, descriptions = $2 WHERE id = $3 AND created_by = $4', 
                [name, descriptions, id, owner]);
            return res.status(200).json({ message: 'Position updated successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: "failed to update position" });
        }}
    })
    .post(async (req, res) => {
        const { name, descriptions } = req.body;
        try{
            const newPosition = await db.oneOrNone('INSERT INTO public.positions (name, descriptions, created_by) VALUES ($1, $2, $3) RETURNING id', 
                [name, descriptions, req.sessionEmail]);
            return res.status(200).json({ id: newPosition.id, message: 'Position created successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ id : null, message: "failed to create position" });
        }}
    })
    .delete(async (req, res) => {
        const owner = req.sessionEmail;
        const id = req.params.id;
        try{
            await db.none('UPDATE public.employees SET position = NULL WHERE position = $1 AND created_by = $2', [id, owner]);
            await db.none('DELETE FROM public.positions WHERE id = $1 AND created_by = $2', [id, owner]);
            return res.status(200).json({ message: 'Position deleted successfully' });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: "failed to delete position" });
        }}
    });

    router.param('id', async (req, res, next, id) => {
        // validate existing users
        if (id !== "new"){
            const idValidation = await validateEmployeePosition(id, db);
            if (!idValidation.valid) return res.status(400).json({ message: idValidation.message });
            if (req.method === "POST") return res.status(400).json({ message: "Invalid ID" });
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