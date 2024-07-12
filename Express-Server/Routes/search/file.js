// route used to enable the searches in the platform
const router = require("express").Router();
const {
    validateTableExistence,
    validateString
} = require("../../utils/Validator");
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();
const forbiddenTargets = config.search.forbiddenTargets;

module.exports = (db) => {

    // routes to getting all the valid search targets for an instance(table):
    router.route("/target/:tableName")
        .get(async (req, res) => {
            const tableName = req.params.tableName;
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
                return res.status(500).json({ message: "failed to get search targets", targets: null });
            }
        });
    
    // valudate the input of tableName
    router.param("tableName", async (req, res, next, tableName) => {
        if (!tableName) return res.status(400).json({ message: "invalid table name" });
        const stringValdiation = validateString(tableName);
        if (!stringValdiation.valid) return res.status(400).json({ message: "invalid table name" });

        if (config.counter.forbiddenTargets.includes(tableName.toLowerCase())) {
            return res.status(400).json({ message: "invalid target" });
        }
        validTargets = await validateTableExistence(tableName, db);
        if (!validTargets.valid) return res.status(400).json({ message: validTargets.message });
        next();
    });
    return router;
}