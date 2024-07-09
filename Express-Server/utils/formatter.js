function getSearchTerm(table, target, keyword, type){
    let whereClause = "";
    // deals with normal id searching:
    if (target == "id" && type.toLowerCase() == "uuid"){
        whereClause = `${mapQueryPrefix(table)}.${target}::text LIKE '%${keyword}%'`;
    }
    // FK references to other tables:
    else if (target !== "id" && type.toLowerCase() == "uuid"){
        const fkName = mapFKName(target);
        whereClause = `${mapQueryPrefix(table)}.${target} IN(
            SELECT id FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
            WHERE LOWER(${fkName.name}) LIKE '%${keyword.toLowerCase()}%'
            )`;
    }
    // deals with search thorugh list of UUIDs:
    else if (type == "ARRAY"){
        const fkName = mapFKName(target);
        whereClause = `
            EXISTS (
                SELECT 1
                FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
                WHERE ${mapQueryPrefix(fkName.table)}.id = ANY(${mapQueryPrefix(table)}.${target})
                AND LOWER(${fkName.name}) LIKE '%${keyword.toLowerCase()}%'
            )
        `;
    }
    // deals with normal string searching:
    else if (type == "USER-DEFINED" || type.toLowerCase().includes("character")){
        whereClause = `LOWER(${mapQueryPrefix(table)}.${target}::text) LIKE '%${keyword.toLowerCase()}%'`;
    }
    // deals with numeric searchings with units
    else if (type.toLowerCase() == "numeric" || type.toLowerCase() == "integer"){
        const containsUnit = /\D/.test(keyword);
        if (target.toLowerCase() == "quantity"){
            whereClause = `LOWER(CONCAT(${mapQueryPrefix(table)}.${target}, ${mapQueryPrefix(table)}.quantity_unit)) = LOWER('${keyword}')
                           ${!containsUnit ? `OR ${mapQueryPrefix(table)}.${target} = ${parseInt(keyword)}` : ""}`; // account for quantity inputs only
        }
        else if (target.toLowerCase() == "size"){
            whereClause = `LOWER(CONCAT(TRIM(TRAILING '0' FROM ${mapQueryPrefix(table)}.${target}::text),${mapQueryPrefix(table)}.size_unit)) = LOWER('${keyword}')
                           ${!containsUnit ? `OR ${mapQueryPrefix(table)}.${target} = ${parseInt(keyword)}` : ""}`; // account for quantity inputs only
        }
        else if (target.toLowerCase() == "width" || target.toLowerCase() == "height" || target.toLowerCase() == "length"){
            whereClause = `(
            LOWER(CONCAT(TRIM(TRAILING '0' FROM ${mapQueryPrefix(table)}.${target}::text),${mapQueryPrefix(table)}.en_unit)) = LOWER('${keyword}')
            OR
            LOWER(CONCAT(TRIM(TRAILING '0' FROM ${mapQueryPrefix(table)}.${target}::text),${mapQueryPrefix(table)}.ch_unit)) = LOWER('%${keyword}')
            ${!containsUnit ? `OR ${mapQueryPrefix(table)}.${target} = ${parseInt(keyword)}` : ""}
            )`;
        }
        else {whereClause = `${mapQueryPrefix(table)}.${target} = ${keyword}`;}
    }
    else{
        whereClause = `TRUE`;
    }
    return whereClause;
}

function mapFKName (target){
    switch (target) {
        case "company":
            return {table: "companies", name: "co.full_name"};
        case "client":
            return {table: "clients", name: "c.full_name"};
        case "position":
            return {table: "positions", name: "p.name"};
        case "materials":
            return {table: "materials", name: "CONCAT(m.ch_name, ' ', m.en_name)"};
        case "product":
            return {table: "products", name: "CONCAT(p.ch_name, ' ', p.en_name)"};
        case "employee":
            return {table: "employees", name: "e.name"};
        default:
            return null;
    }
}

function mapQueryPrefix(table){
    switch (table) {
        case "companies":
            return "co";
        case "clients":
            return "c";
        case "positions":
            return "p";
        case "materials":
            return "m";
        case "products":
            return "p";
        case "employees":
            return "e";
        case "addresses":
            return "a";
        case "pricing_conditions":
            return "cond";
        case "pricing_rules":
            return "r";
        case "transactions":
            return "t";
        default:
            return null;
    }
}

module.exports = {
    getSearchTerm
}