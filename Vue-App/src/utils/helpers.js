/*
* ==============================================================================
*  Mathematical Helpers
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

// function used to convert dimensions between the diemsnion and size metrics:
function mapDefaultDimensions(providedValue, currentUnit, defaultUnit) {
    const conversionFactors = {
        // Linear measurements
        "mm": 0.001,
        "毫米": 0.001,
        "cm": 0.01,
        "厘米": 0.01,
        "m": 1,
        "米": 1,

        // Area measurements
        "mm²": 0.000001,
        "平方毫米": 0.000001,
        "cm²": 0.0001,
        "平方厘米": 0.0001,
        "m²": 1,
        "平米": 1
    };

    if (!(currentUnit in conversionFactors) || !(defaultUnit in conversionFactors)) {
        return null;
    }
    const valueInMeters = providedValue * conversionFactors[currentUnit];
    const result = valueInMeters / conversionFactors[defaultUnit];
    return parseFloat(result.toFixed(3));
}

// function used to map dimension units to size units:
function mapDimensionUnitToSizeUnit(unit) {
    switch (unit) {
        case "mm":
        case "cm":
        case "m":
            return `${unit}²`;
        case "毫米":
            return "mm²";
        case "厘米":
            return "cm²";
        case "米":
            return "m²";
        default:
            return "N/A";
    }
}

/**
 * ==================================================================================
 * Sections of Functions used to assist in mapping informations & Displaying on the UI
 * ==================================================================================
 */
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

// function used to map out the displaying column type in general listings
function mapColumnType(column){
    if (
        column === "company" || column === "client" || column === "companies" || column === "clients" || 
        column === "employee" || column === "employees" || column === "positions" || 
        column === "product" || column === "products" || column === "material" || column === "materials"
    ){
        return "reference";
    }
    else if(
        column === "quantity" || column === "width"  || column === "length" || column === "height" || 
        column === "size"
    ){
        return "numeric(ordinary)";
    }
    else if (column === "price_per_unit" || column === "amount"){
        return "numeric monetary(ordinary)";
    }
    else if (column === "position"){
        return "categorical";
    }
    else if(column.includes("date")){
        return "date";
    }
    // custom references that you would like the content to be aligned to the start
    else if (
        column === "transaction details" || column === "product & materials" ||
        column === "id" || column === "conditions" || column === "listed_conditions"
    ){
        return 'custom reference'
    }
    // custom references that you would like the content to be centered
    else if (column === "dimension" || column === "category"){
        return "custom entity";
    }
    else {
        return "ordinary";
    }
    
}

// function used to map out the form submission types on entity's attributes (to map into differnet 
// form controls ONLY)
//  - note the validation will be manually handled in separate validation functions upon value changes
function mapFormSubmissionType(column){
    if (
        column === "company" || column === "client" || column === "companies" || column === "clients" || 
        column === "employee" || column === "employees" || column === "positions" || column === "position" || 
        column === "product" || column === "products" || column === "material" || column === "materials"
    ){
        return "reference dropdown";
    }
    else if(
        column === "quantity" || column === "width"  || column === "length" || column === "height" || 
        column === "size"
    ){
        return "unit number";
    }
    else if (column === "price_per_unit" || column === "amount"){
        return "monetary number";
    }
    else if(column.includes("date")){
        return "date";
    }
    else if(column === "descriptions" || column === "note"){
        return "descriptions";
    }
    else return 'text';
}

// function used to determine if certain column is mandatory upon form submissions
function mapMandatory(column){
    // if column is non-essential values:
    if (column === "descriptions" || column === "note" || column === "phone" ||
        column === "wechat_contact" || column === "qq_contact" || column === "colour" ||
        column === "position"
    ){
        return false;
    }
    return true;
}

// function used to determine
function mapDisabled(column, locale){
    // columns that are not editable
    if (column === "creation_date" || column === "modified_date"){
        return true;
    }
    // columns that are not editable based on the language locale:
    const oppositeLocale = locale === "en" ? "ch" : "en";
    if (column.startsWith(`${oppositeLocale}_`)){
        return true;
    }
    return false;
}

// function used to map the svg icons to the icons folders
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
    
        // check on the matching order:
        if (svgDirection !== existingOrderBy.order){
            return require(`@/assets/img/icons/sort-${order}-line.svg`);
        }
        else{
            // ordinary sort match ups:
            if (column === existingOrderBy.column) {
                return require(`@/assets/img/icons/sort-${order}-solid.svg`);
            }
            // reference sort match ups
            else if (
                column === "target" && 
                (existingOrderBy.column === "id" || existingOrderBy.column.includes("name"))
            ){
                return require(`@/assets/img/icons/sort-${order}-solid.svg`);
            }
            //custom reference match ups
            else if (
                column === "dimension" && 
                existingOrderBy.column === "size"
            ){
                return require(`@/assets/img/icons/sort-${order}-solid.svg`);
            }
            else{
                return require(`@/assets/img/icons/sort-${order}-line.svg`);
            }
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

// function used to map the thresholod to the indicator:
function mapThresholdOperator(operator) {
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
            return null;
    }
}

// function used to map out Specific entity's response to formData Controls
// Outputs: {column: {value: xxxx, isValidated: true}}
function mapFormData(data, isValidated = true) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        result[key] = { value, isValidated: isValidated };
    }
    return result;
}
function reverseFormatData(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (mapFormSubmissionType(key) === "reference dropdown") {

            // if reference exists, assign id
            if (value.value) {
                result[key] = value.value.id;
            }
            else{
                result[key] = null;
            }
        }
        else{
            result[key] = value.value;
        }
    }
    return result;
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
    getProductDimensionUnit,
    mapDefaultDimensions,
    mapDimensionUnitToSizeUnit,
    mapThresholdOperator,
    mapFormData,
    reverseFormatData,
    mapFormSubmissionType,
    mapMandatory,
    mapDisabled
}