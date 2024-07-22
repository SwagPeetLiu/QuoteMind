<template>
  <div>
  <sidenav
    :custom_class="this.$store.state.mcolor"
    :class="[
      this.$store.state.isTransparent,
      'fixed-start'
    ]"
    v-if="this.$store.state.showSidenav"
  />
  <main
    class="main-content position-relative max-height-vh-100 h-100 border-radius-lg"
    :style="this.$store.state.isRTL ? 'overflow-x: hidden' : ''"
  >
    <!-- nav bar on the top of the main container -->
    <navbar
      :class="[navClasses]"
      :textWhite="this.$store.state.isAbsolute ? 'text-white opacity-8' : ''"
      :minNav="navbarMinimize"
      v-if="this.$store.state.showNavbar"
    />
    <router-view />
    <app-footer v-show="this.$store.state.showFooter" />
    <configurator
      :toggle="toggleConfigurator"
      :class="[
        this.$store.state.showConfig ? 'show' : '',
        this.$store.state.hideConfigButton ? 'd-none' : '',
      ]"
    />
  </main>
  <error-dialog/>
  <slide-toast/>
</div>
</template>

<script>
import Sidenav from "./components/page-layouts/Sidenav";
import Configurator from "@/components/page-layouts/Configurator.vue";
import Navbar from "./components/page-layouts/TopNav/Navbar.vue";
import AppFooter from "./components/page-layouts/AppFooter.vue";
import { mapMutations } from "vuex";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import ErrorDialog from "./components/reuseable-components/ErrorDialog.vue";
import SlideToast from "./components/reuseable-components/SlideToast.vue";

export default {
  name: "App",
  components: {
    Sidenav,
    Configurator,
    Navbar,
    AppFooter,
    ErrorDialog,
    SlideToast
  },
  methods: {
    ...mapMutations(["toggleConfigurator", "navbarMinimize"]),
    showModal() {
            var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
                keyboard: false
            })
            myModal.show()
        }
  },
  computed: {
    navClasses() {
      return {
        "position-sticky blur shadow-blur mt-4 left-auto top-1 z-index-sticky": this
          .$store.state.isNavFixed,
        "position-absolute px-4 mx-0 w-100 z-index-2": this.$store.state
          .isAbsolute,
        "px-0 mx-4 mt-4": !this.$store.state.isAbsolute,
      };
    },
  },
  beforeMount() {
    this.$store.state.isTransparent = "bg-transparent";
  },
};
</script>
