// route used to enable the searches in the platform
const router = require("express").Router();
const {
    validateTableExistence
} = require("../../utils/Validator");
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();
const forbiddenTargets = config.search.forbiddenTargets;

module.exports = (db) => {
    // routes to getting all the valid search targets for an instance(table):
    router.route("/target/:tableName")
        .get(async (req, res) => {
            
            // validate table name
            const tableName = req.params.tableName;
            const validation = await validateTableExistence(tableName, db);
            if (!validation.valid) return res.status(400).json({ message: validation.message });
            
            try {
                const targets = await db.any(`
                    SELECT column_name as target, data_type as type
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1 
                    AND column_name NOT IN ($2:csv);
                    `, [tableName, forbiddenTargets]);
                return res.status(200).json({ targets: targets });
            }
            catch (error){
                console.error(error);
                return res.status(500).json({ message: error, targets: null });
            }
        });

    return router;
}