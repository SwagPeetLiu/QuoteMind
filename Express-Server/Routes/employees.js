require("dotenv").config();
const express = require('express');
const router = express.Router();
const { 
    validateEmail,
    validateName,
    validatePhone,
    validateSocialContacts,
    validateInstances,
    validateEmployeePosition,
    validateInteger,
    validateColumnName
} = require ('../utils/Validator');
const { getSearchTerm } = require('../utils/Formatter');
const { getConfiguration } = require("../utils/Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;

module.exports = (db) => {
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
                    const targetValidation = await validateColumnName(target, "employees", keyword, db);
                    if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });
                    const type = targetValidation.type;

                    searchQuery = getSearchTerm("employees",target, keyword, type);
                    if (page == 1){
                        const count = await db.oneOrNone(`
                            SELECT COUNT(e.*) AS count 
                            FROM public.employees AS e
                            WHERE e.created_by = $1 AND ${searchQuery};
                        `, [owner]);
                        response.count = parseInt(count.count);
                    }
                }

                const employees = await db.any(`
                    SELECT e.id, e.name, e.phone, e.wechat_contact, e.qq_contact,
                    p.name AS position
                    FROM public.employees e
                    LEFT JOIN public.positions p ON e.position = p.id
                    WHERE e.created_by = $1 ${searched? `AND ${searchQuery}` : ""}
                    ORDER BY e.name ASC
                    LIMIT $2 OFFSET $3;
                `, [owner, limit, offset]);
                return res.status(200).json({ ...response, page: page, employees: employees });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ page: page, employees: null, message: "failed to fetch employees" });
            }
        });

    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const employee = await db.oneOrNone(`
                    SELECT e.id, e.name, e.email, e.phone, e.wechat_contact, e.qq_contact,
                    p.name AS position_name, p.descriptions AS position_description
                    FROM public.employees e
                    LEFT JOIN public.positions p ON e.position = p.id
                    WHERE e.created_by = $1 AND e.id = $2
                    ORDER BY e.name ASC;
                `, [owner, id]);
                return res.status(200).json({ employee: employee });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ employee: null, message: "failed to fetch employee" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            const { name, email, wechat_contact, qq_contact, phone, position } = req.body;
            try {
                await db.none(`
                    UPDATE public.employees
                    SET name = $1, email = $2, wechat_contact = $3, qq_contact = $4, phone = $5, position = $6
                    WHERE id = $7 AND created_by = $8
                `, [name, email, wechat_contact, qq_contact, phone, position, id, owner]);
                return res.status(200).json({ message: "employee updated successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: "failed to update employee" });
            }
        })
        .post(async (req, res) => {
            const owner = req.sessionEmail;
            const { name, email, wechat_contact, qq_contact, phone, position } = req.body;
            try {
                const newEmployee = await db.oneOrNone(`
                    INSERT INTO public.employees (name, email, wechat_contact, qq_contact, phone, position, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                `, [name, email, wechat_contact, qq_contact, phone, position, owner]);
                return res.status(200).json({ id : newEmployee.id, message: "employee created successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ id : null, message: "failed to create employee" });
            }
        })
        .delete(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                db.tx(async (transaction) => {
                    // remove all referneces in the transaction table (not deleting the transaction)
                    await transaction.none(` 
                        UPDATE public.transactions
                        SET employee = array_remove(employee, $1) WHERE created_by = $2`, [id, owner]);
                    
                    // delete the employee record
                    await transaction.none('DELETE FROM public.employees WHERE id = $1 AND created_by = $2', [id, owner]);
                })
                return res.status(200).json({ message: "employee deleted successfully" });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ message: "failed to delete employee" });
            }
        });
    
    // Middleware on validating the user inputted employee information
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;
        if (id !== "new"){
            const existenceValidation = await validateInstances([id], owner, "employees", db);
            if (!existenceValidation.valid) return res.status(400).json({ message: existenceValidation.message });
        }
        
        // check for employee informations:
        if (req.method === "PUT" || req.method === "POST") {
            const {name, email, wechat_contact, qq_contact, phone, position} = req.body;
            const validations = [
                validateName(name),
                validateEmail(email),
                validatePhone(phone),
                validateSocialContacts(wechat_contact),
                validateSocialContacts(qq_contact),
                await validateEmployeePosition(position, db)
            ];
            for (const validation of validations) {
                if (!validation.valid) {
                    return res.status(400).json({ message: validation.message });
                }
            }
        }
        next();
    });
    return router;
}