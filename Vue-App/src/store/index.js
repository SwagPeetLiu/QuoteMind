import { createStore } from "vuex";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
import { setToken, clearToken } from "../utils/apiSetter";

// centralised state management over the application
export default createStore({
  state: {
    language: localStorage.getItem("language") || "en",
    user:{ username: "", email: "", role: "", session: ""},
    isAuthenticated: false,
    hideConfigButton: false,
    isPinned: true,
    showConfig: false,
    isTransparent: "", // transparent or white colour of side 
    isRTL: false,
    color: "",
    isNavFixed: false, 
    isAbsolute: false,
    showNavs: true, // by default, it should shows the navigations relatively
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    navbarFixed: "position-sticky blur shadow-blur left-auto top-1 z-index-sticky px-0 mx-4",
    absolute: "position-absolute px-4 mx-0 w-100 z-index-2",
    bootstrap,
  },
  mutations: {
    // function 
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    // function used to minimise the navbar:
    navbarMinimize(state) {
      const sidenav_show = document.querySelector(".g-sidenav-show");
      if (sidenav_show.classList.contains("g-sidenav-hidden")) {
        sidenav_show.classList.remove("g-sidenav-hidden");
        sidenav_show.classList.add("g-sidenav-pinned");
        state.isPinned = true;
      } else {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      }
    },
    sidebarType(state, payload) {
      state.isTransparent = payload;
    },
    cardBackground(state, payload) {
      state.color = payload;
    },
    navbarFixed(state) {
      if (state.isNavFixed === false) {
        state.isNavFixed = true;
      } else {
        state.isNavFixed = false;
      }
    },
    toggleEveryDisplay(state) {
      state.showNavbar = !state.showNavbar;
      state.showSidenav = !state.showSidenav;
      state.showFooter = !state.showFooter;
    },
    toggleHideConfig(state) {
      state.hideConfigButton = !state.hideConfigButton;
    },
    // Language Selection:
    setLanguage(state, lang) {
      state.language = lang;
      localStorage.setItem("language", lang);
    },
    // set up the user info & allow authorised queries
    setUser(state, payload) {
      state.user = payload;
      state.isAuthenticated = true;
      setToken(payload.session);
    },
    // clear the user info & session association;
    clearUser(state) {
      state.user = { username: "", email: "", role: "", session: ""};
      state.isAuthenticated = false;
      clearToken();
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
    setCardBackground({ commit }, payload) {
      commit("cardBackground", payload);
    },
  },
  getters: {
    getIsAuthenticated: (state) => state.isAuthenticated,
    getLanguage: (state) => state.language,
    getUser: (state) => state.user
  },
});
