<!-- Controller for the side name (sidenav id for theme changes) -->
<template>
  <aside
    class="my-3 ms-3 overflow-auto border-0
    sidenav navbar navbar-vertical navbar-expand-xs border-radius-xl"
    id="sidenav-main"
    @mouseleave="handleMenuAct(false)"
    @mouseenter="handleMenuAct(true)"
  >
    <!-- side nav header -->
    <div class="sidenav-header">
      <a class="m-0 navbar-brand" href="/">
        <img 
          src="../../../assets/img/logos/icon-black.png" 
          class="navbar-brand-img h-100" 
          alt="main_logo"
        />
        <span 
          class="font-weight-bolder" 
          :class="isCurrentLanEnglish ? 'ms-2' : 'ms-3'"
        >
          {{ $t("sideNav.title") }}
        </span>
      </a>
    </div>

    <!-- Listings of the Routes -->
    <hr class="mt-0 horizontal dark" />
    <sidenav-list :cardBg="customClass" />
  </aside>
</template>

<script>
import SidenavList from "./SidenavList.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "index",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  components: {
    SidenavList,
  },
  props: {
    customClass: {
      type: String,
      default: "",
    },
  },
  mounted() {
    document.querySelector("#sidenav-main").setAttribute("data-color", "dark");
  },
  methods: {
    handleMenuAct(hasHovered){
      this.$store.commit("setMenuAct", { ...this.$store.state.menuAct, hoverOver: hasHovered });
    }
  },
  // used to dynamically adjust titles of the sidenav
  computed: {
    isCurrentLanEnglish() {
      return this.$store.getters.getLanguage === "en";
    },
  },
};
</script>
