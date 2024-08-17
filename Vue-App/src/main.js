/**
=========================================================
* Vue Soft UI Dashboard - v3.0.0
=========================================================

* Product Page: https://creative-tim.com/product/vue-soft-ui-dashboard
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import { useTranslation } from "./utils/I18n";
import { setBaseURL } from "./utils/apiSetter";
import router from "./router";
import SoftUIDashboard from "./soft-ui-dashboard";
//import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // JS bundle only
import 'bootstrap'; // ensure both JS and CSS are included
import DOMPurify from 'dompurify';

// set up the baseURL for the back-end Restful API:
setBaseURL();

// instantiate the app
const appInstance = createApp(App);
appInstance.use(store);
const i18n = useTranslation();
appInstance.use(router);
appInstance.use(i18n);
appInstance.use(SoftUIDashboard);
appInstance.provide('$sanitize', (dirty) => DOMPurify.sanitize(dirty));
appInstance.mount("#app");
