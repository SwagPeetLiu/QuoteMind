const { getConfiguration } = require("./Configurator");
const pageSize = getConfiguration().search.pageSize;
/*
* ==============================================================================================
* Formatter acts the single source of truth for the formatting of entitye query across the server
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
    //console.log("added fields",result);

    // Attaching the From clause:
    result.query += ` ${mapFromClause(table)}`;
    //console.log("added from clause", result);

    // attaching the where clause:
    //console.log("where clause =========", query.whereClause);
    result.query += ` WHERE ${mapQueryPrefix(table)}.created_by = $${result.parameters.length + 1}`;
    result.parameters.push(owner);
    result.query += `${query.whereClause ? mapWhereClause(table, query.whereClause, result) : ""}`;
    //console.log("added where clause", result);

    // attaching the group by clause:
    result.query += `${mapGroupByClause(table, query)}`;
    //console.log("added groupby clause",result);

    // attaching the order by clause:
    result.query += ` ${mapOrderByClause(table, query)}`;
    //console.log(result);

    // attach the page limits, as well as another (using a nested query structure to ensure the 
    // count is accurate & representing the criteria of the group by clauses):
    if (!page) {
        page = 1;
        countQuery.query += `${mapCountQuery(table, query, owner, countQuery)}`;
        //console.log("count query", countQuery);
    }
    result.query += ` ${generatePageLimits(page)}`;
    //console.log(result);

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
    cQuery += `${query.whereClause ? mapWhereClause(table, query.whereClause, countQuery) : ""}`;
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
function mapDefaultQueryColumns(table, detailed = false) {
    if (table === "companies") {
        const defaultColumns = 
                    `${mapQueryPrefix(table)}.id, 
                    ${mapQueryPrefix(table)}.full_name, 
                    ${mapQueryPrefix(table)}.email,
                    ${mapQueryPrefix(table)}.phone
                    `;
        const details = 
                `, ${mapQueryPrefix(table)}.tax_number,
                    CASE WHEN (SELECT COUNT(id) FROM public.addresses WHERE company = ${mapQueryPrefix(table)}.id) = 0 THEN NULL 
                            ELSE (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', ${mapQueryPrefix("addresses")}.id, 
                                        'street', ${mapQueryPrefix("addresses")}.street_address, 
                                        'city', ${mapQueryPrefix("addresses")}.city, 
                                        'state', ${mapQueryPrefix("addresses")}.state, 
                                        'country', ${mapQueryPrefix("addresses")}.country, 
                                        'postal', ${mapQueryPrefix("addresses")}.postal_code, 
                                        'category', ${mapQueryPrefix("addresses")}.category
                                    )
                                )
                                FROM public.addresses ${mapQueryPrefix("addresses")}
                                WHERE ${mapQueryPrefix("addresses")}.company = ${mapQueryPrefix(table)}.id
                            )
                    END AS addresses,
                    CASE WHEN (SELECT COUNT(id) FROM public.clients WHERE company = ${mapQueryPrefix(table)}.id) = 0 THEN NULL 
                            ELSE (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', ${mapQueryPrefix("clients")}.id, 
                                        'full_name', ${mapQueryPrefix("clients")}.full_name
                                    )
                                )
                                FROM public.clients ${mapQueryPrefix("clients")}
                                WHERE ${mapQueryPrefix("clients")}.company = ${mapQueryPrefix(table)}.id
                            )
                    END AS clients`;
        return detailed ? defaultColumns + details : defaultColumns;
    }
    else if (table === "clients"){
        const defaultColumns = 
                    `${mapQueryPrefix(table)}.id, 
                    ${mapQueryPrefix(table)}.full_name, 
                    ${mapQueryPrefix(table)}.email,
                    ${mapQueryPrefix(table)}.phone,
                    ${mapQueryPrefix(table)}.wechat_contact,
                    ${mapQueryPrefix(table)}.qq_contact,
                    CASE WHEN ${mapQueryPrefix(table)}.company IS NULL THEN NULL 
                    ELSE(
                        SELECT json_build_object(
                            'id', ${mapQueryPrefix("companies")}.id, 
                            'full_name', ${mapQueryPrefix("companies")}.full_name
                        )
                        FROM public.companies ${mapQueryPrefix("companies")}
                        WHERE ${mapQueryPrefix("companies")}.id = ${mapQueryPrefix(table)}.company
                    ) 
                    END AS company`;
        const details = 
                    `,
                    CASE WHEN (SELECT COUNT(id) FROM public.addresses WHERE client = ${mapQueryPrefix(table)}.id) = 0 THEN NULL 
                            ELSE (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', ${mapQueryPrefix("addresses")}.id, 
                                        'street', ${mapQueryPrefix("addresses")}.street_address, 
                                        'city', ${mapQueryPrefix("addresses")}.city, 
                                        'state', ${mapQueryPrefix("addresses")}.state, 
                                        'country', ${mapQueryPrefix("addresses")}.country, 
                                        'postal', ${mapQueryPrefix("addresses")}.postal_code, 
                                        'category', ${mapQueryPrefix("addresses")}.category
                                    )
                                )
                                FROM public.addresses ${mapQueryPrefix("addresses")}
                                WHERE ${mapQueryPrefix("addresses")}.client = ${mapQueryPrefix(table)}.id
                            )
                    END AS addresses`;
        return detailed ? defaultColumns + details : defaultColumns;
    }
    else if (table === "positions"){
        return `
                ${mapQueryPrefix(table)}.id, 
                ${mapQueryPrefix(table)}.name,
                ${mapQueryPrefix(table)}.descriptions
            `;
    }
    else if (table === "materials" || table === "products"){
        const defaultColumns = 
                    `${mapQueryPrefix(table)}.id, 
                    ${mapQueryPrefix(table)}.ch_name, 
                    ${mapQueryPrefix(table)}.en_name
                    `;
        const details = 
                    `, ${mapQueryPrefix(table)}.descriptions`;
        return detailed ? defaultColumns + details : defaultColumns;
    }
    else if (table === "employees"){
        return `
                ${mapQueryPrefix(table)}.id,
                ${mapQueryPrefix(table)}.name,
                ${mapQueryPrefix(table)}.email,
                ${mapQueryPrefix(table)}.phone,
                ${mapQueryPrefix(table)}.wechat_contact,
                ${mapQueryPrefix(table)}.qq_contact,
                CASE WHEN ${mapQueryPrefix(table)}.position IS NULL THEN NULL 
                ELSE (
                    SELECT jsonb_build_object(
                        'id', ${mapQueryPrefix("positions")}.id, 
                        'name', ${mapQueryPrefix("positions")}.name,
                        'descriptions', ${mapQueryPrefix("positions")}.descriptions
                    )
                    FROM public.positions ${mapQueryPrefix("positions")}
                    WHERE ${mapQueryPrefix("positions")}.id = ${mapQueryPrefix(table)}.position
                ) END AS position
            `;
    }
    else if (table === "pricing_conditions"){
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
                    WHEN ${mapQueryPrefix(table)}.materials IS NULL OR array_length(${mapQueryPrefix(table)}.materials, 1) = 0 THEN NULL
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
    }
    else if (table === "pricing_rules"){
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
    }
    else if (table === "transactions") {
        const prefix = mapQueryPrefix(table);
        const defaultColumns = `
                ${prefix}.transaction_date, ${prefix}.creation_date, ${prefix}.modified_date, 
                ${prefix}.status, ${prefix}.id, ${prefix}.name, ${prefix}.quantity, 
                ${prefix}.price_per_unit, ${prefix}.amount, ${prefix}.note, ${prefix}.colour, 
                ${prefix}.en_unit, ${prefix}.ch_unit, ${prefix}.width, ${prefix}.height, ${prefix}.length, 
                ${prefix}.size, ${prefix}.quantity_unit, ${prefix}.size_unit,
                CASE WHEN ${prefix}.materials IS NULL OR array_length(${prefix}.materials, 1) = 0 THEN NULL
                ELSE (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', ${mapQueryPrefix("materials")}.id,
                            'en_name', ${mapQueryPrefix("materials")}.en_name,
                            'ch_name', ${mapQueryPrefix("materials")}.ch_name
                        )
                    )
                    FROM public.materials ${mapQueryPrefix("materials")}
                    WHERE ${mapQueryPrefix("materials")}.id = ANY(${prefix}.materials)
                ) END as materials,
                (
                    SELECT jsonb_build_object(
                        'id', ${mapQueryPrefix("products")}.id,
                        'en_name', ${mapQueryPrefix("products")}.en_name,
                        'ch_name', ${mapQueryPrefix("products")}.ch_name
                    )
                    FROM public.products ${mapQueryPrefix("products")}
                    WHERE ${mapQueryPrefix("products")}.id = ${prefix}.product
                ) as product,
                CASE WHEN ${prefix}.company is NULL THEN NULL 
                ELSE(
                    SELECT jsonb_build_object(
                        'id', ${mapQueryPrefix("companies")}.id,
                        'full_name', ${mapQueryPrefix("companies")}.full_name
                    )
                    FROM public.companies ${mapQueryPrefix("companies")}
                    WHERE ${mapQueryPrefix("companies")}.id = ${prefix}.company
                ) END AS company,
                CASE WHEN ${prefix}.client is NULL THEN NULL
                ELSE(
                    SELECT jsonb_build_object(
                        'id', ${mapQueryPrefix("clients")}.id,
                        'full_name', ${mapQueryPrefix("clients")}.full_name
                    )
                    FROM public.clients ${mapQueryPrefix("clients")}
                    WHERE ${mapQueryPrefix("clients")}.id = ${prefix}.client
                ) END AS client
            `;
        const details = `
            ,
                CASE WHEN ${prefix}.addresses IS NULL OR array_length(${prefix}.addresses, 1) = 0 THEN NULL
                ELSE ( SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ${mapQueryPrefix("addresses")}.id,
                        'street', ${mapQueryPrefix("addresses")}.street_address,
                        'city', ${mapQueryPrefix("addresses")}.city,
                        'state', ${mapQueryPrefix("addresses")}.state,
                        'country', ${mapQueryPrefix("addresses")}.country,
                        'postal', ${mapQueryPrefix("addresses")}.postal_code,
                        'category', ${mapQueryPrefix("addresses")}.category
                    ))
					FROM public.addresses ${mapQueryPrefix("addresses")}
					WHERE ${mapQueryPrefix("addresses")}.id = ANY(${prefix}.addresses)
                ) END as addresses,
                CASE WHEN ${prefix}.employee IS NULL OR array_length(${prefix}.employee, 1) = 0 THEN NULL
                ELSE (SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ${mapQueryPrefix("employees")}.id,
                        'name', ${mapQueryPrefix("employees")}.name
                    ))
					FROM public.employees ${mapQueryPrefix("employees")}
					WHERE ${mapQueryPrefix("employees")}.id = ANY(${prefix}.employee)
                ) END as employee
        `;
        return detailed ? defaultColumns + details : defaultColumns;
    }
    else{
        return `${mapQueryPrefix(table)}.id`
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
function mapFromClause(table) {
    return `FROM public.${table} AS ${mapQueryPrefix(table)}`;
}

/**
 * Function to generate the where cluase (support complex and nested conditions)
 */
