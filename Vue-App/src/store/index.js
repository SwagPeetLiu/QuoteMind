import { createStore } from "vuex";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
import { setToken, clearToken } from "../utils/apiSetter";

// centralised state management over the application
export default createStore({
  state: {
    // user info settings
    language: localStorage.getItem("language") || "en",
    user:{ username: "", email: "", role: "", session: ""},
    isAuthenticated: false,

    // controls the display of the configurator:
    hideConfigButton: false,
    showConfig: false,

    // control the display of the navbar
    isTransparent: "", // transparent or white colour of side 
    color: "",
    isNavFixed: false, 

    isPinned: true,
    isRTL: false,
    isAbsolute: false,

    // app vue display settings
    showSidenav: true,
    showNavbar: true,
    showFooter: true,

    // display settings:
    navbarFixed: "position-sticky blur shadow-blur left-auto top-1 z-index-sticky px-0 mx-4",
    absolute: "position-absolute px-4 mx-0 w-100 z-index-2",
    bootstrap,

    // async loading handles
    loadingDelay: 800,
    errorMessage: "",
    toastMessage: { message: "", type: "" },
  },
  mutations: {
    // function to toggle the config button at the right bottom of the screen
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

    // constrols the display of the layout components 
    // when going to non-dashboard pages
    toggleEveryDisplay(state) {
      state.showNavbar = !state.showNavbar;
      state.showSidenav = !state.showSidenav;
      state.showFooter = !state.showFooter;
    },

    // toggle to Hide config button
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
    setErrorMessage(state, payload) {
      state.errorMessage = payload;
    },
    setToastMessage(state, payload) {
      state.toastMessage = payload;
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
    setCardBackground({ commit }, payload) {
      commit("cardBackground", payload);
    }
  },
  getters: {
    getIsAuthenticated: (state) => state.isAuthenticated,
    getLanguage: (state) => state.language,
    getUser: (state) => state.user,
    haveNoDialogs: (state) => state.errorMessage === "",
  },
});
