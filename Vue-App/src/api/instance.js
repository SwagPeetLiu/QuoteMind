import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation(); // access the gloabal translation function

const instance = {
    getSpecificEntity: (data) => {
        if (!data || !data.target || !data.id ){
            console.warn("Incomplete information");
            return { isCompleted: false, data: null };
        }
        return axios
            .get(`/${data.target}/${data.id}`)
            .then((response) => {
                return { isCompleted: true, data: response.data };
            })
            .catch((error) => {
                store.commit("setToastMessage", { message: t("apiMessage.search.failed to fetch dbReferences"), type: "error" });
                console.error(`failed to fetch ${data.target}`, error);
                return { isCompleted: false, data: null };
            });
    }
};

export default instance;