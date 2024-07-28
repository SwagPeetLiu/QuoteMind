import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
const { global: { t } } = useTranslation(); 

const counter = {
    getCounter: (data) => {
        if (!data || !data.target) {
            console.warn("Incomplete counter information");
            return { isCompleted: false, counts: "- -" };
        }
        else{
            return axios
                .get(`/counter/${data.target}`)
                .then((response) => {
                    return { isCompleted: true, counts: response.data.counts };
                })
                .catch((error) => {
                    store.commit("setToastMessage", 
                        { message: `${t("apiMessage.fetch")}${data.target}${t("apiMessage.failed")}`, type: "error" });
                    console.error(`failed to count ${data.target}`, error);
                    return { isCompleted: false, counts: "- -" };
                });
        }
    }
}
export default counter;

