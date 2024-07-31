<template>
  <div class="py-4 container-fluid">

    <!-- First row of statistical cards
        - each card taking up tp half of the width if the screen is getting smaller
    -->
    <div class="row">

      <!-- mini statistics cards -->
      <div class="col-xl-5 col-md-6 col-sm-12 mb-xl-0 mb-4">

        <div 
          class="col-6 mt-n4 mb-4 w-100 text-center text-gradient display-2 font-weight-bold"
          :class="`text-${themeColour}`"
        >
          <span class="text-shadow-md"> Welcome Back! </span>
        </div>

        <div class="row mb-3">
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard
              :title="t('dashboard.total products')"
              type="sum"
              target="products"
              icon="fa-solid fa-scroll"
            />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard
            :title="t('dashboard.total materials')"
              type="sum"
              target="materials"
              icon="fa-solid fa-layer-group"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard
            :title="t('dashboard.total companies')"
              type="sum"
              target="companies"
              icon="fa-solid fa-city"
            />
          </div>
          <div class="col-xl-6 col-md-6 col-sm-6 mb-md-0 mb-2">
            <StatsCard
            :title="t('dashboard.total clients')"
              type="sum"
              target="clients"
              icon="fa-solid fa-address-book"
            />
          </div>
        </div>
      </div>

      <!-- graph -->
      <div class="col-xl-7 col-md-6 col-sm-12 mb-xl-0 mb-4">
        <p class="p-5 bg-danger">fucked up</p>
      </div>
    </div>
    

    <div class="mt-4 row">
      <div class="mb-4 col-lg-5 mb-lg-0">
        <div class="card z-index-2">
          <div class="p-3 card-body">
            <reports-bar-chart
              id="chart-bar"
              title="active Users"
              description="(<strong>+23%</strong>) than last week"
              :chart="{
                labels: [
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                datasets: {
                  label: 'Sales',
                  data: [450, 200, 100, 220, 500, 100, 400, 230, 500],
                },
              }"
              :items="[
                {
                  icon: {
                    color: 'primary',
                    component: faUsers,
                  },
                  label: 'users',
                  progress: { content: '37K', percentage: 60 },
                },
                {
                  icon: { color: 'info', component: faHandPointer },
                  label: 'clicks',
                  progress: { content: '2m', percentage: 90 },
                },
                {
                  icon: { color: 'warning', component: faCreditCard },
                  label: 'Sales',
                  progress: { content: '435$', percentage: 30 },
                },
                {
                  icon: { color: 'danger', component: faScrewdriverWrench },
                  label: 'Items',
                  progress: { content: '43', percentage: 50 },
                },
              ]"
            />
          </div>
        </div>
      </div>


      <div class="col-lg-7">
        <!-- line chart -->
        <div class="card z-index-2">
          <gradient-line-chart
            id="chart-line"
            title="Gradient Line Chart"
            description="<i class='fa fa-arrow-up text-success'></i>
      <span class='font-weight-bold'>4% more</span> in 2021"
            :chart="{
              labels: [
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              datasets: [
                {
                  label: 'Mobile Apps',
                  data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                },
                {
                  label: 'Websites',
                  data: [30, 90, 40, 140, 290, 290, 340, 230, 400],
                },
              ],
            }"
          />
        </div>
      </div>
    </div>
    <div class="row my-4">
      <div class="col-lg-8 col-md-6 mb-md-0 mb-4">
        <projects-card />
      </div>
      <div class="col-lg-4 col-md-6">
        <timeline-list
          class="h-100"
          title="Orders overview"
          description="<i class='fa fa-arrow-up text-success' aria-hidden='true'></i>
        <span class='font-weight-bold'>24%</span> this month"
        >
          <timeline-item
            color="success"
            icon="bell-55"
            title="$2400 Design changes"
            date-time="22 DEC 7:20 PM"
          />
          <TimelineItem
            color="danger"
            icon="html5"
            title="New order #1832412"
            date-time="21 DEC 11 PM"
          />
          <TimelineItem
            color="info"
            icon="cart"
            title="Server payments for April"
            date-time="21 DEC 9:34 PM"
          />
          <TimelineItem
            color="warning"
            icon="credit-card"
            title="New card added for order #4395133"
            date-time="20 DEC 2:20 AM"
          />
          <TimelineItem
            color="primary"
            icon="key-25"
            title="Unlock packages for development"
            date-time="18 DEC 4:54 AM"
          />
          <TimelineItem
            color="info"
            icon="check-bold"
            title="Notifications unread"
            date-time="15 DEC"
          />
        </timeline-list>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from "@/components/statistical-components/StatsCard.vue";
import ReportsBarChart from "@/examples/Charts/ReportsBarChart.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import TimelineList from "./components/TimelineList.vue";
import TimelineItem from "./components/TimelineItem.vue";
import ProjectsCard from "./components/ProjectsCard.vue";
import US from "../assets/img/icons/flags/US.png";
import DE from "../assets/img/icons/flags/DE.png";
import GB from "../assets/img/icons/flags/GB.png";
import BR from "../assets/img/icons/flags/BR.png";
import {
  faHandPointer,
  faUsers,
  faCreditCard,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";

import { useI18n } from "vue-i18n";

export default {
  name: "dashboard-default",
  data() {
    return {
      iconBackground: "bg-gradient-success",
      faCreditCard,
      faScrewdriverWrench,
      faUsers,
      faHandPointer,
      sales: {
        us: {
          country: "United States",
          sales: 2500,
          value: "$230,900",
          bounce: "29.9%",
          flag: US,
        },
        germany: {
          country: "Germany",
          sales: "3.900",
          value: "$440,000",
          bounce: "40.22%",
          flag: DE,
        },
        britain: {
          country: "Great Britain",
          sales: "1.400",
          value: "$190,700",
          bounce: "23.44%",
          flag: GB,
        },
        brasil: {
          country: "Brasil",
          sales: "562",
          value: "$143,960",
          bounce: "32.14%",
          flag: BR,
        },
      },
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  components: {
    StatsCard,
    ReportsBarChart,
    GradientLineChart,
    ProjectsCard,
    TimelineList,
    TimelineItem,
  },
  computed:{
    themeColour(){
      return this.$store.getters.getMainTheme
    }
  }
};
</script>
