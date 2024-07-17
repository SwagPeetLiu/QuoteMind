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
import { createCustomisedI18n } from "./utils/I18n";
import { setBaseURL } from "./utils/apiSetter";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import SoftUIDashboard from "./soft-ui-dashboard";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// set up the baseURL for the back-end Restful API:
setBaseURL();

// instantiate the app
const appInstance = createApp(App);
appInstance.use(store);
const i18n = createCustomisedI18n();
appInstance.use(router);
appInstance.use(i18n);
appInstance.use(SoftUIDashboard);
appInstance.mount("#app");
