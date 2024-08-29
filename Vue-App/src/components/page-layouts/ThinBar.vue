<template>
  <!-- Navbar on the top of the pages -->
  <div id="thinbar" class="thinbar d-flex align-items-center justify-content-between" :class="[
    showBackgroundColour ?
      'blur blur-rounded start-0 end-0 shadow-lg' :
      'start-0 end-0 ms-n5 pe-1',
  ]">
    <!-- thin bar's bran logo and slogan -->
    <div class="bar-image d-flex align-items-center" v-bind="$attrs">
      <img :src="showBackgroundColour ? 'favicon-black.png' : 'favicon-white.png'" class="me-3 navbar-brand-img"
        :class="showBackgroundColour ? 'inverted-img' : ''" alt="Logo" />
      <span class="font-weight-bolder" :class="showBackgroundColour ? 'text-dark' : 'text-white'">
        {{ t('thinBar.advertise') }}
      </span>
    </div>

    <!-- nav options -->
    <div class="thinbar-mav-options d-none d-lg-flex align-items-center mx-auto">

      <!-- us access -->
      <router-link 
        class="d-flex align-items-center mx-3 thinbar-item" 
        :class="showBackgroundColour ? 'text-dark' : 'text-white'"
        aria-current="page" to="#"
      >
        <i class="fa fa-handshake-o opacity-6 me-3" aria-hidden="true"></i>
        <span>{{ t('thinBar.us') }}</span>
      </router-link>

      <!-- open source -->
      <a 
        class="d-flex align-items-center mx-3 thinbar-item"
        href="https://github.com/creativetimofficial/soft-ui-dashboard"
        :class="showBackgroundColour ? 'text-dark' : 'text-white'"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fa fa-code opacity-6 me-3" aria-hidden="true"></i>
        <span>{{ t('thinBar.source') }}</span>
      </a>

      <!-- Sign up/in button -->
      <router-link
        class="d-flex align-items-center mx-3 thinbar-item" 
        :to="getDynamicRoute"
        :class="showBackgroundColour ? 'text-dark' : 'text-white'"
      >
        <i class="fas fa-user-circle opacity-6 me-3" aria-hidden="true"></i>
        <span v-if="isSignUp">{{ t('thinBar.login') }}</span>
        <span v-else>{{ t('thinBar.register') }}</span>
      </router-link>

      <!-- privacy button -->
      <router-link 
        class="d-flex align-items-center mx-3 thinbar-item" 
        to="#"
        :class="showBackgroundColour ? 'text-dark' : 'text-white'"
      >
        <i class="fa-solid fa-shield-halved opacity-6 me-3"></i>
        <span>{{ t('thinBar.privacy') }}</span>
      </router-link>
    </div>

    <!-- download button -->
    <router-link :to="getDynamicRoute" class="btn btn-sm btn-round mb-0 me-1"
      :class="showBackgroundColour ? 'bg-gradient-dark' : 'bg-gradient-success'">
      <span v-if="isSignUp">{{ t('thinBar.resume') }}</span>
      <span v-else>{{ t('thinBar.get started') }}</span>
    </router-link>

  </div>
</template>

<script>
import downArrWhite from "@/assets/img/down-arrow-white.svg";
import downArrBlack from "@/assets/img/down-arrow-dark.svg";
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';

export default {
  name: "thinBar",
  data() {
    return {
      downArrWhite,
      downArrBlack,
    };
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    return { t, route };
  },
  props: {
    showBackgroundColour: Boolean
  },
  computed: {
    darkModes() {
      return {
        "text-dark": this.darkMode,
      };
    },
    isSignUp() {
      return this.route.path === '/sign-up';
    },
    getDynamicRoute() {
      return this.isSignUp ? '/sign-in' : '/sign-up';
    }
  },
  mounted() {
    // adding the sucess class to the navbar
    document.getElementById("thinbar").setAttribute("data-color", "success");
  },
};
</script>