function mapWhereClause(table, whereClause, result, operator = "AND", initialised = true) {

    // if on the operator level, then resursively calling the generation of where clause:
    if ('AND' in whereClause || 'OR' in whereClause) {
        const operator = whereClause.AND ? 'AND' : 'OR';
        const conditions = whereClause[whereClause.AND ? 'AND' : 'OR'];

        return ` ${initialised? "AND" : ""}(${mapWhereClause(table, conditions, result, operator, false)})`;
    }

    // Recusrively reaching the level of where clauses (also Account for submitting of array on the top level)
    else if (Array.isArray(whereClause)) {
        let clause = `${initialised? " AND (" : ""}`;
        clause += whereClause.map(c => {

            // if this item is a nesting condition or an generative condition:
            if ('AND' in c || 'OR' in c) {
                const operator = c.AND ? 'AND' : 'OR';
                return mapWhereClause(table, c, result, operator, false);
            }
            else{
                return `${getWhereTerm(result, table, c.target, c.keyword, c.type, c.operator, c.specification)}`;
            }
        }).join(` ${operator} `);
        clause += `${initialised? ")" : ""}`;
        return clause;
    }
    else {
        // account for single clause claims
        return ` ${initialised? "AND " : ""}${getWhereTerm(result, table, whereClause.target, whereClause.keyword, whereClause.type, whereClause.operator, whereClause.specification)}`;
    }
}

