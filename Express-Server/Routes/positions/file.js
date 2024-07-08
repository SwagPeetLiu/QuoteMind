const express = require('express');
const router = express.Router();
const { 
    validateEmployeePosition,
    validateName,
    validateDescriptions,
    validateInteger,
    validateColumnName
} = require ('../../utils/Validator');
const { getSearchTerm } = require('../../utils/Formatter');
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

module.exports = (db) => {
    // fetch all positions on employee creations
    router.route("/")
    .get(async (req, res) => {
        const owner = req.sessionEmail;
        let { target, keyword, page } = req.query;
        let searchQuery;
        const response = {};

        // validate search query format:
        const searched = (!target && !keyword) ? false : true;
        if (searched) {
            if (!target || !keyword) return res.status(400).json({ message: "search query is invalid" });
            const targetValidation = await validateColumnName(target, "positions", keyword, db);
            if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
            const type = targetValidation.type;
            searchQuery = getSearchTerm("positions", target, keyword, type);
        }

        try{
            // validate page number (if no page defined, then counts are required)
            if (page){
                page = parseInt(page);
                if (!page) return res.status(400).json({ message: "page number is invalid" });
                const pageValidation = validateInteger(page, "page number");
                if (!pageValidation.valid) return res.status(400).json({ message: pageValidation.message });
            }
            // setting up the query counts if the serach is a fresh start
            else{
                page = 1;
                const count = await db.oneOrNone(`
                    SELECT COUNT(p.*) AS count 
                    FROM public.positions AS p
                    WHERE p.created_by = $1 ${searched?`AND ${searchQuery}`:''};
                `, [owner]);
                response.count = parseInt(count.count);
            }
            response.searched = searched;
            response.page = page;
            const limit = pageSize * page;
            const offset = (page - 1) * pageSize;

            const positions = await db.any(`
                SELECT p.* 
                FROM public.positions AS p
                WHERE p.created_by = $1 ${searched?`AND ${searchQuery}`:''}
                ORDER BY p.name ASC
                LIMIT $2 OFFSET $3;`, [owner, limit, offset]);
            return res.status(200).json({ ...response, positions: positions });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ ...response, message: "failed to fetch positions" });
        }}
    });

    // router for a specific position
    router.route("/:id")
    .get(async (req, res) => {
        const owner = req.sessionEmail;
        const id = req.params.id;
        try{
            const position = await db.oneOrNone('SELECT * FROM public.positions WHERE id = $1 AND created_by = $2', 
                [id, owner]);
            return res.status(200).json({ position: position });
        }
        catch{(error) => {
            console.error(error);
            return res.status(500).json({ message: error, position: null });
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
            return res.status(500).json({ message: error });
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
            return res.status(500).json({ id : null, message: error });
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
            return res.status(500).json({ message: error });
        }}
    });

    // get all the related employees for a specific position
    router.route("/:id/employees")
    .get(async (req, res) => {
        const id = req.params.id;
        try{
            const employees = await db.any(`
                SELECT id, name, phone, wechat_contact, qq_contact 
                FROM public.employees 
                WHERE position = $1 AND created_by = $2
                ORDER BY name ASC;
            `, [id, req.sessionEmail]);
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