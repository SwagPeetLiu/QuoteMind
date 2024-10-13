<!-- Breadcrumbe page navigations on the top of the main frame - naved directories -->
<template>
  <nav aria-label="breadcrumb">

    <!-- page navs -->
    <ol class="px-0 pb-0 mb-0 bg-transparent breadcrumb">

      <!-- home button -->
      <li class="breadcrumb-item">
        <i class="opacity-8 font-size-lg" :class="[getIcon('home'), isCurrentLinkProfile && 'text-white']"
          aria-hidden="true" style="cursor: pointer;" @click="$router.push({ path: '/' })">
        </i>
      </li>

      <!-- the active route -->
      <li v-if="categoryLink !== ''" class="breadcrumb-item active"
        :class="{ 'text-white': isCurrentLinkProfile, 'text-dark': !isCurrentLinkProfile }" aria-current="page">
        {{ categoryLink }}
      </li>

      <!-- possible category of the route -->
      <li class="breadcrumb-item" :class="{ 'text-white': isCurrentLinkProfile, 'text-dark': !isCurrentLinkProfile }">
        {{ currentPage }}
      </li>

      <!-- adding in the instance specific routes later on -->

    </ol>

    <!-- current page name determination -->
    <p 
      class="mb-0 mt-1 font-weight-bolder h5 d-flex align-items-center" 
      :class="{ 'text-white': isCurrentLinkProfile }"
    >
      <span>{{ currentPage }}</span>
      <span 
        class="mx-1"
        v-if="isCurrentRouteResourceful && isCurrentResourcesCounted">:</span>
      <IncrementNumber 
        v-if="isCurrentRouteResourceful && isCurrentResourcesCounted" 
        :endValue="$store.state.searchTarget.counts"
        :duration="textIncrementalDuration"
      />
    </p>
  </nav>
</template>

<script>
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import IncrementNumber from "@/components/statistical-components/IncrementNumber.vue";
import { config } from "@/config/config";

export default {
  name: "breadcrumbs",
  setup() {
    const { t } = useI18n();
    return { t }
  },
  components:{
    IncrementNumber
  },
  computed: {
    isCurrentLinkProfile() {
      return this.$route.path === '/profile';
    },
    categoryLink() {
      const category = this.$store.state.menuAct.mainLink;
      const activeLink = this.$store.state.menuAct.subLink;
      if (activeLink !== "" && category !== "") {
        return this.t(`routes.${category.toLowerCase()}`);
      }
      return "";
    },
    textIncrementalDuration() {
      return config.UI.textIncrementalDuration;
    },
    currentPage() {
      const name = this.$route.name;
      const isLanEnglish = this.$store.getters.getLanguage == 'en';
      if (name == "/" || name == "Dashboard") {
        return this.t("routes.dashboard");
      }
      else if (name == "Profile") {
        return this.t("routes.profile");
      }
      else if (name == "Companies") {
        return this.t("routes.companies");
      }
      else if (name == "Employees") {
        return this.t("routes.employees");
      }
      else if (name == "Clients") {
        return this.t("routes.clients");
      }
      else if (name == "Positions") {
        return this.t("routes.positions");
      }
      else if (name == "Products") {
        return this.t("routes.products");
      }
      else if (name == "Materials") {
        return this.t("routes.materials");
      }
      else if (name == "Pricing_Conditions") {
        return `${this.t("routes.pricings")}${isLanEnglish ? " " : ''}${this.t("routes.conditions")}`;
      }
      else if (name == "Pricing_Rules") {
        return `${this.t("routes.pricings")}${isLanEnglish ? " " : ''}${this.t("routes.rules")}`;
      }
      else if (name == "Transactions") {
        return this.t("routes.transactions");
      }
      else {
        return this.$route.name;
      }
    },
    isCurrentRouteResourceful(){
      const name = this.$route.name;
      if (name == "/" || name == "Dashboard" || name == "Profile") {
        return false;
      }
      else{
        return true;
      }
    },
    isCurrentResourcesCounted(){
      if (this.$store.state.searchTarget.counts !== null && 
          this.$store.state.searchTarget.counts !== 0 &&
          this.$store.state.searchTarget.target) {
        return true;
      }
      else{
        return false;
      }
    }
  },
  methods:{
    getIcon: getIcon
  }
}

</script>
