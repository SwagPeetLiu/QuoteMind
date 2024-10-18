import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation(); // access the gloabal translation function
import { mapInstanceRoute } from '../utils/formatters';

const instance = {
    getSpecificEntity: (data) => {
        if (!data || !data.target || !data.id ){
            console.warn("Incomplete information");
            return { isCompleted: false, data: null };
        }

        return axios
            .get(`/${mapInstanceRoute(data.target)}/${data.id}`)
            .then((response) => {
                return { isCompleted: true, data: response.data };
            })
            .catch((error) => {
                store.commit("setToastMessage", { message: `${t('apiMessage.instance.failed to fetch')}${t(`routes.${data.target}`)}`, type: "error" });
                console.error(`failed to fetch ${data.target}`, error);
                return { isCompleted: false, data: null };
            });
    },
    updateSpecificEntity: (data) => {
        if (!data || !data.target || !data.id ){
            console.warn("Incomplete information");
            return { isCompleted: false };
        }
        return axios
            .put(`/${mapInstanceRoute(data.target)}/${data.id}`, data.body)
            .then(() => {
                store.commit("setToastMessage", { message: `${t('apiMessage.instance.successfully updated')}${t(`routes.${data.target}`)}`, type: "success" });
                return { isCompleted: true };
            })
            .catch((error) => {
                store.commit("setToastMessage", { message: `${t('apiMessage.instance.failed to update')}${t(`routes.${data.target}`)}`, type: "error" });
                console.error(`failed to fetch ${data.target}`, error);
                return { isCompleted: false };
            });
    }
};

export default instance;