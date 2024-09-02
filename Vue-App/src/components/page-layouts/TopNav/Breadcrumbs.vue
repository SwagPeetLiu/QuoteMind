<!-- Breadcrumbe page navigations on the top of the main frame - naved directories -->
<template>
  <nav aria-label="breadcrumb">

    <!-- page navs -->
    <ol class="px-0 pb-0 mb-0 bg-transparent breadcrumb">

      <!-- home button -->
      <li class="breadcrumb-item">
        <i class="fa fa-home opacity-8 font-size-lg" :class="{ 'text-white': isCurrentLinkProfile }"
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
    <h5 class="mb-0 font-weight-bolder" :class="{ 'text-white': isCurrentLinkProfile }">
      {{ currentPage }}
    </h5>
  </nav>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "breadcrumbs",
  setup() {
    const { t } = useI18n();
    return { t }
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
}

</script>
