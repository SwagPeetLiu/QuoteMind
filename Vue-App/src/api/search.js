import axios from 'axios';
import store from '../store';
import { useTranslation } from '../utils/I18n';
import { useValidators } from '../utils/useValidators'; 
const { isSearchTableValid, isSearchBodyValid } = useValidators();
const { global: { t } } = useTranslation(); // access the gloabal translation function

const search = {
    // get a copy of the database References when the app starts
    getReferences: () => {
        if (!store.getters.getIsAuthenticated) {
            console.warn("cannot fetch for DB references if not logged in");
        }
        else{
            return axios
                .get('/search/targets')
                .then((response) => {
                    store.commit("setDBRefs", response.data.targets); // store the valdi targets for future uses
                })
                .catch((error) => {
                    store.commit("setToastMessage", { message: t("apiMessage.search.failed to fetch dbReferences"), type: "error" });
                    console.error("failed to get DB references", error);
                });
        }
    },

    // route to post searches across entities
    getSearchResults: (data) => {
        if (!data || !data.table || !data.body ){
            console.warn("Incomplete information");
            return { isCompleted: false, data: null };
        }

        const tableValidation = isSearchTableValid(data.table, store.getters.getDBRefs);
        if (!tableValidation.valid) {
            store.commit("setToastMessage", { message: tableValidation.message, type: "error" });
            return { isCompleted: false, data: null };
        }

        const searchValidation = isSearchBodyValid(data.body);
        if (!searchValidation.valid) {
            store.commit("setToastMessage", { message: searchValidation.message, type: "error" });
            return { isCompleted: false, data: null };
        }
        
        // return the results that contains the results[] & count
        return axios
            .post(`/search/${data.table}`, data.body)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                store.commit("setToastMessage", { message: t("apiMessage.search.failed to search"), type: "error" });
                console.error("failed to search", error);
                return { isCompleted: false, data: null };
            });
    },

    // get the Top clients & Comapnies that would require quotation attentions:
    getQuotationTargets:(data) => {
        if (!data || !data.target ){
            console.warn("Incomplete information");
            return { isCompleted: false, data: null };
        }
        if (typeof data.target != "string" || (data.target != "clients" && data.target != "companies")) {
            store.commit("setToastMessage", { message: t('validation.invalid performance target'), type: "error" });
            return { isCompleted: false, data: null };
        }
        return axios
            .get(`/search/top-${data.target}`)
            .then((response) => {
                return { isCompleted: true, data: response.data };
            })
            .catch((error) => {
                store.commit("setToastMessage", { message: `${t("apiMessage.search.failed to obtain the top")}${t(`routes.${data.target}`)}`, type: "error" });
                console.error("failed to get quotation targets", error);
                return { isCompleted: false, data: null };
            });
    }
}

export default search;