import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation(); // access the gloabal translation function

// registeration route endpoints:
const register = {
    register: (data) => {
        if (!data || !data.username || !data.email || !data.password || !data.registerToken){
            console.warn("Incomplete information");
            return false;
        }
        return axios.post('/register', data)
        .then(() => {
            store.commit("setToastMessage", { message: t("apiMessage.register.success"), type: "success" });
            return true;
        })
        .catch((error) => {
            const message = error.response.data.message;
            if (message == "Network Error") {
                store.commit("setToastMessage", { message: t("apiMessage.register.failed"), type: "error" });
            }
            else if (message == "Complete Registeration form is required") {
                store.commit("setToastMessage", { message: t("apiMessage.register.incompleteness message"), type: "error" });
            }
            else if (message == "Invalid Token Provided"){
                store.commit("setToastMessage", { message: t("apiMessage.register.invalid token message"), type: "error" });
            }
            else if (message == "Email already exists"){
                store.commit("setToastMessage", { message: t("apiMessage.register.already registered message"), type: "error" });
            }
            else{
                store.commit("setToastMessage", { message: t("apiMessage.register.failed"), type: "error" });
            }
            console.error("failed to register", error);
            return false;
        });
    }

}
export default register;