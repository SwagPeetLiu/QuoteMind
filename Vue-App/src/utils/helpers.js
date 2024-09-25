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

/**
 * function used to display user-friendly Date info:
 * @param {*} date - Date opbject / ISO string (URL decodeed version)
 * @param {*} locale - en / ch
 */

function formatDate(date, locale) {
    // convert to date object if input date is a string
    let convertedDate = date;
    if (typeof date === 'string') {
        convertedDate = new Date(date);
    }
    const options = {
      year: 'numeric',
      month: `${locale === 'en' ? 'short' : 'long'}`,
      day: 'numeric',
    };
    if (locale === 'en') {
        let [month, day, year] = convertedDate.toLocaleString('en-US', options).split(' ');
        day = day.replace(',', '');
        
        // Add ordinal suffix
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = suffixes[(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : (day % 10)];
        
        return `${year} ${month} ${day}${suffix}`;
    }
    else{
        return convertedDate.toLocaleString('zh-CN', options);
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

/**
 * ==================================================================================
 * Sections of Functions used to assist in mapping informations
 * ==================================================================================
 */
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
    else if(target === "status"){
        return "as";
    }
    else{
        return "contains";
    }
}

// Function used to map the record's name to its Identification
function getRecordName(target, locale){
    if (
        target === "company" || 
        target === "client" ||
        target === "companies" ||
        target === "clients"
    ) {
        return "full_name";
    }
    else if (
        target === "employee" || 
        target === "employees" ||
        target === "positions" || 
        target === "position"
    ) {
        return "name";
    }
    else if (
        target === "product" || 
        target === "products" ||
        target === "material" ||
        target === "materials"
    ) {
        return `${locale}_name`;
    }
    else {
        return "name";
    }
}

function mapColumnType(column){
    if (
        column === "company" || 
        column === "client" ||
        column === "companies" ||
        column === "clients" || 
        column === "employee" || 
        column === "employees" ||
        column === "positions" || 
        column === "product" || 
        column === "products" ||
        column === "material" ||
        column === "materials"
    ) {
        return "reference";
    }
    else if(
        column === "quantity" ||
        column === "width"  ||
        column === "length" ||
        column === "height" ||
        column === "size"
    ){
        return "numeric(ordinary)";
    }
    else if (
        column === "price_per_unit" || 
        column === "amount"
    ){
        return "numeric monetary(ordinary)";
    }
    else if (column === "position"){
        return "categorical";
    }
    else if(column.includes("date")){
        return "date";
    }
    else if (column === "transaction details" || column === "dimension" || column === "product & materials"){
        return 'custom reference'
    }
    else {
        return "ordinary";
    }
}

// function used to mpa the svg icons to the icons folders
function getTargetImage(target){
    try{
        if (target === "company" || target === "companies"){
            return require(`@/assets/img/icons/companies.svg`);
        }
        else if (target === "client" || target === "clients" || target === "sold to"){
            return require(`@/assets/img/icons/clients.svg`);
        }
        else if(target === "employee" || target === "employees"){
            return require(`@/assets/img/icons/employees.svg`);
        }
        else if (target === "product" || target === "products" || target === "product & materials"){
            return require(`@/assets/img/icons/products.svg`);
        }
        else if (target === "material" || target === "materials"){
            return require(`@/assets/img/icons/materials.svg`);
        }
        else if (target === "position" || target === "positions"){
            return require(`@/assets/img/icons/positions.svg`);
        }
        else if (target === "dimension"){
            return require(`@/assets/img/icons/size.svg`);
        }
        else if (target === "transaction details"){
            return require(`@/assets/img/icons/transactions.svg`);
        }
        else{
            return require(`@/assets/img/icons/${target}.svg`);
        }
    }
    catch(err){
        console.error(err);
    }
}
// function used to map out the order sort SVGs
function getSortImage(column, order, existingOrderBy){
    try{
        const svgDirection = "up" === order ? "ASC" : "DESC";
        // ordinary sort match ups:
        if (column === existingOrderBy.column && svgDirection === existingOrderBy.order) {
            return require(`@/assets/img/icons/sort-${order}-solid.svg`);
        }
        else if (
            column === "target" && 
            (existingOrderBy.column === "id" || existingOrderBy.column.includes("name")) 
            && svgDirection === existingOrderBy.order
        ){
            return require(`@/assets/img/icons/sort-${order}-solid.svg`);
        }
        else{
            return require(`@/assets/img/icons/sort-${order}-line.svg`);
        }
    }
    catch(err){
        console.error(err);
    }
}

// function used to map out the product dimension unit
function getProductDimensionUnit(locale){
    return `${locale}_unit`;
}

module.exports = {
    generateDateRange,
    generateTimeRange,
    getContrastColour,
    createLinearGradient,
    createGradient,
    FormatMonthAndYear,
    calculateRelativeChanges,
    calculatePercentage,
    getUniqueObjects,
    formatDate,
    mappIndicator,
    getRecordName,
    mapColumnType,
    getTargetImage,
    getSortImage,
    getProductDimensionUnit
}