import axios from 'axios';
import store from '../store';
import search from './search';
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation(); // access the gloabal translation function

// Authentication used to update access of a user
const auth = {
    login: (data) => {
        if (!data || !data.email || !data.password){
            console.warn("Incomplete information");
            return false;
        }
        return axios.post('/auth', data)
        .then((response) => {
            store.commit('setUser', {
                username: response.data.username,
                email: response.data.email,
                role: response.data.role,
                session: response.data.session_token,
                access: response.data.access_token,
                credentials: data
            });
            store.commit("setToastMessage", { message: t("apiMessage.login.success"), type: "success" });

            // set up the database references when loggin the user in
            search.getReferences();
            return true;
        })
        .catch((error) => {
            store.commit("setToastMessage", { message: t("apiMessage.login.failed"), type: "error" });
            console.error("failed to login", error.message);
            return false;
        });
    },
    logout: () => {
        const currentUser = store.getters.getUser;
        if (!currentUser || 
            !currentUser.session || 
            !currentUser.email) {
            console.warn("Cannot loggout if not logged in");
            return false;
        }
        return axios.post('/auth/logout', {
            email: currentUser.email,
            session_token: currentUser.session
        })
        .then(() => {
            store.commit("setToastMessage", { message: t("apiMessage.logout.success"), type: "success" });
            store.commit('clearUser');
            return true;
        })
        .catch((error) => {
            store.commit("setToastMessage", { message: t("apiMessage.logout.failed"), type: "error" });
            console.error("failed to logout", error);
            store.commit('clearUser');
            return false;
        });
    }
};

export default auth;