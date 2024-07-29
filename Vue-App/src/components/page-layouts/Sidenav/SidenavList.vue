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
        <sidenav-collapse :navText="t('routes.dashboard')" :to="{ name: 'Dashboard' }">
          <template #icon> 
            <Dashboard />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Company Resources -->
      <li class="nav-item">
        <sidenav-collapse 
          :navText="t('routes.resources')" 
          :to="{ name: 'Resources' }"
          :hasChildren="true"
          :nestedChildren="nestedResources"
        >
          <template #icon>
            <Resources />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Customers -->
      <li class="nav-item">
        <sidenav-collapse 
          :navText="t('routes.customers')" 
          :to="{ name: 'Customers' }"
          :hasChildren="true"
          :nestedChildren="nestedCustomers"
        >
          <template #icon>
            <customers />
          </template>
        </sidenav-collapse>
      </li>

      <!-- Pricing -->
      <li class="nav-item">
        <sidenav-collapse 
          :navText="t('routes.pricings')" 
          :to="{ name: 'Pricings' }"
          :hasChildren="true"
          :nestedChildren="nestedPricings"
        >
          <template #icon>
            <Pricing />
          </template>
        </sidenav-collapse>
      </li>
      
      <!-- Transactions -->
      <li class="nav-item">
        <sidenav-collapse :navText="t('routes.transactions')" :to="{ name: 'Transactions' }">
          <template #icon>
            <Transactions />
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
            <Profile />
          </template>
        </sidenav-collapse>
      </li>
    </ul>
  </div>
  
  <!-- Sidenav Footer -->
  <div class="pt-3 mx-3 mt-3 sidenav-footer">
    <sidenav-card
      :textPrimary="t('sideNav.need help?')"
      :textSecondary="t('sideNav.Please check Docs as well')"
      route="mailto:535051192liu@gmail.com"
      :label="t('sideNav.contact author')"
      icon="fa fa-info-circle"
    />
    <a class="btn w-100 mt-3 d-flex align-items-center justify-content-center"
        :class="currentMainTheme" 
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
import Dashboard from "../../Icon/Dashboard.vue";
import Resources from "../../Icon/Resources.vue";
import Transactions from "../../Icon/Transactions.vue";
import Profile from "../../Icon/Profile.vue";
import Customers from "../../Icon/Customers.vue";
import Pricing from "../../Icon/Pricing.vue";
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
    Dashboard,
    Resources,
    Transactions,
    Profile,
    Customers,
    Pricing
  },
  computed: {
    nestedResources(){
      return {
        'tables': 'Tables',
        'test': 'Test',
        [this.t('routes.products')]: 'Products',
        [this.t('routes.materials')]: 'Materials',
        [this.t('routes.employees')]: 'Employees',
        [this.t('routes.positions')]: 'Positions'
      };
    },
    nestedCustomers(){
      return {
        [this.t('routes.companies')]: 'Companies',
        [this.t('routes.clients')]: 'Clients'
      };
    },
    nestedPricings(){
      return {
        [this.t('routes.rules')]: 'Pricing_Rules',
        [this.t('routes.conditions')]: 'Pricing_Conditions'
      };
    },
    currentMainTheme(){
      const maintheme = this.$store.getters.getMainTheme;
      return `bg-gradient-${maintheme}`;
    }
  },
};
</script>
