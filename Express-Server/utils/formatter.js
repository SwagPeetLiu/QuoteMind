const { getConfiguration } = require("./Configurator");
const pageSize = getConfiguration().search.pageSize;

/*
* ==============================================================================================
* Formatter acts the single source of truth for the formatting of entitye query acros the server
* ================================================================================================
*/

/*
* generation of the query assuming the query is validated already:
*  - using valdiated and type specified post-processed query
*/
function generateQuery(query, table, page, owner) {
    let countQuery = { query: "", parameters: [] };
    let result = { query: "SELECT", parameters: [] };

    // Attaching the fields based on the specifications of the user or mapping defaults
    if (query.fields == "default" || (Array.isArray(query.fields) && query.fields.length == 0)) {
        result.query += ` ${mapDefaultQueryColumns(table)}`;
    }
    else{
        result.query += ` ${mapSpecifiedQueryColumns(table, query.fields)}`;
    }
    console.log("added fields",result);

    // Attaching the From clause:
    result.query += ` ${generateFromClause(table)}`;
    console.log("added from clause", result);

    // attaching the where clause:
    result.query += ` WHERE ${mapQueryPrefix(table)}.created_by = $${result.parameters.length + 1}`;
    result.parameters.push(owner);
    result.query += generateWhereClause(table, query.whereClause, result);

    // attaching the group by clause:
    result.query += `${mapGroupByClause(table, query)}`;
    console.log(result);

    // attaching the order by clause:
    result.query += ` ${mapOrderByClause(table, query)}`;
    console.log(result);

    // attach the page limits, as well as another (using a nested query structure to ensure the 
    // count is accurate & representing the criteria of the group by clauses):
    if (!page) {
        page = 1;
        countQuery.query += `${mapCountQuery(table, query, owner, countQuery)}`;
        console.log("count query", countQuery);
    }
    result.query += ` ${generatePageLimits(page)}`;
    console.log(result);

    return { search: result, count: countQuery };
}

// function used to dynamically generate the count query based on the 
// specification of groupby clause or not
function mapCountQuery(table, query, owner, countQuery) {
    const groupByClause = mapGroupByClause(table, query);
    let cQuery = "";
    if (groupByClause) {
        cQuery += "SELECT COUNT(*) AS count FROM ("; // account for groupby clauses
    }
    cQuery += `SELECT COUNT(${mapQueryPrefix(table)}.id) FROM public.${table} AS ${mapQueryPrefix(table)}`;
    cQuery += ` WHERE ${mapQueryPrefix(table)}.created_by = $1`;
    countQuery.parameters.push(owner);
    cQuery += generateWhereClause(table, query.whereClause, countQuery);
    cQuery += `${groupByClause}`;
    cQuery += `${groupByClause ? ") AS subquery" : ""};`;
    return cQuery;
}

// function used to map the foregin search columns of related entities (e.g., searching a company
// of a client, then the server will autoamtically serach and map for the name of the client's company name)
function mapFKName(target) {
    switch (target) {
        case "company":
            return { table: "companies", name: "co.full_name" };
        case "client":
            return { table: "clients", name: "c.full_name" };
        case "position":
            return { table: "positions", name: "p.name" };
        case "materials":
            return { table: "materials", name: "CONCAT(m.ch_name, ' ', m.en_name)" };
        case "product":
            return { table: "products", name: "CONCAT(p.ch_name, ' ', p.en_name)" };
        case "employee":
            return { table: "employees", name: "e.name" };
        default:
            return null;
    }
}

