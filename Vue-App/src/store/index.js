import { createStore } from "vuex";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
import { setToken, clearToken } from "../utils/apiSetter";
import { startLoginTimer, startLogoutTimer, clearLogoutTimer, clearPreviousTimers } from "../utils/sessionManager";
import { generateSearchQueryWhereClause } from "../utils/formatters";

// centralised state management over the application
export default createStore({
  state: {
    // user info settings
    language: localStorage.getItem("language") || "en",
    userSessionManager: { login: null, logout: null, blurListener: null, focusListener: null},
    user:{ username: "", email: "", role: "", session: ""},
    isAuthenticated: false,
    dbReferences: null, // object of objects

    // controls the display of the configurator:
    hideConfigButton: false,
    showConfig: false,

    // control the display of the sidenav menu
    isTransparent: "bg-transparent",
    isPinned: true,
    isMenuFixed: false,
    menuAct: {hoverOver: false, mainLink: "", subLink: ""},
    pillResizing: false,

    // top nav bar settings:
    isNavFixed: false, 
    isRTL: false,

    // app vue display settings
    themeColor: localStorage.getItem("theme") || "success",
    showSidenav: true,
    showNavbar: true,
    showFooter: true,

    // display settings:
    navbarFixed: "position-sticky blur shadow-blur left-auto top-1 z-index-sticky px-0 mx-4",
    absolute: "position-absolute px-4 mx-0 w-100 z-index-2",
    bootstrap,

    // async loading handles
    loadingDelay: 600,
    errorMessage: "",
    toastMessage: { message: "", type: "" },

    // Entity Representation Messages:
    searchWhereBody: null
  },
  mutations: {
    // function to toggle the config button at the right bottom of the screen
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },

    // function used to minimise the navbar on small screens
    toggleMenuOnSmallScreens(state) {
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

    // sideMenu set to being fixed or not
    setMenuFixed(state, payload) {
      state.isMenuFixed = payload;
      const sidenav_show = document.querySelector(".g-sidenav-show");

      if (payload == true) {
        sidenav_show.classList.remove("g-sidenav-hidden");
      }
      else{
        sidenav_show.classList.add("g-sidenav-hidden");
      }
    },

    // Toggle the side menu's colour
    sidebarType(state, payload) {
      state.isTransparent = payload;
    },

    // setting the theme colour of the app
    async setThemeColor(state, payload) {
      localStorage.setItem("theme", payload);
      state.themeColor = payload;
    },

    // changing the theme colours of the app (navbar for now)
    cardBackground(state, payload) {
      state.color = payload;
    },

    // Function to set the top navbar fixed:
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
      state.user = {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        session: payload.session
      };
      state.isAuthenticated = true;

      // setting the automatic mechanism for renew session and logout:
      clearPreviousTimers();
      startLoginTimer(payload.credentials);
      window.addEventListener('blur', startLogoutTimer);
      window.addEventListener('focus', clearLogoutTimer);
      state.userSessionManager.blurListener = startLogoutTimer;
      state.userSessionManager.focusListener = clearLogoutTimer;

      // set up axios header
      setToken(payload.session);

      // if testing, then remember the login credentials:
      if (process.env.NODE_ENV === 'test') {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    // clear the user info & session association;
    clearUser(state) {
      state.user = { username: "", email: "", role: "", session: ""};
      state.isAuthenticated = false;
      state.dbReferences = null;

      // if testing, then clear the login credentials in prior:
      if (process.env.NODE_ENV === 'test') {
        localStorage.removeItem('user');
        localStorage.removeItem('dbRefs');
      }
    
      // clear the automatic mechanism for renew session and logout:
      clearPreviousTimers();
      
      // Clear axios header
      clearToken();
    },

    // manage the user sessions
    setUserSessionManager(state, payload) {
      state.userSessionManager = { ...payload };
    },

    // menu action tracks:
    setMenuAct(state, payload) {
      state.menuAct = { ...payload };
    },

    // used to setUp the database references for application search route:
    setDBRefs(state, payload) {
      state.dbReferences = { ...payload };
      if (process.env.NODE_ENV === 'test') {
        localStorage.setItem('dbRefs', JSON.stringify(state.dbReferences));
      }
    },

    // message commutes
    setErrorMessage(state, payload) {
      state.errorMessage = payload;
    },
    setToastMessage(state, payload) {
      state.toastMessage = payload;
    },
    setPillResizing(state, payload) {
      state.pillResizing = payload;
    },

    // transformative function used to map filtration Area into API where clauses:
    setSearchWhereBody(state, payload) {
      state.searchWhereBody = generateSearchQueryWhereClause(payload.conditions, payload.operators);
      //console.log("store: setting WhereClause:", state.searchWhereBody);
    }
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
    getMainTheme: (state) => state.themeColor,
    getDBRefs: (state) => state.dbReferences
  },
});
