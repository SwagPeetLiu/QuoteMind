require("dotenv").config();
const express = require('express');
const router = express.Router();
const { 
    validateEmail,
    validateName,
    validatePhone,
    validateSocialContacts,
    validateInstances,
    validateEmployeePosition
} = require ('../utils/Validator');

module.exports = (db) => {
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const employees = await db.any(`
                    SELECT e.*, p.name AS position_name, p.descriptions AS position_description
                    FROM public.employees e
                    LEFT JOIN public.positions p ON e.position = p.id
                    WHERE e.created_by = $1
                    ORDER BY e.name ASC;
                `, [owner]);
                return res.status(200).json({ employees: employees });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ employees: null, message: "failed to fetch employees" });
            }
        });

    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const employee = await db.oneOrNone(`
                    SELECT e.*, p.name AS position_name, p.descriptions AS position_description
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
                    // remove all referneces in the transaction table:
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