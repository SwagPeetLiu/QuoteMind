<!-- Breadcrumbe page navigations on the top of the main frame - naved directories -->
<template>
  <nav aria-label="breadcrumb">

    <!-- page navs -->
    <ol class="px-0 pt-1 pb-0 mb-0 bg-transparent breadcrumb">

      <!-- home button -->
      <li class="breadcrumb-item" :class="textWhite">
        <i class="fa fa-home opacity-8 font-size-lg" aria-hidden="true"></i>
      </li>

      <!-- the active route -->
      <li 
        v-if="categoryLink !== ''"
        class="breadcrumb-item active" 
        :class="textWhite ? 'text-white' : 'text-dark'" 
        aria-current="page"
      >
        {{ categoryLink }}
      </li>

      <!-- possible category of the route -->
      <li class="breadcrumb-item" :class="textWhite ? 'text-white' : 'text-dark'">
        {{ currentPage }}
      </li>

      <!-- adding in the instance specific routes later on -->

    </ol>

    <!-- current page name determination -->
    <h5 class="mb-0 font-weight-bolder" :class="textWhite ? 'text-white' : ''">
      {{ currentPage }}
    </h5>
  </nav>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "breadcrumbs",
  props: {
    textWhite: {
      type: String,
    },
  },
  setup() {
    const { t } = useI18n();
    return { t }
  },
  computed: {
    categoryLink(){
      const category = this.$store.state.menuAct.mainLink;
      const activeLink = this.$store.state.menuAct.subLink;
      if (activeLink !== ""){
        return this.t(`routes.${category.toLowerCase()}`);
      }
      return "";
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
    }
  },
};
</script>
