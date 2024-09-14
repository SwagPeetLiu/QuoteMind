import { generateTimeRange } from "./helpers";
/*
* ==============================================================================
*  Sections of helper functions that generates search bodies
* ==============================================================================
*/
function generateYearlyScaledPartialBody() {
    const range = generateTimeRange("year");
    return {
        searchQuery: {
            fields: [
                {
                    target: "transaction_date",
                    specification: "MONTH",
                    as: "month"
                },
                {
                    target: "transaction_date",
                    specification: "YEAR",
                    as: "year"
                }
            ],
            whereClause: [
                {
                    target: "transaction_date",
                    operator: "lt",
                    keyword: range.endTime,
                    specification: "default",
                    transformType: null
                },
                {
                    target: "transaction_date",
                    operator: "gt",
                    keyword: range.startTime,
                    specification: "default",
                    transformType: null
                }
            ],
            groupByClause: [
                {
                    target: "transaction_date",
                    specification: "YEAR"
                },
                {
                    target: "transaction_date",
                    specification: "MONTH"
                }
            ],
            orderByClause: [
                {
                    target: "transaction_date",
                    specification: "YEAR",
                    order: "ASC"
                },
                {
                    target: "transaction_date",
                    specification: "MONTH",
                    order: "ASC"
                }
            ]
        },
        page: null
    }
}

// function to generate the body for querying the yearly transaction counts
function getYearlyTransactionCountsBody() {
    const partialBody = { ...generateYearlyScaledPartialBody() };

    // forming the total count serach body
    partialBody.searchQuery.fields.push({ target: "id", specification: "COUNT", as: "no_of_transaction" });
    const countData = {
        table: "transactions",
        body: { ...partialBody }
    };

    // for the quoted transaction clause
    const quotedData = JSON.parse(JSON.stringify(countData));
    quotedData.body.searchQuery.whereClause.push({
        target: "status",
        operator: "ne",
        keyword: "created",
        specification: "default",
        transformType: null
    });

    return { countQuery: countData, quotedQuery: quotedData };
}

// function to generate the body for querying the yearly transaction distribution
function getyearlyTransactionDistributionBody() {
    const range = generateTimeRange("year");
    return {
        table: "transactions",
        body: {
            searchQuery: {
                fields: [
                    {
                        target: "status",
                        specification: "default",
                        as: null
                    },
                    {
                        target: "id",
                        specification: "COUNT",
                        as: "count"
                    }
                ],
                whereClause: [
                    {
                        target: "transaction_date",
                        operator: "lt",
                        keyword: range.endTime,
                        specification: "default",
                        transformType: null
                    },
                    {
                        target: "transaction_date",
                        operator: "gt",
                        keyword: range.startTime,
                        specification: "default",
                        transformType: null
                    }
                ],
                groupByClause: [
                    {
                        target: "status",
                        specification: "default"
                    }
                ],
                orderByClause: null
            },
            page: null
        }
    }
}

// function to generate the body for querying the recent sales performance
function getRecentSalesPerformanceBody() {
    const partialBody = { ...generateYearlyScaledPartialBody() };
    partialBody.searchQuery.fields.push({ target: "amount", specification: "SUM", as: "sales" });
    return {
        table: "transactions",
        body: { ...partialBody }
    }
}

/*
* ====================================================================================
* WHERE CLAUSES GENERATION
* ====================================================================================

function to loop through and generate the where clauses
    - conditions (JSON objects that maintains the current selected filtration attributes)
    - operations (map objects that contains the operators (AND / OR) on each attribute)
*/
function generateSearchQueryWhereClause(conditions, clauseOperators) {
    const numOfConditions = Object.keys(conditions).length;

    // no attribute attached:
    if (numOfConditions === 0) { return null }

    // single attribute 
    else if (numOfConditions === 1) {
        const target = Object.keys(conditions)[0];
        const searchObject = conditions[target];
        const operator = clauseOperators.get(target);
        const whereClause = generateWhereClause(target, searchObject, operator);
        return whereClause;
    }
    
    // multiple attributes filtration
    else {
        return { 
            "AND" : 
                Object.keys(conditions).map((target) => {
                    const searchObject = conditions[target];
                    const operator = clauseOperators.get(target);
                    return generateWhereClause(target, searchObject, operator);
            })
        };
    }
}

// function used to generate a single whereclause
function generateWhereClause(target, searchObject, clauseOperator) {
    if (searchObject.type.includes('timestamp')) {
        const range = searchObject.values[0];
        const startClause = range.start ? {
            target: target,
            operator: 'ge',
            keyword: range.start,
            specification: 'default',
            transformType: null
        } : null;
        const endClause = range.end ? {
            target: target,
            operator: 'le',
            keyword: range.end,
            specification: 'default',
            transformType: null
        } : null;

        if (startClause && endClause) return {"AND": [startClause, endClause]};
        else if (startClause) return startClause;
        else if (endClause) return endClause;
        else return null;
    }
    else {
        if (searchObject.values.length == 1) {
            return {
                target: target,
                operator: "eq",
                keyword: searchObject.values[0],
                specification: 'default',
                transformType: null
            }
        }
        else if (searchObject.values.length > 1) {
            return {
                [clauseOperator.toUpperCase()]: searchObject.values.map((value) => {
                    return {
                        target: target,
                        operator: "eq",
                        keyword: value,
                        specification: 'default',
                        transformType: null
                    }
                })
            };
        }
        else return null;
    }
}

/*
* ====================================================================================
* ORDER BY CLAUSES GENERATION
* ====================================================================================

* function used to generate the order by clauses (currently support users with a single order by clause)
*/
function generateOrderByClause(definedOrderBy){
    return [
        {
            target: definedOrderBy.column,
            specification: "default",
            order: definedOrderBy.order
        }
    ]
}

/*
* ====================================================================================
* LISTING BODY GENERATION
* ====================================================================================

function used to map default listings with user supplied filtration
    - whereclauses (JSON objects that maintains the current selected filtration attributes)
    - orderByClause (JSON objects that maintains the current selected order by attributes)
    - page (current page number)
    - target (searching entity table name)
*/
function mapGeneralListingBody(whereclauses, orderByClause, page, target) {
    return {
        table: target,
        body: {
            searchQuery: {
                fields: "default",
                whereClause: whereclauses,
                groupByClause: null,
                orderByClause: orderByClause
            },
            page: page
        }
    }
}

module.exports= {
    getYearlyTransactionCountsBody,
    getyearlyTransactionDistributionBody,
    getRecentSalesPerformanceBody,
    generateSearchQueryWhereClause,
    generateOrderByClause,
    mapGeneralListingBody
}