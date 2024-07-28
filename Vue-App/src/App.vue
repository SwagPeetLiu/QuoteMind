<template>
  <div>
  <!-- sidenav on the left side of the main container -->
  <sidenav
    :class="[
      this.$store.state.isTransparent, // menu's background
      'fixed-start' // menu's position
    ]"
    v-if="this.$store.state.showSidenav"
  />

  <main
    class="main-content position-relative max-height-vh-100 h-100 border-radius-lg"
  >
    <!-- Top nav bar -->
    <navbar
      :class="[navClasses]"
      :textWhite="this.$store.state.isAbsolute ? 'text-white opacity-8' : ''"
      v-if="this.$store.state.showNavbar"
    />

    <!-- main content -->
    <router-view />

    <!-- Footer -->
    <app-footer v-show="this.$store.state.showFooter" />

    <!-- Configurator toggler -->
    <configurator
      :toggle="toggleConfigurator"
      :class="[
        this.$store.state.showConfig ? 'show' : '',
        this.$store.state.hideConfigButton ? 'd-none' : '',
      ]"
    />
  </main>

  <!-- Overlays components -->
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
    ...mapMutations(["toggleConfigurator"]),
    showModal() {
            var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
                keyboard: false
            })
            myModal.show()
        }
  },
  computed: {
    // function used to control the top nav bar's displays
    navClasses() {
      return {
        "position-sticky blur shadow-blur mt-4 left-auto top-1 z-index-sticky": this
          .$store.state.isNavFixed,
        "position-absolute px-4 mx-0 w-100 z-index-2": this.$store.state
          .isAbsolute,
        "px-0 mx-4 mt-4": !this.$store.state.isAbsolute,
      };
    },
  }
};
</script>
