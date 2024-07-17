<template>
  <div class="fixed-plugin" ref="configuratorContainer">
    <a class="px-3 py-2 fixed-plugin-button text-dark position-fixed" @click.prevent="toggleConfig">
      <i class="py-2 fa fa-cog"> </i>
    </a>
    <div class="shadow-lg card blur">
      <div class="pt-3 pb-0 bg-transparent card-header">
        <div class="float-start">
          <h5 class="mt-3 mb-0">{{ t("configurator.Title") }}</h5>
          <p>{{ t("configurator.Subtitle") }}</p>
        </div>
        <div class="mt-4 float-end" @click="toggle">
          <button class="p-0 btn btn-link text-dark fixed-plugin-close-button">
            <i class="fa fa-close"></i>
          </button>
        </div>
        <!-- End Toggle Button -->
      </div>
      <hr class="my-1 horizontal dark" />
      <div class="pt-0 card-body pt-sm-3">
        <!-- Sidebar Backgrounds -->
        <div>
          <h6 class="mb-0">{{ t("configurator.SideBar Colours") }}</h6>
        </div>
        <a href="#" class="switch-trigger background-color">
          <div class="my-2 badge-colors" :class="this.$store.state.isRTL ? 'text-end' : ' text-start'">
            <span class="badge filter bg-gradient-primary active" data-color="primary"
              @click="sidebarColor('primary')"></span>
            <span class="badge filter bg-gradient-dark" data-color="dark" @click="sidebarColor('dark')"></span>
            <span class="badge filter bg-gradient-info" data-color="info" @click="sidebarColor('info')"></span>
            <span class="badge filter bg-gradient-success" data-color="success" @click="sidebarColor('success')"></span>
            <span class="badge filter bg-gradient-warning" data-color="warning" @click="sidebarColor('warning')"></span>
            <span class="badge filter bg-gradient-danger" data-color="danger" @click="sidebarColor('danger')"></span>
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
          <input class="mt-1 form-check-input" :class="this.$store.state.isRTL ? 'float-end  me-auto' : ' ms-auto'"
            type="checkbox" id="navbarFixed" :checked="this.$store.state.isNavFixed" @change="setNavbarFixed"
            v-model="fixedKey" />
        </div>

        <!--language selection-->
        <div class="dropdown mt-3" ref="language-select">
          <h6 class="mb-1">{{ t("configurator.Language") }}</h6>
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
            data-bs-toggle="dropdown" aria-expanded="false">
            {{ this.$store.state.language == "en" ?
              t("configurator.English") : t("configurator.Chinese")
            }}
            <span class="arrow-right ms-2"></span>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('en')">{{ t("configurator.English") }}</a>
            </li>
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('ch')">{{ t("configurator.Chinese") }}</a>
            </li>
          </ul>
        </div>

        <!-- config buttons-->
        <hr class="horizontal dark my-sm-4" />
        <a class="btn bg-gradient-info w-100" 
            target="_blank" 
            rel="noopener noreferrer"
            href="https://www.creative-tim.com/product/vue-soft-ui-dashboard-pro">
          {{ t("configurator.Contribution Interest") }}
        </a>

        <button v-if="this.$store.getters.getIsAuthenticated" 
          class="btn bg-gradient-dark w-100" @click="logout">
          {{ t("configurator.Logout") }}
        </button>
        <router-link v-else :to="{ name: 'Sign Up' }" class="btn bg-gradient-dark w-100">{{
          t('signIn.sign up') }}
        </router-link>
        
        <a class="btn btn-outline-dark w-100" 
          target="_blank"
          rel="noopener noreferrer"
          href="https://535051192liu.atlassian.net/wiki/spaces/KAN">
          {{ t("configurator.View documentation") }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";
import { useI18n } from "vue-i18n";
export default {
  name: "configurator",
  props: ["toggle"],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      fixedKey: "",
    };
  },
  methods: {
    ...mapMutations(["navbarMinimize", "sidebarType", "navbarFixed"]),
    ...mapActions(["toggleSidebarColor"]),

    sidebarColor(color = "success") {
      document.querySelector("#sidenav-main").setAttribute("data-color", color);
      this.$store.state.mcolor = `card-background-mask-${color}`;
    },

    sidebarType(type) {
      this.toggleSidebarColor(type);
    },

    setNavbarFixed() {
      if (this.$route.name !== "Profile") {
        this.$store.state.isNavFixed = !this.$store.state.isNavFixed;
      }
    },

    sidenavTypeOnResize() {
      let transparent = document.querySelector("#btn-transparent");
      let white = document.querySelector("#btn-white");
      if (window.innerWidth < 1200) {
        transparent.classList.add("disabled");
        white.classList.add("disabled");
      } else {
        transparent.classList.remove("disabled");
        white.classList.remove("disabled");
      }
    },

    setLanguage(language) {
      if (language === this.$i18n.locale) {
        return;
      }
      this.$i18n.locale = language;
      this.$store.commit("setLanguage", language);
      this.$refs["language-select"].blur(); // remove the focus on the selection:
    },
    toggleConfig(event){
      if (event){
        event.preventDefault();
        event.stopPropagation();
      }
      this.toggle();
    },
    // functions used to handle configurator closure:
    handleClickOutside(event) {
      if (this.$store.state.showConfig === true &&
        this.$refs.configuratorContainer &&
        !this.$refs.configuratorContainer.contains(event.target)) {
        this.$store.state.showConfig = false;
        document.removeEventListener('click', this.handleClickOutside, true);
      }
    },
    addOutsideClickListener() {
      setTimeout(() => {
        document.addEventListener('click', this.handleClickOutside, true);
      }, 100);
    },
  },
  watch: {
    '$store.state.showConfig': {
      handler(newValue) {
        console.log("new value", newValue)
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
    ifTransparent() {
      return this.$store.state.isTransparent;
    },
    sidenavResponsive() {
      return this.sidenavTypeOnResize;
    }
  },
  beforeMount() {
    this.$store.state.isTransparent = "bg-transparent";
    // Deactivate sidenav type buttons on resize and small screens
    window.addEventListener("resize", this.sidenavTypeOnResize);
    window.addEventListener("load", this.sidenavTypeOnResize);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  },
};
</script>
