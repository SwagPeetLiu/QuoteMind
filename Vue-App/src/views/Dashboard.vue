<template>
  <div class="py-4 container-fluid">

    <!-- First row of statistical cards
        - each card taking up tp half of the width if the screen is getting smaller
    -->
    <div class="row">

      <!-- mini statistics cards -->
      <div class="col-sm-12 col-md-8 col-xl-6 col-xxl-5 mb-xl-0">

        <div class="row mb-xs-0 mb-md-3">
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total products')" type="sum" target="products" to="/resources/products"
              icon="fa-solid fa-scroll" />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total materials')" type="sum" target="materials" to="/resources/materials"
              icon="fa-solid fa-layer-group" />
          </div>
        </div>

        <div class="row mb-xs-0 mb-md-3">
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total companies')" type="sum" to="/customers/companies" target="companies"
              icon="fa-solid fa-city" />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total clients')" type="sum" to="/customers/clients" target="clients"
              icon="fa-solid fa-address-book" />
          </div>
        </div>

        <div class="row">
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total rules')" type="sum" to="/pricings/pricing_rules" target="pricing_rules"
              icon="fa-solid fa-city" />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total conditions')" type="sum" to="/pricings/pricing_conditions" target="pricing_conditions"
              icon="fa-solid fa-address-book" />
          </div>
        </div>
      </div>

    <!-- 3d card displays used later -->
      <div 
        class="col-sm-12 col-md-4 col-xl-6 col-xxl-7 d-flex justify-content-center align-items-center" 
        style="height: 300px;"
      >
        <span 
          class="position-absolute text-center text-gradient font-weight-bold bg-danger text-shadow-md welcome-text mt-n6" 
          :class="`text-dark`"> 
          {{ t("dashboard.welcome") }} </span>
        <DashAnime />
      </div>
    </div>

    <!-- Second row of charts -->
    <div class="mb-3 row mt-n5 mt-md-3">
      <div class="col-sm-12 col-xl-5 mb-lg-0" style="height: 400px;">
        <div class="card p-3 h-100">
          <SalesReportCard />
        </div>
      </div>

      <!-- Transaction counter charts -->
      <div class="col-sm-12 col-xl-7 second-chart" style="height: 400px;">
        <TransactionSlider />
      </div>
    </div>

    <!-- Third row of cards -->
    <div class="row my-4">
      <div class="col-sm-6 col-md-6 col-lg-8 mb-md-0 mb-4">
        <projects-card />
      </div>
      <div class="col-sm-6 col-md-6 col-lg-4">
        <timeline-list class="h-100" title="Orders overview" description="<i class='fa fa-arrow-up text-success' aria-hidden='true'></i>
        <span class='font-weight-bold'>24%</span> this month">
          <timeline-item color="success" icon="bell-55" title="$2400 Design changes" date-time="22 DEC 7:20 PM" />
          <TimelineItem color="danger" icon="html5" title="New order #1832412" date-time="21 DEC 11 PM" />
          <TimelineItem color="info" icon="cart" title="Server payments for April" date-time="21 DEC 9:34 PM" />
          <TimelineItem color="warning" icon="credit-card" title="New card added for order #4395133"
            date-time="20 DEC 2:20 AM" />
          <TimelineItem color="primary" icon="key-25" title="Unlock packages for development"
            date-time="18 DEC 4:54 AM" />
          <TimelineItem color="info" icon="check-bold" title="Notifications unread" date-time="15 DEC" />
        </timeline-list>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from "@/components/statistical-components/StatsCard.vue";
import TransactionSlider from "@/views/components/TransactionSlider.vue";
import SalesReportCard from "./components/SalesReportCard.vue";
import TimelineList from "./components/TimelineList.vue";
import TimelineItem from "./components/TimelineItem.vue";
import ProjectsCard from "./components/ProjectsCard.vue";
import { useI18n } from "vue-i18n";
import DashAnime from "@/components/reuseable-components/DashAnime.vue";

export default {
  name: "dashboard-default",
  data() {
    return {
      iconBackground: "bg-gradient-success",
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  components: {
    StatsCard,
    SalesReportCard,
    ProjectsCard,
    TimelineList,
    TimelineItem,
    TransactionSlider,
    DashAnime
  },
  computed: {
    themeColour() {
      return this.$store.getters.getMainTheme
    },
  },
};
</script>

<style scoped>
.welcome-text {
  max-lines: 1;
  text-overflow: ellipsis;
  font-size: 3rem;
}

/* Mobile devices */
@media (min-width: 300px) {
  .welcome-text {
    font-size: 6.5vw;
  }

  /* used to set up an margin on the top when charts or component overflows to the second line */
  .second-chart {
    margin-top: 3%;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .welcome-text {
    font-size: 3.7vw;
  }
}

/* Small laptops */
@media (min-width: 992px) {
  .welcome-text {
    font-size: 3vw;
  }
}

/* large laptops */
@media (min-width: 1200px) {
  .welcome-text {
    font-size: 3.3vw;
  }

  .second-chart {
    margin-top: 0;
  }
}

/* Extra large large laptops */
@media (min-width: 1600px) {
  .welcome-text {
    font-size: 3vw;
  }
}
</style>