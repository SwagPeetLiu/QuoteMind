<!-- navbar on the top of the main container -->
<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" 
      v-bind="$attrs" 
      id="navbarBlur"
      data-scroll="true"
  >
    <div class="px-3 py-1 container-fluid">

      <!-- Page directories breadcrumb -->
      <breadcrumbs :currentPage="currentRouteName" :textWhite="textWhite" />

      <!-- nav bar options -->
      <ul class="navbar-nav justify-content-end mt-2">

        <!-- logout button -->
        <li class="nav-item d-flex align-items-center">
          <div 
            @click="logout" class="px-0 nav-link font-weight-bold d-flex align-items-center" 
            :class="textWhite ? textWhite : 'text-body'"
            style="cursor: pointer;"
          >
            <i class="fa fa-sign-out me-md-2 me-sm-1 h5"></i>
            <span class="d-sm-inline d-none h6"> {{ t('configurator.Logout') }}</span>
          </div>
        </li>

        <!-- menu toggler (only show when breaking point is reached) -->
        <li class="nav-item d-md-none ps-3 d-flex align-items-center">
          <a href="#" @click="toggleSidebar" class="p-0 nav-link text-body" id="iconNavbarSidenav">
            <i class="fa fa-bars h5" aria-hidden="true"></i>
          </a>
        </li>

         <!-- configurator -->
        <li class="px-3 nav-item d-flex align-items-center">
          <a class="p-0 nav-link" @click="toggleConfigurator" :class="textWhite ? textWhite : 'text-body'">
            <i class="cursor-pointer fa fa-cog fixed-plugin-button-nav h5"></i>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import Breadcrumbs from "./Breadcrumbs.vue";
import { mapMutations, mapActions } from "vuex";
import { useI18n } from "vue-i18n";
import auth from "../../../api/auth";

export default {
  name: "navbar",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  props: ["textWhite"],
  // created() {
  //   this.minNav;
  // },
  methods: {
    ...mapMutations(["toggleMenuOnSmallScreens", "toggleConfigurator"]),
    ...mapActions(["toggleSidebarColor"]),

    // function used to open the menu to the left on small screens
    toggleSidebar() {
      this.toggleSidebarColor("bg-white");
      this.toggleMenuOnSmallScreens();
    },
    logout() {
      if (this.$store.getters.getIsAuthenticated && this.$store.getters.getUser.session) {
        auth.logout()
          .then((isLoggedOut) => {
            if (isLoggedOut) {
              this.$router.push({ name: "Sign In" });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  },
  components: {
    Breadcrumbs,
  },
  computed: {
    currentRouteName() {
      const name = this.$route.name;
      if (name == "/" || name == "Dashboard") {
        return this.t("routes.dashboard");
      }
      else if (name == "Profile") {
        return this.t("routes.profile");
      }
      else if (name == "Companies"){
        return this.t("routes.companies");
      }
      else if (name == "Employees"){
        return this.t("routes.employees");
      }
      else if (name == "Clients"){
        return this.t("routes.clients");
      }
      else if (name == "Positions"){
        return this.t("routes.positions");
      }
      else if (name == "Pricing_conditions"){
        return `${this.t("routes.pricings")} ${this.t("routes.conditions")}`;
      }
      else if (name == "Pricing_rules"){
        return `${this.t("routes.pricings")} ${this.t("routes.rules")}`;
      }
      else {
        return this.$route.name;
      }
    },
  },

  // Controls the displays of the top nav bar (breadcrumbs displays based on
  // scrolls & the setting on pendings)
  updated() {
    const navbar = document.getElementById("navbarBlur");
    if (navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 10 && this.$store.state.isNavFixed && navbar) {
          navbar.classList.add("blur");
          navbar.classList.add("position-sticky");
          navbar.classList.add("shadow-blur");
        } else {
          navbar.classList.remove("blur");
          navbar.classList.remove("position-sticky");
          navbar.classList.remove("shadow-blur");
        }
      });
    }
  },
};
</script>
