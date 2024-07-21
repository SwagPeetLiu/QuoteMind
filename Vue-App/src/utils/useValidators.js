/*
* functions used to validate the user's inputs
*/
import { useI18n } from "vue-i18n";
import { config } from "../config/config";

export function useValidators() {
    const { t } = useI18n(); // this hppl must be used like an composition API

    function isUsernameValid(username) {
        if (!username || !username.trim()) return { valid: false, message: `${t('validation.username')} ${t('validation.cannot be empty')}` };
        if (username.length < config.limitations.Min_Username_Length) return { valid: false, message: `${t('validation.username')} ${t('validation.too short')}` };
        if (username.length > config.limitations.Max_Username_Length) return { valid: false, message: `${t('validation.username')} ${t('validation.too long')}` };
        return { valid: true };
    }
    function isEmailValid(email, required) {
        const isEmpty = !email || !email.trim();
        if (isEmpty && required) {
            return { valid: false, message: `${t('validation.email')} ${t('validation.cannot be empty')}` };
        }
        if (!isEmpty) {
            if (email.length < config.limitations.Min_Email_Length) return { valid: false, message: `${t('validation.email')} ${t('validation.too short')}` };
            if (email.length > config.limitations.Max_Email_Length) return { valid: false, message: `${t('validation.email')} ${t('validation.too long')}` };
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!regex.test(email)) return { valid: false, message: `${t('validation.invalid email')}` }
        }
        return { valid: true };
    }
    function isPasswordValid(password) {
        // length checks
        if (!password || !password.trim()) return { valid: false, message: `${t('validation.password')} ${t('validation.cannot be empty')}` };
        if (password.length < config.limitations.Min_Password_Length) return { valid: false, message: `${t('validation.password')} ${t('validation.too short')}` };
        if (password.length > config.limitations.Max_Password_Length) return { valid: false, message: `${t('validation.password')} ${t('validation.too long')}` };

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
        if (!token || !token.trim()) return { valid: false, message: `${t('validation.token')} ${t('validation.cannot be empty')}` };
        if (token.length < config.limitations.Min_Token_Length) return { valid: false, message: `${t('validation.token')} ${t('validation.too short')}` };
        if (token.length > config.limitations.Max_Token_Length) return { valid: false, message: `${t('validation.token')} ${t('validation.too long')}` };
        return { valid: true };
    }

    return {
        isUsernameValid,
        isEmailValid,
        isPasswordValid,
        isRegisterTokenValid
    };
}