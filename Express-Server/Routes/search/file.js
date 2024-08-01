// route used to enable the searches in the platform
const router = require("express").Router();
const {
    validateTableExistence,
    validateAndPreProcessQuery
} = require("../../utils/Validator");
const { generateQuery } = require("../../utils/Formatter");

module.exports = (db, dbReferences) => {

    // routes to getting all the valid search targets for an instance(table):
    router.route("/targets")
        .get( (req, res) => {
            if (!dbReferences) return res.status(500).json({ message: "failed to get search targets", targets: null });
            return res.status(200).json({ targets: dbReferences });
        });
    
    // routes to support maximised searchabilities in the platform:
    router.route("/:tableName")
        .post(async (req, res) => {
            const tableName = req.params.tableName;
            try{
                // try to construct the query
                let { searchQuery, page } = req.body;
                const query = generateQuery(searchQuery, tableName, page, req.sessionEmail);

                // run the query to provide searched results
                const result = await db.any(query.search.query, query.search.parameters);
                let count;
                if (query.count.query !== "") {count = await db.oneOrNone(query.count.query, query.count.parameters);}
                console.log(count);
                return res.status(200).json({ results: result, count: count ? parseInt(count.count): null});
            }
            catch(error){
                console.error(error);
                return res.status(500).json({ message: `failed to search for ${tableName}`, searchQuery: null });
            }
        });
    
    router.param("tableName", async (req, res, next, tableName) => {

        // valudate the input of tableName (must be valid & not forbidden)
        if (!tableName) return res.status(400).json({ message: "invalid table name" });
        const targetValidation = validateTableExistence(tableName, dbReferences);
        if (!targetValidation.valid) return res.status(400).json({ message: targetValidation.message });

        // validate the search query:
        const queryValidation = validateAndPreProcessQuery(req.body, tableName, dbReferences);
        if (!queryValidation.valid) return res.status(400).json({ message: queryValidation.message });
        req.body.searchQuery = queryValidation.searchQuery;
        next();
    });
    return router;
}