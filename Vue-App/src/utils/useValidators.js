/*
* functions used to validate the user's inputs
*/
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation();
import { config } from "@/config/config";

export function useValidators() {
    // centralised validator on the client side:
    function mapValidation(target, value) {
        if (target === 'username') return isUsernameValid(value);
        if (target === 'email') return isEmailValid(value);
        if (target === 'password') {
            if (value === config.passwordOverlay) {
                return { valid: true };
            }
            return isPasswordValid(value);
        };

        // general search validations:
        if (target === "textInput") {
            return isTextInputValid(value);
        }
        if (target === "rangedDateInput") {
            return isRangedDateInputValid(value);
        }
        if (target === "status") {
            return isStatusValid(value);
        }

        return { valid: true };
    }

    function isUsernameValid(username) {
        if (!username || !username.trim()) return { valid: false, message: `${t('validation.username')}${t('validation.cannot be empty')}` };
        if (username.length < config.limitations.Min_Username_Length) return { valid: false, message: `${t('validation.username')}${t('validation.too short')}` };
        if (username.length > config.limitations.Max_Username_Length) return { valid: false, message: `${t('validation.username')}${t('validation.too long')}` };
        return { valid: true };
    }

    function isEmailValid(email, required) {
        const isEmpty = !email || !email.trim();
        if (isEmpty && required) {
            return { valid: false, message: `${t('validation.email')}${t('validation.cannot be empty')}` };
        }
        if (!isEmpty) {
            if (email.length < config.limitations.Min_Email_Length) return { valid: false, message: `${t('validation.email')}${t('validation.too short')}` };
            if (email.length > config.limitations.Max_Email_Length) return { valid: false, message: `${t('validation.email')}${t('validation.too long')}` };
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!regex.test(email)) return { valid: false, message: `${t('validation.invalid email')}` }
        }
        return { valid: true };
    }
    function isPasswordValid(password) {
        // length checks
        if (!password || !password.trim()) return { valid: false, message: `${t('validation.password')}${t('validation.cannot be empty')}` };
        if (password.length < config.limitations.Min_Password_Length) return { valid: false, message: `${t('validation.password')}${t('validation.too short')}` };
        if (password.length > config.limitations.Max_Password_Length) return { valid: false, message: `${t('validation.password')}${t('validation.too long')}` };

        // Check if the password contains at least 3 digits, letters, 1 uppercase letters, and special characters
        const digits = password.match(/\d/g);
        const letters = password.match(/[a-zA-Z]/g);
        const uppercase = password.match(/[A-Z]/g);
        const specialCharacters = password.match(/[^a-zA-Z0-9]/g);
        if (!digits || digits.length < 3 ||
            !letters || letters.length < 3 ||
            !uppercase || uppercase.length < 1 ||
            !specialCharacters || specialCharacters.length < 1
        ) {
            return { valid: false, message: t('validation.invalid password') };
        }
        return { valid: true };
    }
    function isRegisterTokenValid(token) {
        if (!token || !token.trim()) return { valid: false, message: `${t('validation.token')}${t('validation.cannot be empty')}` };
        if (token.length < config.limitations.Min_Token_Length) return { valid: false, message: `${t('validation.token')}${t('validation.too short')}` };
        if (token.length > config.limitations.Max_Token_Length) return { valid: false, message: `${t('validation.token')}${t('validation.too long')}` };
        return { valid: true };
    }

    function isSearchTableValid(tableName, dbReferences) {
        if (typeof tableName !== 'string' || !tableName.trim()) return { valid: false, message: `${t('validation.search target')}${t('validation.is invalid')}` };

        // only proceed for table validation if initialised (account for initial user login)
        if (dbReferences) {
            const isValid = Object.values(dbReferences).some(ref => ref.table === tableName);
            if (!isValid) return { valid: false, message: `${t('validation.search target')}${t('validation.is invalid')}` };
        }
        return { valid: true };
    }

    function isSearchBodyValid(body) {
        if (!('searchQuery' in body) || !('page' in body)) return { valid: false, message: `${t('validation.search query')}${t('validation.has incomplete information')}` };

        const searchQuery = body.searchQuery;
        if (!('fields' in searchQuery) || !('whereClause' in searchQuery) || !('groupByClause' in searchQuery) ||
            !("orderByClause" in searchQuery)) {
            return { valid: false, message: `${t('validation.search query')}${t('validation.has incomplete information')}` };
        }

        return { valid: true };
    }

    // function to deem if the 
    function isSortingAllowed(column, dbReferences) {
        if (typeof column !== 'string' || !column.trim()) return { valid: false, message: `${t('validation.sorting column')}${t('validation.is invalid')}` };

        // if sortign based on table's orioginal target, then it is allowed automatically:
        if (column === 'target' || column === 'dimension') return { valid: true };

        // only proceed for table validation if initialised (account for initial user login)
        if (dbReferences) {
            const isValid = Object.values(dbReferences).some(ref => ref.column === column);
            if (!isValid) return { valid: false, message: `${t('validation.sorting column')}${t('validation.is invalid')}` };
        }
        return { valid: true };
    }

    // general string based search
    function isTextInputValid(textInput) {
        if (!textInput || typeof textInput !== 'string' || !textInput.trim()) {
            return {
                valid: false,
                message: `${t('validation.search value')}${t('validation.cannot be empty')}`
            };
        }
        else if (textInput.length > config.limitations.Max_Name_Length) {
            return {
                valid: false,
                message: `${t('validation.search value')}${t('validation.too long')}`
            };
        }
        else {
            return { valid: true };
        }
    }

    // general date transactions
    function isRangedDateInputValid(dateObject) {
        if (!dateObject || (typeof dateObject !== 'object')) {
            return { valid: false, message: `${t('validation.date range')}${t('validation.is invalid')}` };
        }

        const { start, end } = dateObject;

        if (!start && !end) {
            return { valid: false, message: `${t('validation.date range')}${t('validation.is invalid')}` };
        }

        if (start && !(start instanceof Date)) {
            return { valid: false, message: `${t('validation.date range')}${t('validation.is invalid')}` };
        }

        if (end && !(end instanceof Date)) {
            return { valid: false, message: `${t('validation.date range')}${t('validation.is invalid')}` };
        }

        if (start && end && start >= end) {
            return { valid: false, message: `${t('validation.date range')}${t('validation.is invalid')}` };
        }

        return { valid: true };
    }

    function isStatusValid(status) {
        const allowedOptions = config.multipleOptions["status"];
        if (!status){
            return { valid: false, message: `${t('validation.status')}${t('validation.cannot be empty')}` };
        }
        
        // at least a single categroy is selected:
        if (typeof status === 'object') {
            let isSingleConditionSelected = false;
            for (const option of allowedOptions){
                if (status[option]) {
                    if (status[option] === true) {
                        isSingleConditionSelected = true;
                        return { valid: true };
                    }
                }
            }
            if (!isSingleConditionSelected) {
                return { valid: false, message: `${t('validation.status')}${t('validation.must be selected')}` };
            }
        }
        // allow textual inputs
        if (typeof status === 'string') {
            if (!allowedOptions.includes(status)) {
                return { valid: false, message: `${t('validation.status')}${t('validation.is invalid')}` };
            }
        }
        return { valid: true };
    }

    // centrialised validator for numerical records displayed in tables
    function isNumericalRecordValid(record, target, column, providedValue){
        if (!record || typeof record !== 'object' || !target || typeof target !== 'string' || !column || typeof column !== 'string'){
            return { valid: false, message: `${t('validation.record')}${t('validation.is invalid')}` };
        }
        if (column === 'price_per_unit' && column === 'amount'){

            // unprovided value in pricing rules
            if (!providedValue && target === 'pricing_rules'){
                return { valid: false, message: `${t('validation.missing')}` };
            }

            // unprovided value in quoted transactions:
            if (!providedValue && target === 'transactions'){
                if (record.status !== 'created'){
                    return { valid: false, message: `${t('validation.missing')}` };
                }
            }
        }
        if (column === 'quantity'){
            if (!providedValue && target === 'transactions'){
                return { valid: false, message: `${t('validation.missing')}` };
            }
        }
        // only allow positive numbers for the records
        if (providedValue && !isNumericPositive(providedValue).valid){
            return { valid: false };
        }
        return { valid: true };
    }

    function isNumericPositive(input){
        let valid = false;
        if (typeof input === 'number' && !isNaN(input)) {
            valid = input > 0;
        }
        if (typeof input === 'string'){
            // Float validation
            const parsed = parseFloat(input);
            if (!isNaN(parsed) && isFinite(input)) {
                valid =  parsed > 0;
            }

            //Integer validation
            const parsedInt = parseInt(input, 10);
            if (!isNaN(parsedInt) && isFinite(input)) {
                valid = parsedInt > 0;
            }
        }
        return { valid: valid, message: `${valid ? '' : t('validation.is invalid')}` };
    }

    return {
        mapValidation,
        isUsernameValid,
        isEmailValid,
        isPasswordValid,
        isRegisterTokenValid,
        isSearchTableValid,
        isSearchBodyValid,
        isSortingAllowed,
        isStatusValid,
        isNumericalRecordValid,
        isNumericPositive
    };
}