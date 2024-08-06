const express = require('express');
const router = express.Router();
const { validateString, validateTableExistence} = require('../../utils/Validator');
const { getConfiguration } = require("../../utils/Configurator");
const config = getConfiguration();

module.exports = (db, dbReferences) => {
    router.route("/:target")
        .get(async (req, res) => {
            const target = req.params.target;
            const owner = req.sessionEmail;
            try{
                const counts = await db.oneOrNone(`SELECT COUNT(*) FROM public.${target} WHERE created_by = $1`, [owner]);
                return res.status(200).json({ counts: parseInt(counts.count) });
            }
            catch(error){
                console.error(error);
                return res.status(500).json({ message: "failed to fetch counts" });
            }

        });

    router.param("target", async (req, res, next, target) => {
        if (!target) return res.status(400).json({ message: "invalid target" });
        const stringValdiation = validateString(target);
        if (!stringValdiation.valid) return res.status(400).json({ message: "invalid target" });

        // check if the target exsits:
        const validTargets = await validateTableExistence(target, dbReferences);
        if (!validTargets.valid) return res.status(400).json({ message: validTargets.message });
        next();
    });
    return router;
}