// generation of the fundamental serach term
function getWhereTerm(result, table, target, keyword, type, operator, specification) {
    let whereClause = "";

    // deals with normal id searching (DO NOT SUPPORT transformation)
    if (target == "id" && type.toLowerCase() == "uuid") {
        whereClause = `${mapQueryPrefix(table)}.${target}::text ${operator !== "ne"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1}`;
        result.parameters.push(`%${keyword}%`);
    }
    // FK references to other tables (DO NOT SUPPORT transformation)
    else if (target !== "id" && type.toLowerCase() == "uuid") {
        const fkName = mapFKName(target);
        whereClause = `${mapQueryPrefix(table)}.${target} IN(
            SELECT id FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
            WHERE LOWER(${fkName.name}) ${operator !== "ne"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1} 
            )`;
        result.parameters.push(`%${keyword.toLowerCase()}%`);
    }
    // deals with search thorugh list of UUIDs (DO NOT SUPPORT transformation)
    else if (type == "ARRAY") {
        const fkName = mapFKName(target);
        whereClause = `
            EXISTS (
                SELECT 1
                FROM public.${fkName.table} as ${mapQueryPrefix(fkName.table)}
                WHERE ${mapQueryPrefix(fkName.table)}.id = ANY(${mapQueryPrefix(table)}.${target})
                AND LOWER(${fkName.name}) ${operator !== "ne"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1}
            )
        `;
        result.parameters.push(`%${keyword.toLowerCase()}%`);
    }
    // deals with normal string searching (SUPPORT transformation)
    else if (type == "USER-DEFINED" || type.toLowerCase().includes("character") || type.toLowerCase() == "string") {
        const searchTarget = (specification == "default") ? `${mapQueryPrefix(table)}.${target}` : mapFunctionalField(table, target, specification, type);
        whereClause = `LOWER(${searchTarget}::text) ${operator !== "ne"? "LIKE" : "NOT LIKE"} $${result.parameters.length + 1}`;
        result.parameters.push(`%${keyword.toLowerCase()}%`); mapFunctionalField
    }

    // deals with numeric searchings with units (SUPPORT transformation, e.g., max siz, Month of date...)
    else if (type.toLowerCase() == "numeric" || type.toLowerCase() == "integer") {
        const containsUnit = /[^\d.]/.test(keyword);
        const unit = containsUnit ? keyword.split(/[^\d.]/)[1] : null;
        let value = containsUnit ? keyword.split(/[^\d.]/)[0] : keyword;
        const numericOperator = mapOperator(operator);
        const searchTarget = (specification == "default") ? `${mapQueryPrefix(table)}.${target}` : mapFunctionalField(table, target, specification, type);

        // matching nuemeric value with correspondingly unit
        if (target == "quantity" || target == "size") {
            whereClause = `(${searchTarget} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
            if (unit) {
                whereClause += ` AND LOWER(${mapQueryPrefix(table)}.${target}_unit) = $${result.parameters.length + 1})`;
                result.parameters.push(unit.toLowerCase());
            } else {
                whereClause += ')';
            }
        }
        else if (target.toLowerCase() == "width" || target.toLowerCase() == "height" || target.toLowerCase() == "length") {
            whereClause = `${searchTarget} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
            if (unit) {
                whereClause += ` AND (LOWER(${mapQueryPrefix(table)}.en_unit) = $${result.parameters.length + 1} 
                    OR LOWER(${mapQueryPrefix(table)}.ch_unit) = $${result.parameters.length + 1})`;
                result.parameters.push(unit.toLowerCase());
                result.parameters.push(unit.toLowerCase());
            }
        }
        else {
            whereClause = `${searchTarget} ${numericOperator} $${result.parameters.length + 1}`;
            result.parameters.push(value);
        }
    }
    // deals with timestamp searchings (DO NOT support transformation)
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

