import { createStore } from "vuex";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
import { setToken, clearToken } from "../utils/apiSetter";
import { startLogoutTimer, clearLogoutTimer, clearPreviousTimers } from "../utils/sessionManager";
import { generateSearchQueryWhereClause } from "../utils/formatters";
import { secureStorage } from "../utils/secureStorage";

// centralised state management over the application
export default createStore({
  state: {
    // user info settings
    language: secureStorage.getItem("language") || "en",
    userSessionManager: { logout: null, blurListener: null, focusListener: null},
    user: { username: "", email: "", role: "", session: "", access: ""},
    isAuthenticated: false,
    dbReferences: null, // object of objects

    // controls the display of the configurator:
    showConfig: false,

    // controls the display of instance Slider:
    showInstanceSlider: { display: false, id: null, target: null },
    refreshListing: false,

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
    themeColor: secureStorage.getItem("theme") || "success",
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
    searchWhereBody: null,
    searchTarget: {target: null, counts: null},
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
      secureStorage.setItem("theme", payload);
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

    // toggle to show and hide the instance slider
    toggleInstanceSlider(state, payload) {
      state.showInstanceSlider = { ...payload };
    },

    // Language Selection:
    setLanguage(state, lang) {
      state.language = lang;
      secureStorage.setItem("language", lang);
    },

    // set up the user info & allow authorised queries
    setUser(state, payload) {
      state.user = {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        session: payload.session,
        access: payload.access
      };
      state.isAuthenticated = true;

      // setting the automatic mechanism for renew session and logout:
      clearPreviousTimers();
      window.addEventListener('blur', startLogoutTimer);
      window.addEventListener('focus', clearLogoutTimer);
      state.userSessionManager.blurListener = startLogoutTimer;
      state.userSessionManager.focusListener = clearLogoutTimer;

      // set up axios header
      setToken(payload.session, payload.access);

      // if testing, then remember the login credentials:
      secureStorage.setItem('user', JSON.stringify(state.user));
    },
    
    // clear the user info & session association;
    clearUser(state) {
      state.user = { username: "", email: "", role: "", session: "", access: ""};
      state.isAuthenticated = false;
      state.dbReferences = null;
      state.showInstanceSlider = { display: false, id: null, target: null };

      // clear the login credentials in prior:
      secureStorage.removeItem('user');
      secureStorage.removeItem('dbRefs');
    
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
      secureStorage.setItem('dbRefs', JSON.stringify(state.dbReferences));
    },

    // message commutes
    setErrorMessage(state, payload) {
      state.errorMessage = payload;
    },
    setToastMessage(state, payload) {
      state.toastMessage = payload;
    },

    // controls the resizing of the Manue Pills
    setPillResizing(state, payload) {
      state.pillResizing = payload;
    },

    // transformative function used to map filtration Area into API where clauses:
    setSearchWhereBody(state, payload) {
      state.searchWhereBody = generateSearchQueryWhereClause(payload.conditions, payload.operators);
    },
    // controls which instances the client is searching
    setSearchTarget(state, payload) {
      state.searchTarget = payload;
    },
    // controls the need to refresh the listings of the current instances
    setRefreshListing(state, payload) {
      state.refreshListing = payload;
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
