<template>
  <div 
    class="fixed-plugin"
    ref="configuratorContainer"
    :class="{ 'show' : this.$store.state.showConfig }"
  >
    <a class="px-3 py-2 fixed-plugin-button text-dark position-fixed" @click.prevent="toggleConfig">
      <i class="py-2 fa fa-cog"> </i>
    </a>

    <!-- Configurator Card -->
    <div class="shadow-lg card blur">
      <div class="pt-3 pb-0 bg-transparent card-header">
        <div class="float-start">
          <h5 class="mt-3 mb-0">{{ t("configurator.Title") }}</h5>
          <p>{{ t("configurator.Subtitle") }}</p>
        </div>

        <!-- toggle button -->
        <div class="mt-4 float-end" @click="toggle">
          <button class="p-0 btn btn-link text-dark fixed-plugin-close-button">
            <i class="fa fa-close"></i>
          </button>
        </div>
      </div>

      <hr class="my-1 horizontal dark" />
      <div class="pt-0 card-body pt-sm-3">

        <!-- Application Theme colouring -->
        <div>
          <h6 class="mb-0">{{ t("configurator.SideBar Colours") }}</h6>
        </div>
        <a href="#" class="switch-trigger background-color">
          <div class="my-2 badge-colors" :class="this.$store.state.isRTL ? 'text-end' : ' text-start'">
            <span class="badge filter bg-gradient-primary active" data-color="primary" @click="themeColor('primary')"></span>
            <span class="badge filter bg-gradient-dark" data-color="dark" @click="themeColor('dark')"></span>
            <span class="badge filter bg-gradient-info" data-color="info" @click="themeColor('info')"></span>
            <span class="badge filter bg-gradient-success" data-color="success" @click="themeColor('success')"></span>
            <span class="badge filter bg-gradient-warning" data-color="warning" @click="themeColor('warning')"></span>
            <span class="badge filter bg-gradient-danger" data-color="danger" @click="themeColor('danger')"></span>
          </div>
        </a>

        <!-- Sidenav Type -->
        <div class="mt-3">
          <h6 class="mb-0">{{ t("configurator.SideNav Type") }}</h6>
          <p class="text-sm">{{ t("configurator.Sidenav Type Description") }}</p>
        </div>
        <div class="d-flex">
          <button id="btn-transparent" class="px-3 mb-2 btn bg-gradient-success w-100"
            :class="ifTransparent === 'bg-transparent' ? 'active' : ''" @click="sidebarType('bg-transparent')">
            {{ t("configurator.Transparent") }}
          </button>
          <button id="btn-white" class="px-3 mb-2 btn bg-gradient-success w-100 ms-2"
            :class="ifTransparent === 'bg-white' ? 'active' : ''" @click="sidebarType('bg-white')">
            {{ t("configurator.White") }}
          </button>
        </div>
        <p class="mt-2 text-sm d-xl-none d-block">
          {{ t("configurator.Sidenav Type Limitation") }}
        </p>

        <!-- Navbar Fixed -->
        <div class="mt-3">
          <h6 class="mb-0">{{ t("configurator.Navbar Fixed") }}</h6>
        </div>
        <div class="form-check form-switch ps-0">
          <input class="mt-1 form-check-input ms-auto" 
            type="checkbox" id="navbarFixed" :checked="this.$store.state.isNavFixed" @change="setNavbarFixed"/>
        </div>

        <!-- Menu Fixed -->
        <div class="mt-3">
          <h6 class="mb-0">{{ t("configurator.Side Menu Fixed") }}</h6>
        </div>
        <div class="form-check form-switch ps-0">
          <input class="mt-1 form-check-input ms-auto" 
            type="checkbox" id="menuFixed" :checked="this.$store.state.isMenuFixed" @change="setMenuFixed" />
        </div>

       <!--language selection-->
       <h6 class="mt-3 mb-2">{{ t("configurator.Language") }}</h6>
       <languageDropDown/>

        <!-- contribution EOI-->
        <hr class="horizontal dark my-sm-4" />
        <a class="btn bg-gradient-info w-100" target="_blank" rel="noopener noreferrer"
          href="https://www.creative-tim.com/product/vue-soft-ui-dashboard-pro"
          @click="closeConfig"
          >
          {{ t("configurator.Contribution Interest") }}
        </a>

        <!-- allow logout if user is logged in-->
        <button v-if="this.$store.getters.getIsAuthenticated" class="text-center btn bg-gradient-dark w-100"
          :disabled="isLoading" @click.prevent="logout">
          <Spinner v-if="isLoading" class="spinner-border"/>
          <span v-else>{{ t("configurator.Logout") }}</span>
        </button>

        <!-- if not logged in use sign up-->
        <router-link v-else @click="closeConfig" :to="{ name: 'Sign Up' }" class="btn bg-gradient-dark w-100">{{
          t('signIn.sign up') }}
        </router-link>

        <!-- doc direction-->
        <a class="btn btn-outline-dark w-100" target="_blank" rel="noopener noreferrer"
          href="https://535051192liu.atlassian.net/wiki/spaces/KAN"
          @click="closeConfig"
          >
          {{ t("configurator.View documentation") }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";
import Spinner from "../reuseable-components/loader/Spinner.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import auth from "@/api/auth";
import languageDropDown from "@/components/reuseable-components/styler/languageDropDown.vue";

export default {
  name: "configurator",
  props: ["toggle"],
  components:{
    Spinner,
    languageDropDown
  },
  setup() {
    const { t } = useI18n();
    const isLoading = ref(false);
    return { t, isLoading };
  },
  methods: {
    ...mapMutations(["navbarMinimize", "sidebarType", "navbarFixed", "toggleConfigurator"]),
    ...mapActions(["toggleSidebarColor"]),

    // funciton used to set the theme colours of the app
    themeColor(color = "dark") {
      this.$store.commit("setThemeColor", color);
    },

    sidebarType(type) {
      this.toggleSidebarColor(type);
    },

    setNavbarFixed() {
      this.navbarFixed();
    },
    // function used to dynamically set the menu fixed or not
    setMenuFixed(){
      const isFixed = !this.$store.state.isMenuFixed;
      this.$store.commit("setMenuFixed", isFixed);
    },

    // function that watch outs for the changes of the screen sizes
    // if the screen size is smaller than 720px (md)
    // the side menu background colour cannot change
    sidenavTypeOnResize() {
      let transparent = document.querySelector("#btn-transparent");
      let white = document.querySelector("#btn-white");
      if (window.innerWidth < 720) {
        transparent.classList.add("disabled");
        white.classList.add("disabled");
      } else {
        transparent.classList.remove("disabled");
        white.classList.remove("disabled");
      }
    },
    toggleConfig(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.toggleConfigurator();
    },
    // functions used to handle configurator closure:
    handleClickOutside(event) {
      if (this.$store.state.showConfig === true &&
        this.$refs.configuratorContainer &&
        !this.$refs.configuratorContainer.contains(event.target) &&
        this.$store.getters.haveNoDialogs === true
      ) {
        this.$store.state.showConfig = false;
        document.removeEventListener('click', this.handleClickOutside, true);
      }
    },
    addOutsideClickListener() {
      setTimeout(() => {
        document.addEventListener('click', this.handleClickOutside, true);
      }, 100);
    },
    closeConfig() {
      this.$store.state.showConfig = false;
      document.removeEventListener('click', this.handleClickOutside, true);
    },

    // function used to logout the user:
    logout() {
      if (this.$store.getters.getIsAuthenticated && this.$store.getters.getUser.session) {
        this.isLoading = true;
        setTimeout(() => {
          auth.logout()
            .then((isLoggedOut) => {
              if (isLoggedOut) {
                this.closeConfig();
              }
            })
            .catch((err) => {
              console.error(err);
            })
            .finally(() => {
              this.isLoading = false;
              // if you failed to logout (i.e., still logged in), set an error message
              if (this.$store.getters.getIsAuthenticated) {
                this.$store.commit("setErrorMessage", this.t('apiMessage.logout.failed'));
              }
            });
        }, this.$store.state.loadingDelay);
      }
    }
  },
  watch: {
    '$store.state.showConfig': {
      handler(newValue) {
        if (newValue) {
          // ensure attachment of listener occurs after DOM updates
          this.$nextTick(() => {
            this.addOutsideClickListener();
          });
        }
      }
    }
  },
  computed: {
    // whether the current nav menu is transparent or not
    ifTransparent() {
      return this.$store.state.isTransparent;
    },

    // call the function to enable and disable the nav menue bg changes
    sidenavResponsive() {
      return this.sidenavTypeOnResize;
    }
  },
  beforeMount() {
    // Deactivate sidenav type buttons on resize and small screens
    window.addEventListener("resize", this.sidenavTypeOnResize);
    window.addEventListener("load", this.sidenavTypeOnResize);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  },
};
</script>
