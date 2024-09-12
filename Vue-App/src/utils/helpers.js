/*
* ==============================================================================
*  Sections of helper functions shared across the Vue-app
* ==============================================================================
*/
function generateDateRange(duration) {
    const now = new Date();
    let startDate = new Date(now);

    switch (duration.toLowerCase()) {
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
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
            throw new Error('Unsupported duration. Please use "year", "month", "week", or "day".');
    }

    // Reset time to midnight
    startDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return { startDate: startDate, endDate: now };
}

function generateTimeRange(duration) {
    const { startDate, endDate } = generateDateRange(duration);
    return {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
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

function formatDate(date, locale) {
    const options = {
      year: 'numeric',
      month: `${locale === 'en' ? 'short' : 'long'}`,
      day: 'numeric',
    };
    if (locale === 'en') {
        let [month, day, year] = date.toLocaleString('en-US', options).split(' ');
        day = day.replace(',', '');
        
        // Add ordinal suffix
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = suffixes[(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : (day % 10)];
        
        return `${year} ${month} ${day}${suffix}`;
    }
    else{
        return date.toLocaleString('zh-CN', options);
    }
  }

// function used to map the gradient colour being used in the charts
function createGradient(ctx, colorStops) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStops[0]);
    gradient.addColorStop(1, colorStops[1]);
    return gradient;
}
// function used to map the stroke graduate colours for line charts 
function createLinearGradient(ctx, hexColor) {
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
    switch (colour) {
        case 'primary':
            return 'warning';
        case 'success':
            return 'info';
        case 'info':
            return 'success';
        case 'warning':
            return 'primary';
        case 'danger':
            return 'info';
        case 'dark':
            return 'warning';
        default:
            return 'secondary';
    }
}

// function used to calculate the changes in the recent data points (returned value
// can be relative or absolute)
function calculateRelativeChanges(dataArray) {

    // calculate for relative changes
    if (dataArray.length >= 2) {
        const lastValue = dataArray[dataArray.length - 1];
        const previousValue = dataArray[dataArray.length - 2];
        const relativeChange = (lastValue - previousValue) / previousValue * 100;
        if (relativeChange < 0) {
            return { isUp: false, value: `${Math.abs(relativeChange).toFixed(2)}%` };
        }
        else {
            return { isUp: true, value: `${Math.abs(relativeChange).toFixed(2)}%` };
        }
    }
    // calculate for absolute changes
    else if (dataArray === 1) {
        return { isUp: true, value: `${dataArray[0]}` };
    }
    else {
        return { isUp: false, value: "- -" };
    }
}

function calculatePercentage(base, total) {
    return (base / total * 100).toFixed(0);
}

function getUniqueObjects(array) {
    const uniqueMap = new Map();

    for (const item of array) {
        const key = JSON.stringify(item);
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    }
    return Array.from(uniqueMap.values());
}

// function used to describe the use of indicator in the search pannel
// (i.e., xxx attribuite contains / named as "yyy")
function mappIndicator(target) {
    if (target.includes("name")) {
        return "named";
    }
    else if (
        target === "company" || 
        target === "client" || 
        target === "employee" || 
        target === "product" || 
        target === "materials"
    ){
        return "named";
    }
    else{
        return "contains";
    }
}

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

module.exports = {
    generateDateRange,
    generateTimeRange,
    getContrastColour,
    createLinearGradient,
    getYearlyTransactionCountsBody,
    getyearlyTransactionDistributionBody,
    getRecentSalesPerformanceBody,
    createGradient,
    FormatMonthAndYear,
    calculateRelativeChanges,
    calculatePercentage,
    getUniqueObjects,
    formatDate,
    mappIndicator
}