// function used to map the functional fields:
function mapFunctionalField(table, target, specification, type) {
    if (specification === "default"){
        return mapQueryPrefix(table) + "." + target;
    }
    else{
        // capture special cases of time-based functions (using targets to account for timestamp type being 
        // overwritten by transformation)
        if (type.includes("timestamp") || target.includes("date")) {
            return `EXTRACT(${specification} FROM ${mapQueryPrefix(table)}.${target})`;
        }
        else{
            return `${specification}(${mapQueryPrefix(table)}.${target})`;
        }
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
            return mapFunctionalField(table, target, specification, type);
        }).join(", ")}`;
    }
}

/*
order by clause generationes
    - using either default or user specifics or null (no order by clause)
*/
function mapOrderByClause(table, query) {
    const noGroupBy = query.orderByClause == null;
    if (noGroupBy) {
        return "";
    }
    const useDefault = query.orderByClause == "default";
    let specifiedOrderBy = useDefault ? 
        null : 
        `${query.orderByClause.map((field) => {
            const { target, specification, type, order } = field;
            return `${mapFunctionalField(table, target, specification, type)} ${order}`;
        }).join(", ")}`;

    switch (table) {
        case "companies":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.full_name ASC` : specifiedOrderBy}`;

        case "clients":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.full_name ASC` : specifiedOrderBy}`;

        case "positions":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.name ASC` : specifiedOrderBy}`;

        case "materials":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.ch_name ASC` : specifiedOrderBy}`;

        case "products":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.ch_name ASC` : specifiedOrderBy}`;

        case "employees":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.name ASC` : specifiedOrderBy}`;

        case "pricing_conditions":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.id ASC` : specifiedOrderBy}`;

        case "pricing_rules":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.price_per_unit DESC` : specifiedOrderBy}`;

        case "transactions":
            return `ORDER BY ${useDefault ? `${mapQueryPrefix(table)}.modified_date DESC` : specifiedOrderBy}`;
        default:
            return "";
    }
}

function generatePageLimits(page) {
    const limit = pageSize * page;
    const offset = (page - 1) * pageSize;
    return `LIMIT ${limit} OFFSET ${offset};`
}

/*
* ==============================================================================================
* Sections used to generate the quotations on the performance queries on transactions
* ================================================================================================
*/
function generateQuotationProgressQuery(target){
    const targetTable = target === "client" ? "clients" : "companies";
    return `
        WITH top_${target} AS (
            SELECT 
            ${mapQueryPrefix("transactions")}.${target}, 
                COUNT(*) AS created_transactions
            FROM public.transactions ${mapQueryPrefix("transactions")}
            WHERE ${mapQueryPrefix("transactions")}.status = 'created' AND ${mapQueryPrefix("transactions")}.${target} IS NOT NULL
            GROUP BY ${mapQueryPrefix("transactions")}.${target}
            ORDER BY created_transactions DESC
            LIMIT 5
        )
        SELECT 
        (
            SELECT jsonb_build_object(
                'id', ${mapQueryPrefix(targetTable)}.id,
                'full_name', ${mapQueryPrefix(targetTable)}.full_name
            )
            FROM public.${targetTable} ${mapQueryPrefix(targetTable)}
            WHERE ${mapQueryPrefix(targetTable)}.id = tc.${target}
        ) AS ${target},
        tc.created_transactions,
        COUNT(${mapQueryPrefix("transactions")}.id) AS total_transactions,
        COALESCE(SUM(CASE WHEN ${mapQueryPrefix("transactions")}.status = 'quoted' THEN ${mapQueryPrefix("transactions")}.amount ELSE 0 END), 0) AS upaid
        FROM top_${target} tc
        JOIN public.transactions ${mapQueryPrefix("transactions")} ON tc.${target} = ${mapQueryPrefix("transactions")}.${target}
        GROUP BY tc.${target}, tc.created_transactions
        ORDER BY tc.created_transactions DESC
    `;
}

module.exports = {
    mapDefaultQueryColumns,
    mapFromClause,
    mapWhereClause,
    mapOrderByClause,
    generateQuery,
    mapOperator,
    mapQueryPrefix,
    generateQuotationProgressQuery
}