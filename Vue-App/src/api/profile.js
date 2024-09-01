import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
import auth from './auth';
const { global: { t } } = useTranslation(); // access the gloabal translation function

const profile = {
    updateProfile: (data) => {
        if (!data || !data.email || !data.password || !data.username) {
            console.warn("Incomplete information");
            return { isCompleted: false };
        }
        if (store.state.user.email !== data.email) {
            store.commit("setToastMessage", { message: t("apiMessage.profile.email cannot be changed"), type: "warning" });
            return { isCompleted: false };
        }
        return axios
            .post('/profile', data)
            .then(() => {
                // after successfully updating tehe profile, then the user should be re-logged in
                auth
                    .login({ email: data.email, password: data.password })
                    .then(() => {
                        return { isCompleted: true };
                    })
                    .catch((error) => {
                        console.error("failed to update profile", error);
                        store.commit("setToastMessage", { message: t("apiMessage.login.failed"), type: "error" });
                        return { isCompleted: false };
                    });
            })
            .catch((error) => {
                console.error("failed to update profile", error);
                store.commit("setToastMessage", { message: t("apiMessage.profile.failed"), type: "error" });
                return { isCompleted: false };
            });
    }
}

export default profile;