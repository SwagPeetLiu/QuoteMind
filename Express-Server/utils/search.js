// route used to enable the searches in the platform
const router = require("express").Router();
const { getConfiguration } = require("./Configurator");
const config = getConfiguration();
const pageSize = config.search.pageSize;
const {
    valdiateTable,
    validateColumnName,
    validateSearchKey,
    validateInteger
} = require("./Validator");

module.exports = (db) => {
    // routes to getting all the valid search targets for an instance(table):
    router.route("/target/:tableName")
        .get(async (req, res) => {
            // validate table name
            const tableName = req.params.tableName;
            const validation = await valdiateTable(tableName, db);
            if (!validation.valid) return res.status(400).json({ message: validation.message });

            try {
                const targets = await db.any(`
                    SELECT column_name as target, data_type as type
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1 AND column_name != 'created_by';
                    `, [tableName]);
                return res.status(200).json({ targets: targets });
            }
            catch (error){
                console.error(error);
                return res.status(500).json({ message: error, targets: null });
            }
        });
    
    // route used to search for a specific table's speicifc keywords:
    router.route("/target")
        .post(async (req, res) => {
            // query validations:
            const { tableName, target, keyword, page} = req.body;
            if (!tableName || !target || !keyword || !page) return res.status(400).json({ message: "invalid request" });

            // Table validity & page settings
            const validations = [
                await valdiateTable(tableName, db),
                validateColumnName(target, db),
                validateInteger(page, "page")
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }

            // Validate target:
            const targetDetail = await db.any(`
                SELECT column_name as target, data_type as type
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2;
                `, [tableName, target]);
            if (!targetDetail) return res.status(400).json({ message: "invalid target" });
            
            // Validate keyword:
            const keywordValidation = validateSearchKey(keyword, targetDetail.type);
            if (!keywordValidation.valid) return res.status(400).json({ message: keywordValidation.message });
            
            // getting the search results:
            const results = await db
            pageSize


        });

    return router;
}