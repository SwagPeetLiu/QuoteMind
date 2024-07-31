// route used to enable the searches in the platform
const router = require("express").Router();
const {
    validateTableExistence,
    validateString
} = require("../../utils/Validator");
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();
const forbiddenTargets = config.search.forbiddenTargets;
const { generateQuery } = require("../../utils/Formatter");

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
    
    // routes to support maximised searchabilities in the platform:
    router.route("/:tableName")
        .post(async (req, res) => {
            const tableName = req.params.tableName;
            let { searchQuery, page } = req.body;
            try{
                const query = generateQuery(searchQuery, tableName, page, req.sessionEmail);
                const result = await db.any(query.search.query, query.search.parameters);
                return res.status(200).json({ result: result });
            }
            catch(error){
                console.error(error);
                return res.status(500).json({ message: "failed to get search query", searchQuery: null });
            }
        });
    
    router.param("tableName", async (req, res, next, tableName) => {

        // valudate the input of tableName
        if (!tableName) return res.status(400).json({ message: "invalid table name" });
        const stringValdiation = validateString(tableName);
        if (!stringValdiation.valid) return res.status(400).json({ message: "invalid table name" });

        if (config.counter.forbiddenTargets.includes(tableName.toLowerCase())) {
            return res.status(400).json({ message: "invalid target" });
        }
        validTargets = await validateTableExistence(tableName, db);
        if (!validTargets.valid) return res.status(400).json({ message: validTargets.message });

        // validate the search query:
        
        next();
    });
    return router;
}