// function used to map out the prefix of each table (for query combination unity)
function mapQueryPrefix(table) {
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

// function used to map out the default querying columns for each table
function mapDefaultQueryColumns(table) {
    switch (table) {

        case "companies":
            return `${mapQueryPrefix(table)}.id, 
                    ${mapQueryPrefix(table)}.full_name, 
                    ${mapQueryPrefix(table)}.email,
                    ${mapQueryPrefix(table)}.phone
                    `;

        case "clients":
            return `${mapQueryPrefix(table)}.id, 
                    ${mapQueryPrefix(table)}.full_name, 
                    ${mapQueryPrefix(table)}.email,
                    ${mapQueryPrefix(table)}.phone,
                    ${mapQueryPrefix(table)}.wechat_contact,
                    ${mapQueryPrefix(table)}.qq_contact,
                    (SELECT 
                        ${mapQueryPrefix("companies")}.full_name 
                        FROM public.companies ${mapQueryPrefix("companies")} 
                        WHERE ${mapQueryPrefix("companies")}.id = ${mapQueryPrefix(table)}.company
                    ) AS company
                    `;

        case "positions":
            return `
                ${mapQueryPrefix(table)}.id, 
                ${mapQueryPrefix(table)}.name,
                ${mapQueryPrefix(table)}.descriptions
            `;

        case "materials":
            return `
                ${mapQueryPrefix(table)}.id, 
                ${mapQueryPrefix(table)}.ch_name, 
                ${mapQueryPrefix(table)}.en_name
            `;

        case "products":
            return `
                ${mapQueryPrefix(table)}.id, 
                ${mapQueryPrefix(table)}.ch_name, 
                ${mapQueryPrefix(table)}.en_name
            `;

        case "employees":
            return `
                ${mapQueryPrefix(table)}.id,
                ${mapQueryPrefix(table)}.name,
                ${mapQueryPrefix(table)}.phone,
                ${mapQueryPrefix(table)}.wechat_contact,
                ${mapQueryPrefix(table)}.qq_contact,
                (
                    SELECT ${mapQueryPrefix("positions")}.name
                    FROM public.positions ${mapQueryPrefix("positions")} 
                    WHERE ${mapQueryPrefix("positions")}.id = ${mapQueryPrefix(table)}.position
                ) AS position
            `;

        case "pricing_conditions":
            return `
                ${mapQueryPrefix(table)}.id,
                ${mapQueryPrefix(table)}.quantity,
                ${mapQueryPrefix(table)}.quantity_unit,
                ${mapQueryPrefix(table)}.size,
                ${mapQueryPrefix(table)}.size_unit,
                ${mapQueryPrefix(table)}.colour,
                ${mapQueryPrefix(table)}.threshold,
                (SELECT jsonb_build_object(
                    'id', ${mapQueryPrefix("products")}.id,
                    'en_name', ${mapQueryPrefix("products")}.en_name,
                    'ch_name', ${mapQueryPrefix("products")}.ch_name
                )
                FROM public.products ${mapQueryPrefix("products")}
                WHERE ${mapQueryPrefix("products")}.id = ${mapQueryPrefix(table)}.product) as product,
                CASE
                    WHEN ${mapQueryPrefix(table)}.${mapQueryPrefix("materials")} IS NULL OR array_length(${mapQueryPrefix(table)}.materials, 1) = 0 THEN NULL
                        ELSE (
                            SELECT json_agg(
                                jsonb_build_object(
                                    'id', ${mapQueryPrefix("materials")}.id,
                                    'en_name', ${mapQueryPrefix("materials")}.en_name,
                                    'ch_name', ${mapQueryPrefix("materials")}.ch_name
                                )
                            )
                            FROM public.materials ${mapQueryPrefix("materials")}
                            WHERE ${mapQueryPrefix("materials")}.id = ANY(${mapQueryPrefix(table)}.materials)
                        )
                END as materials,
                (SELECT jsonb_build_object(
                    'id', ${mapQueryPrefix("clients")}.id,
                    'full_name', ${mapQueryPrefix("clients")}.full_name
                )
                FROM public.clients ${mapQueryPrefix("clients")}
                WHERE ${mapQueryPrefix("clients")}.id = ${mapQueryPrefix(table)}.client) as client,
                (SELECT jsonb_build_object(
                    'id', ${mapQueryPrefix("companies")}.id,
                    'full_name', ${mapQueryPrefix("companies")}.full_name
                )
                FROM public.companies ${mapQueryPrefix("companies")}
                WHERE ${mapQueryPrefix("companies")}.id = ${mapQueryPrefix(table)}.company) as company
            `;
        case "pricing_rules":
            return `
                ${mapQueryPrefix(table)}.id,
                ${mapQueryPrefix(table)}.price_per_unit,
                (
                    SELECT json_agg(
                        jsonb_build_object(
                            'id', ${mapQueryPrefix("pricing_conditions")}.id,
                            'quantity', ${mapQueryPrefix("pricing_conditions")}.quantity,
                            'size', ${mapQueryPrefix("pricing_conditions")}.size,
                            'size_unit', ${mapQueryPrefix("pricing_conditions")}.size_unit,
                            'quantity_unit', ${mapQueryPrefix("pricing_conditions")}.quantity_unit,
                            'colour', ${mapQueryPrefix("pricing_conditions")}.colour,
                            'threshold', ${mapQueryPrefix("pricing_conditions")}.threshold,
                            'product', (
                                SELECT jsonb_build_object(
                                    'id', ${mapQueryPrefix("products")}.id,
                                    'en_name', ${mapQueryPrefix("products")}.en_name,
                                    'ch_name', ${mapQueryPrefix("products")}.ch_name
                                )
                                FROM public.products ${mapQueryPrefix("products")}
                                WHERE ${mapQueryPrefix("products")}.id = ${mapQueryPrefix("pricing_conditions")}.product
                            ),
                            'materials', (
                                CASE WHEN ${mapQueryPrefix("pricing_conditions")}.materials IS NULL THEN NULL
                                ELSE (
                                    SELECT json_agg(
                                        jsonb_build_object(
                                            'id', ${mapQueryPrefix("materials")}.id,
                                            'en_name', ${mapQueryPrefix("materials")}.en_name,
                                            'ch_name', ${mapQueryPrefix("materials")}.ch_name
                                        )
                                    )
                                    FROM public.materials ${mapQueryPrefix("materials")}
                                    WHERE ${mapQueryPrefix("materials")}.id = ANY(${mapQueryPrefix("pricing_conditions")}.materials)
                                )
                                END
                            ),
                            'client', (
                                SELECT jsonb_build_object(
                                    'id', ${mapQueryPrefix("clients")}.id,
                                    'full_name', ${mapQueryPrefix("clients")}.full_name
                                )
                                FROM public.clients ${mapQueryPrefix("clients")}
                                WHERE ${mapQueryPrefix("clients")}.id = ${mapQueryPrefix("pricing_conditions")}.client
                            ),
                            'company', (
                                SELECT jsonb_build_object(
                                    'id', ${mapQueryPrefix("companies")}.id,
                                    'full_name', ${mapQueryPrefix("companies")}.full_name
                                )
                                FROM public.companies ${mapQueryPrefix("companies")}
                                WHERE ${mapQueryPrefix("companies")}.id = ${mapQueryPrefix("pricing_conditions")}.company
                            )
                        )
                        ORDER BY ${mapQueryPrefix("pricing_conditions")}.id ASC
                    )
                    FROM public.pricing_conditions ${mapQueryPrefix("pricing_conditions")}
                    WHERE ${mapQueryPrefix("pricing_conditions")}.id = ANY(${mapQueryPrefix(table)}.conditions)
                ) as conditions
            `;

        case "transactions": {
            const prefiex = mapQueryPrefix(table);
            return `
                ${prefiex}.transaction_date, ${prefiex}.creation_date, ${prefiex}.modified_date, 
                ${prefiex}.status, ${prefiex}.id, ${prefiex}.name, ${prefiex}.quantity, 
                ${prefiex}.price_per_unit, ${prefiex}.amount, ${prefiex}.note, ${prefiex}.colour, 
                ${prefiex}.en_unit, ${prefiex}.ch_unit, ${prefiex}.width, ${prefiex}.height, ${prefiex}.length, 
                ${prefiex}.size, ${prefiex}.quantity_unit, ${prefiex}.size_unit,
                CASE WHEN ${prefiex}.materials IS NULL OR array_length(${prefiex}.materials, 1) = 0 THEN NULL
                ELSE (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', ${mapQueryPrefix("materials")}.id,
                            'en_name', ${mapQueryPrefix("materials")}.en_name,
                            'ch_name', ${mapQueryPrefix("materials")}.ch_name
                        )
                    )
                    FROM public.materials ${mapQueryPrefix("materials")}
                    WHERE ${mapQueryPrefix("materials")}.id = ANY(${prefiex}.materials)
                ) END as materials,
                (
                    SELECT jsonb_build_object(
                        'id', ${mapQueryPrefix("products")}.id,
                        'en_name', ${mapQueryPrefix("products")}.en_name,
                        'ch_name', ${mapQueryPrefix("products")}.ch_name
                    )
                    FROM public.products ${mapQueryPrefix("products")}
                    WHERE ${mapQueryPrefix("products")}.id = ${prefiex}.product
                ) as product,
                (
                    SELECT ${mapQueryPrefix("companies")}.full_name
                    FROM public.companies ${mapQueryPrefix("companies")}
                    WHERE ${mapQueryPrefix("companies")}.id = ${prefiex}.company
                ) as company,
                (
                    SELECT ${mapQueryPrefix("clients")}.full_name
                    FROM public.clients ${mapQueryPrefix("clients")}
                    WHERE ${mapQueryPrefix("clients")}.id = ${prefiex}.client
                ) as client
            `;
        }
    }
}

/* Generate the aggregation columns:
 * definition in the form of:
 * {
 *    target: "column_name",
 *    type: {"default", "aggregation", "function"},
 *    specification: "functional or aggregative specification",
 *    as: "specified column_name"
 * }
*/
function mapSpecifiedQueryColumns(table, fields) {
    return `${fields.map((definition) => {
                const { target, type, specification, as } = definition;
                if (specification === "default") {
                    return `${mapQueryPrefix(table)}.${target}`
                }
                else{
                    if (type.includes("timestamp")){
                        return `EXTRACT(${specification} FROM ${mapQueryPrefix(table)}.${target}) AS ${as}`;
                    }
                    else{
                        return `${specification}(${mapQueryPrefix(table)}.${target}) AS ${as}`;
                    }
                }
            })
            .join(", ")}`;
}

/*
Function to generate the from clause of the query
*/
function generateFromClause(table) {
    return `FROM public.${table} AS ${mapQueryPrefix(table)}`;
}

/**
 * Function to generate the where cluase (support complex and nested conditions)
 */
function generateWhereClause(table, whereClause, result, operator = "AND", initialised = true) {

    // if on the operator level, then resursively calling the generation of where clause:
    if ('AND' in whereClause || 'OR' in whereClause) {
        const operator = whereClause.AND ? 'AND' : 'OR';
        const conditions = whereClause[whereClause.AND ? 'AND' : 'OR'];

        return ` ${initialised? "AND" : ""}(${generateWhereClause(table, conditions, result, operator, false)})`;
    }

    // recusrively reaching the level of where clauses:
    else if (Array.isArray(whereClause)) {
        return whereClause.map(c => {

            // if this item is a nesting condition or an generative condition:
            if ('AND' in c || 'OR' in c) {
                const operator = c.AND ? 'AND' : 'OR';
                return generateWhereClause(table, c, result, operator, false);
            }
            else{
                return getWhereTerm(result, table, c.target, c.keyword, c.type, c.operator);
            }
        }).join(` ${operator} `);
    }
    else {
        return getWhereTerm(result, table, whereClause.target, whereClause.keyword, whereClause.type, whereClause.operator);
    }
}

// generation of the fundamental serach term
function getWhereTerm(result, table, target, keyword, type, operator) {
    let whereClause = "";

    // deals with normal id searching:
    if (target == "id" && type.toLowerCase() == "uuid") {
        whereClause = `${mapQueryPrefix(table)}.${target}::text ${operator !== "nt"? "LIKE" : "NOT LIKE"} '%$${result.parameters.length + 1}%'`;
        result.parameters.push(`%${keyword}%`);
    }
    // FK references to other tables:
    else if (target !== "id" && type.toLowerCase() == "uuid") {
        const fkName = mapFKName(target);
        whereClause = `${mapQueryPrefix(table)}.${target} IN(
            SELECT id FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
            WHERE LOWER(${fkName.name}) ${operator !== "nt"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1} 
            )`;
        result.parameters.push(`%${keyword.toLowerCase()}%`);
    }
    // deals with search thorugh list of UUIDs:
    else if (type == "ARRAY") {
        const fkName = mapFKName(target);
        whereClause = `
            EXISTS (
                SELECT 1
                FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
                WHERE ${mapQueryPrefix(fkName.table)}.id = ANY(${mapQueryPrefix(table)}.${target})
                AND LOWER(${fkName.name}) ${operator !== "nt"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1}
            )
        `;
        result.parameters.push(`%${keyword.toLowerCase()}%`);
    }
    // deals with normal string searching:
    else if (type == "USER-DEFINED" || type.toLowerCase().includes("character")) {
        whereClause = `LOWER(${mapQueryPrefix(table)}.${target}::text) ${operator !== "nt"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1}`;
        result.parameters.push(`%${keyword.toLowerCase()}%`);
    }

    // deals with numeric searchings with units
    else if (type.toLowerCase() == "numeric" || type.toLowerCase() == "integer") {
        const containsUnit = /[^\d.]/.test(keyword);
        const unit = containsUnit ? keyword.split(/[^\d.]/)[1] : null;
        let value = containsUnit ? keyword.split(/[^\d.]/)[0] : keyword;
        const numericOperator = mapOperator(operator);

        // matching nuemeric value with correspondingly unit
        if (target == "quantity" || target == "size") {
            whereClause = `(${mapQueryPrefix(table)}.${target} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
            if (unit) {
                whereClause += ` AND LOWER(${mapQueryPrefix(table)}.${target}_unit) = $${result.parameters.length + 1})`;
                result.parameters.push(unit.toLowerCase());
            } else {
                whereClause += ')';
            }
        }
        else if (target.toLowerCase() == "width" || target.toLowerCase() == "height" || target.toLowerCase() == "length") {
            whereClause = `${mapQueryPrefix(table)}.${target} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
            if (unit) {
                whereClause += ` AND (LOWER(${mapQueryPrefix(table)}.en_unit) = $${result.parameters.length + 1} 
                    OR LOWER(${mapQueryPrefix(table)}.ch_unit) = $${result.parameters.length + 1})`;
                result.parameters.push(unit.toLowerCase());
                result.parameters.push(unit.toLowerCase());
            }
        }
        else {
            whereClause = `${mapQueryPrefix(table)}.${target} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
        }
    }
    else if (type.toLowerCase() == "timestamp with time zone") {
        const numericOperator = mapOperator(operator);
        whereClause = `${mapQueryPrefix(table)}.${target} ${numericOperator} $${result.parameters.length + 1}::timestamp with time zone`;
        result.parameters.push(keyword);
    }
    else {
        whereClause = `TRUE`;
    }
    return whereClause;
}

// function used to map the operators
function mapOperator(operator) {
    switch (operator) {
        case "eq":
            return "=";
        case "ne":
            return "!=";
        case "lt":
            return "<";
        case "gt":
            return ">";
        case "le":
            return "<=";
        case "ge":
            return ">=";
        default:
            return "";
    }
}

/*
Generates the group by clause for the query
    - assuming the input of groupByClause is either null or a list of valid columns
*/
function mapGroupByClause(table, query) {
    const noGroupBy = !query.groupByClause || !query.groupByClause.length;
    if (noGroupBy) {
        return "";
    }
    else {
        return ` GROUP BY ${query.groupByClause.map(field => {
            const { target, specification, type } = field;
            if (specification === "default"){
                return mapQueryPrefix(table) + "." + target;
            }
            else{
                // capture special cases of time-based group by
                if (type.includes("timestamp")){
                    return `EXTRACT(${specification} FROM ${mapQueryPrefix(table)}.${target})`;
                }
                else{
                    return `${specification}(${mapQueryPrefix(table)}.${target})`;
                }
            }
        }).join(", ")}`;
    }
}

/*
order by clause generationes
    - using either default or user specifics
*/
function mapOrderByClause(table, query) {
    const noGroupBy = !query.orderByClause || !query.orderByClause.length;
    let specifiedOrderBy = noGroupBy ? 
        null : 
        `${query.orderByClause.map((field) => {
            const { target, specification, type, order } = field;
                if (specification === "default"){
                    return `${mapQueryPrefix(table)}.${target} ${order}`;
                }
                else{
                    if (type.includes("timestamp")){
                        return `EXTRACT(${specification} FROM ${mapQueryPrefix(table)}.${target}) ${order}`;
                    }
                    else{
                        return `${specification}(${mapQueryPrefix(table)}.${target}) ${order}`;
                    }
                }
        }).join(", ")}`;

    switch (table) {
        case "companies":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.full_name ASC` : specifiedOrderBy}`;

        case "clients":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.full_name ASC` : specifiedOrderBy}`;

        case "positions":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.name ASC` : specifiedOrderBy}`;

        case "materials":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.ch_name ASC` : specifiedOrderBy}`;

        case "products":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.ch_name ASC` : specifiedOrderBy}`;

        case "employees":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.name ASC` : specifiedOrderBy}`;

        case "pricing_conditions":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.id ASC` : specifiedOrderBy}`;

        case "pricing_rules":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.price_per_unit DESC` : specifiedOrderBy}`;

        case "transactions":
            return `ORDER BY ${noGroupBy ? `${mapQueryPrefix(table)}.modified_date DESC` : specifiedOrderBy}`;
        default:
            return "";
    }
}

function generatePageLimits(page) {
    const limit = pageSize * page;
    const offset = (page - 1) * pageSize;
    return `LIMIT ${limit} OFFSET ${offset};`
}

module.exports = {
    mapDefaultQueryColumns,
    generateQuery,
    mapOperator
}