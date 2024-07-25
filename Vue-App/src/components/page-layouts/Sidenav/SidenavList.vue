<!-- this component controls the Listings of the navigation pages -->
<template>
  <div
    class="w-auto h-auto collapse navbar-collapse max-height-vh-100 h-100"
    id="sidenav-collapse-main"
  >
    <!-- Operations available when logged in -->
    <ul class="navbar-nav">

      <!-- Dashboard -->
      <li class="nav-item">
        <sidenav-collapse :navText="t('sideNav.dashboard')" :to="{ name: 'Dashboard' }">
          <template #icon> 
            <shop />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Company Resources -->
      <li class="nav-item">
        <sidenav-collapse 
          :navText="t('sideNav.resources')" 
          :to="{ name: 'Tables' }"
          :hasChildren="true"
          :nestedChildren="{
            'tables': 'Tables',
            'test': 'test'
          }"
        >
          <template #icon>
            <office />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Transactions -->
      <li class="nav-item">
        <sidenav-collapse :navText="t('routes.transactions')" :to="{ name: 'Billing' }">
          <template #icon>
            <credit-card />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Pages available when logged in -->
      <li class="mt-3 nav-item">
        <h6 class="text-xs ps-4 ms-2 text-uppercase font-weight-bolder opacity-6">
          {{ t('sideNav.pages') }}
        </h6>
      </li>
      <li class="nav-item">
        <sidenav-collapse :navText="t('routes.profile')" :to="{ name: 'Profile' }">
          <template #icon>
            <customer-support />
          </template>
        </sidenav-collapse>
      </li>
    </ul>
  </div>
  
  <!-- Sidenav Footer -->
  <div class="pt-3 mx-3 mt-8 sidenav-footer">
    <sidenav-card
      :textPrimary="t('sideNav.need help?')"
      :textSecondary="t('sideNav.Please check Docs as well')"
      route="mailto:535051192liu@gmail.com"
      :label="t('sideNav.contact author')"
      icon="fa fa-info-circle"
    />
    <a class="btn bg-gradient-success w-100 mt-3 d-flex align-items-center justify-content-center" 
        href="https://535051192liu.atlassian.net/wiki/spaces/KAN"
        target="_blank"
        norel="noopener noreferrer"
    >
      <i class="fa fa-file-text text-white me-2" aria-hidden="true"></i>
      <span class="text-white docs-info">
        {{ t('sideNav.resources') }}
      </span>
    </a>
  </div>
</template>
<script>
import SidenavCollapse from "./SidenavCollapse.vue";
import SidenavCard from "./SidenavCard.vue";
import Shop from "../../Icon/Shop.vue";
import Office from "../../Icon/Office.vue";
import CreditCard from "../../Icon/CreditCard.vue";
import CustomerSupport from "../../Icon/CustomerSupport.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "SidenavList",
  props: {
    cardBg: String,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  components: {
    SidenavCollapse,
    SidenavCard,
    Shop,
    Office,
    CreditCard,
    CustomerSupport,
  },
  methods: {
    getRoute() {
      const routeArr = this.$route.path.split("/");
      return routeArr[1];
    },
  },
};
</script>
