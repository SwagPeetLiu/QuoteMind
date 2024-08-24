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
              icon="fa-solid fa-tags" />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard :title="t('dashboard.total conditions')" type="sum" to="/pricings/pricing_conditions" target="pricing_conditions"
              icon="fa-solid fa-pen-ruler" />
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
    <div class="row mt-4 mb-n4">
      <div class="col-sm-12 col-xxl-6 mb-3 mb-xxl-0" style="height: 460px;">
        <QuotationCompletionCard quoteTarget="companies"/>
      </div>
      <div class="col-sm-12 col-xxl-6 mb-sm-0" style="height: 460px;">
        <QuotationCompletionCard quoteTarget="clients"/>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from "@/components/statistical-components/StatsCard.vue";
import TransactionSlider from "@/views/components/TransactionSlider.vue";
import SalesReportCard from "./components/SalesReportCard.vue";
import QuotationCompletionCard from "./components/QuotationCompletionCard.vue";
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
    QuotationCompletionCard,
    TransactionSlider,
    DashAnime
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