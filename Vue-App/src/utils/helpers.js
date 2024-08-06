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
function FormatMonthAndYear(month, year){
    let convertedMonth = "";
    switch(month){
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
    return {month: convertedMonth, year: year};
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
        operator: "eq",
        keyword: "quoted",
        specification: "default",
        transformType: null
    });

    return { countQuery: countData, quotedQuery: quotedData };
}

module.exports = {
    generateTimeRange,
    getYearlyTransactionCountsBody,
    FormatMonthAndYear
}