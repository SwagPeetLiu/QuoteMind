/*
* ==============================================================================
*  Sections of helper functions shared across the Vue-app
* ==============================================================================
*/
function generateTimeRange(duration) {
    const now = new Date();
    let startDate = new Date(now);

    switch (duration.toLowerCase()) {
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
        default:
            throw new Error('Unsupported duration');
    }

    // Reset time to midnight
    startDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return {
        startTime: startDate.toISOString().split('T')[0] + 'T00:00:00.000Z',
        endTime: now.toISOString().split('T')[0] + 'T00:00:00.000Z'
    };
}

// Function used to map the month and year to the correct language translation
function FormatMonthAndYear(month, year) {
    let convertedMonth = "";
    switch (month) {
        case 1:
            convertedMonth = "stats.time.Jan";
            break;
        case 2:
            convertedMonth = "stats.time.Feb";
            break;
        case 3:
            convertedMonth = "stats.time.Mar";
            break;
        case 4:
            convertedMonth = "stats.time.Apr";
            break;
        case 5:
            convertedMonth = "stats.time.May";
            break;
        case 6:
            convertedMonth = "stats.time.Jun";
            break;
        case 7:
            convertedMonth = "stats.time.Jul";
            break;
        case 8:
            convertedMonth = "stats.time.Aug";
            break;
        case 9:
            convertedMonth = "stats.time.Sep";
            break;
        case 10:
            convertedMonth = "stats.time.Oct";
            break;
        case 11:
            convertedMonth = "stats.time.Nov";
            break;
        case 12:
            convertedMonth = "stats.time.Dec";
            break;
    }
    return { month: convertedMonth, year: year };
}

// function used to map the gradient colour being used in the charts
function createGradient(ctx, colorStops) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStops[0]);
    gradient.addColorStop(1, colorStops[1]);
    return gradient;
}
// function used to map the stroke graduate colours for line charts 
function createLinearGradient(ctx, hexColor){
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 230, 0, 50);

    // Add color stops
    gradient.addColorStop(1, `rgba(${r},${g},${b},0.2)`);
    gradient.addColorStop(0.2, `rgba(${r},${g},${b},0.0)`);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);

    return gradient;
}

function getContrastColour(colour) {
    switch(colour) {
        case 'primary':
            return 'warning';
        case 'success':
            return 'info';
        case 'info':
            return 'success';
        case 'warning':
            return 'primary';
        case 'danger':
            return 'dark';
        case 'dark':
            return 'danger';
        default:
            return 'secondary';
    }
}


/*
* ==============================================================================
*  Sections of helper functions that generates search bodies
* ==============================================================================
*/
function getYearlyTransactionCountsBody() {
    const range = generateTimeRange("year");
    const countData = {
        table: "transactions",
        body: {
            searchQuery: {
                fields: [
                    {
                        target: "id",
                        specification: "COUNT",
                        as: "no_of_transaction"
                    },
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

module.exports = {
    generateTimeRange,
    getContrastColour,
    createLinearGradient,
    getYearlyTransactionCountsBody,
    getyearlyTransactionDistributionBody,
    createGradient,
    FormatMonthAndYear
}