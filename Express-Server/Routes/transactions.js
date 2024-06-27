const express = require('express');
const router = express.Router();
const {
    validateName,
    validateTransactionStatus,
    validateNumeric,
    validateDescriptions,
    validateInstances
} = require('../utils/Validator');

module.exports = (db) => {
    // route on obtaining all the transactions
    router.route("/")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            try {
                const transactions = await db.any('SELECT * FROM public.transactions WHERE created_by = $1 ORDER BY modified_date DESC', [owner]);
                return res.status(200).json({ transactions: transactions });
            }
            catch {
                (error) => {
                    return res.status(500).json({ error: error, transactions: null });
                }
            }
        });
    
    // Grabing all the relevant details for a specific transaction
    router.route("/:id")
        .get(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            try {
                const transaction = await db.oneOrNone('SELECT * FROM public.transactions WHERE id = $1 AND created_by = $2', 
                    [id, owner]);
                if (!transaction) return res.status(404).json({ error: "Transaction not found" });

                // Preparing queries to run concurrently
                const productQuery = db.oneOrNone('SELECT id, ch_name, en_name FROM public.products WHERE id = $1 AND created_by = $2', 
                    [transaction.product, owner]);
                const materialsQuery = db.any('SELECT id, ch_name, en_name FROM public.materials WHERE created_by = $1 AND id = ANY($2::uuid[])', 
                    [owner, transaction.materials]);

                let companyQuery = Promise.resolve(null);
                let clientQuery = Promise.resolve(null);

                if (transaction.company) {
                    companyQuery = db.oneOrNone('SELECT id, full_name, email, tax_number FROM public.companies WHERE id = $1 AND created_by = $2', 
                        [transaction.company, owner]);
                }
                if (transaction.client) {
                    clientQuery = db.oneOrNone('SELECT id, full_name, email, phone, wechat_contact, qq_contact FROM public.clients WHERE id = $1 AND created_by = $2', 
                        [transaction.client, owner]);
                }
                const employeesQuery = db.any('SELECT e.* FROM public.employees as e LEFT JOIN public.positions as p ON e.position = p.id WHERE e.created_by = $1 AND e.id = ANY($2::uuid[])', 
                    [owner, transaction.employee]);
                const addressesQuery = db.oneOrNone('SELECT * FROM public.addresses WHERE id = ANY($1::uuid[]) AND created_by = $2', [transaction.addresses, owner]);

                // Running all queries concurrently
                const [product, materials, company, client, employees, addresses] = await Promise.all(
                    [productQuery, materialsQuery, companyQuery, clientQuery, employeesQuery, addressesQuery]);

                // Assigning the results to the transaction object
                transaction.product = product;
                transaction.materials = materials;
                transaction.company = company;
                transaction.client = client;
                transaction.employee = employees;
                transaction.addresses = addresses;

                return res.status(200).json({ transaction: transaction });
            } catch (error) {
                return res.status(500).json({ message: "failed to fetch transaction" });
            }
        })
        .put(async (req, res) => {
            const owner = req.sessionEmail;
            const id = req.params.id;
            console.log("checked")
            try{
                await db.none(`UPDATE public.transactions SET modified_date = NOW(),
                    name = $1,
                    status = $2,
                    quantity = $3,
                    price_per_unit = $4,
                    amount = $5,
                    note = $6,
                    colour = $7,
                    width = $8,
                    height = $9,
                    length = $10,
                    size = $11,
                    en_unit = $12,
                    ch_unit = $13,
                    product = $14::uuid,
                    materials = $15::uuid[],
                    company = $16::uuid,
                    client = $17::uuid,
                    employee = $18::uuid[],
                    addresses = $19::uuid[]
                    WHERE id = $20 AND created_by = $21`, [
                        req.body.name,
                        req.body.status,
                        req.body.quantity,
                        req.body.price_per_unit,
                        req.body.amount,
                        req.body.note,
                        req.body.colour,
                        req.body.width,
                        req.body.height,
                        req.body.length,
                        req.body.size,
                        req.body.en_unit,
                        req.body.ch_unit,
                        req.body.product,
                        req.body.materials,
                        req.body.company,
                        req.body.client,
                        req.body.employee,
                        req.body.addresses,
                        id,
                        owner
                    ]);
                return res.status(200).json({ message: "transaction updated successfully" });
            }
            catch(error) {
                console.log(error);
                return res.status(500).json({ message: "failed to update transaction" });
            }
        })
        .post(async (req, res) => {

        })
        .delete(async (req, res) => {

        });
    
    // middleare for user input validations:
    router.param("id", async (req, res, next, id) => {
        const owner = req.sessionEmail;
        if (id !== "new") {
            const existenceValidation = await validateInstances([id], owner, "transactions", db);
            if (!existenceValidation.valid) return res.status(404).json({ message: existenceValidation.message });
        }

        // validating dat payload
        if (req.method === "PUT" || req.method === "POST") {

            // Prevent any contractdicting information:
            if (!req.body.product || (!req.body.company && !req.body.client)) {
                return res.status(400).json({ message: "product and company or client are required" });
            }

            const validations = [
                validateName(req.body.name),
                validateTransactionStatus(req.body.status),
                validateNumeric(req.body.quantity, "quantity"),
                validateNumeric(req.body.price_per_unit, "price per unit"),
                validateNumeric(req.body.amount, "amount"),
                validateNumeric(req.body.width, "width"),
                validateNumeric(req.body.height, "height"),
                validateNumeric(req.body.length, "height"),
                validateNumeric(req.body.size, "size"),
                validateName(req.body.colour),
                validateDescriptions(req.body.note),
                validateName(req.body.en_unit),
                validateName(req.body.ch_unit),
                await validateInstances([req.body.product], owner, "products", db),
                await validateInstances(req.body.materials, owner, "materials", db), // assume list input
                await validateInstances(req.body.company ? [req.body.company] : null, owner, "companies", db),
                await validateInstances(req.body.client ? [req.body.client]: null, owner, "clients", db),
                await validateInstances(req.body.employee, owner, "employees", db), // assume list input
                await validateInstances(req.body.addresses, owner, "addresses", db), // assume list input
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
        }
        next();
    });

    return router;
}







// Mind to set up validation checks on the inputs of multiple addresses, employees and materials (existing ones)
