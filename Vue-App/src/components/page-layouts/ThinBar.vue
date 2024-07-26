<template>
  <!-- Navbar on the top of the pages -->
  <nav
    class="top-0 navbar navbar-expand-lg position-absolute z-index-3"
    :class="[
      isBlur ? '' : 'shadow-none my-2 navbar-transparent w-100',
      styles
    ]"
  >
    <div class="container">
      <router-link
        class="navbar-brand font-weight-bolder ms-lg-0 ms-3 d-flex align-items-center"
        :class="isBlur ? 'text-dark' : 'text-white'"
        to="/"
        v-bind="$attrs"
      >
      <img 
        :src="isBlur ? 'favicon-black.png' : 'favicon-white.png'" 
        class="me-2 navbar-brand-img" :class="isBlur ? 'inverted-img' : ''" alt="Logo"
      />
        {{ t('thinBar.advertise') }}
      </router-link>

      <!-- nav options -->
      <div class="collapse navbar-collapse" id="navigation">
        <ul class="navbar-nav mx-auto">

          <!-- us access -->
          <li class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center me-2"
              aria-current="page"
              to="/"
            >
              <i
                class="fa fa-handshake-o opacity-6 me-2"
                aria-hidden="true"
                :class="isBlur ? 'text-dark' : 'text-white'"
              ></i>
              {{ t('thinBar.us') }}
            </router-link>
          </li>
          
          <!-- open source -->
          <li class="nav-item">
            <a class="nav-link me-2" 
                href="https://github.com/creativetimofficial/soft-ui-dashboard"
                target="_blank"
                rel="noopener noreferrer"
            >
              <i
                class="fa fa-code opacity-6 me-2"
                aria-hidden="true"
                :class="isBlur ? 'text-dark' : 'text-white'"
              ></i>
              {{ t('thinBar.source') }}
            </a>
          </li>

          <!-- Sign up/in button -->
          <li class="nav-item">
            <router-link class="nav-link me-2" :to="getDynamicRoute">
              <i
                class="fas fa-user-circle opacity-6 me-2"
                aria-hidden="true"
                :class="isBlur ? 'text-dark' : 'text-white'"
              ></i>
              <span v-if="isSignUp">{{ t('thinBar.login') }}</span>
              <span v-else>{{ t('thinBar.register') }}</span>
            </router-link>
          </li>

          <!-- privacy button -->
          <li class="nav-item">
            <router-link class="nav-link me-2" to="/">
              <i
                class="fa fa-shield opacity-6 me-2"
                aria-hidden="true"
                :class="isBlur ? 'text-dark' : 'text-white'"
              ></i>
              {{ t('thinBar.privacy') }}
            </router-link>
          </li>
        </ul>

        <!-- download button -->
        <ul class="navbar-nav d-lg-block d-none">
          <li class="nav-item">
            <router-link
              :to="getDynamicRoute"
              class="btn btn-sm btn-round mb-0 me-1"
              :class="btnBackground"
            >
              <span v-if="isSignUp">{{ t('thinBar.resume') }}</span>
              <span v-else>{{ t('thinBar.get started') }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
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
    styles: String,
    btnBackground: String,
    isBlur: Boolean,
    darkMode: {
      type: Boolean,
      default: false,
    },
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
};
</script>
