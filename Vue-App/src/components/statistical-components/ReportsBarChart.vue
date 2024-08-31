<template>
  <div>
    <div 
      :class="[
        `bg-gradient-${color}`,
        { 'd-flex justify-content-center align-items-center': isLoading || !isDataAvailable },
        'py-3 mb-3 border-radius-lg pe-1'
      ]" 
      style="height : 180px;"
    >
      <DotLoader 
        v-if="isLoading"
        :size="60" 
        color="white" 
      />
      <p v-if="!isDataAvailable && !isLoading" class="text-white h4">{{ t('stats.no data available') }}</p>
      <div v-if="isDataAvailable && !isLoading" class="chart">
        <canvas :id="id" class="chart-canvas" height="150"></canvas>
      </div>
    </div>
    <div class="d-flex align-items-center my-3 ms-2">
        <p class="h5 my-0">{{ title }}</p>
        <i v-if="isDataAvailable" class="text-gradient px-1 h6 my-0" :class="{'fa-solid fa-arrow-trend-up text-success':changesStatus.isUp, 
          'fa-solid fa-arrow-trend-down text-danger': !changesStatus.isUp}">
          </i>
        <span v-if="isDataAvailable" class="font-weight-bold h6 my-0">{{ changesStatus.value }}</span>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import DotLoader from "@/components/reuseable-components/loader/DotLoader.vue";
import { useI18n } from "vue-i18n";
import { calculateRelativeChanges } from "@/utils/helpers";

export default {
  name: "ReportsBarChart",
  components: {
    DotLoader
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "dark",
    },
    chart: {
      type: Object,
      required: true,
      labels: Array,
      datasets: {
        type: Object,
        label: String,
        data: Array,
      },
    },
    isLoading: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  setup(){
    const { t } = useI18n();
    return { t }
  },
  computed:{
    isDataAvailable(){
      if (!this.chart || !this.chart.labels || !this.chart.datasets || !this.chart.datasets.data) {
        return false;
      }
      if (this.chart.datasets.data.length === 0) {
        return false;
      }
      if (this.chart.labels.length === 0) {
        return false;
      }
      return true;
    },
    changesStatus(){
      return calculateRelativeChanges(this.chart.datasets.data);
    }
  },
  methods: {
    drawGraph() {
      if(!this.isDataAvailable) return;

      var ctx = document.getElementById(this.id).getContext("2d");

      let chartStatus = Chart.getChart(this.id);
      if (chartStatus != undefined) {
        chartStatus.destroy();
      }

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.chart.labels,
          datasets: [
            {
              label: this.chart.datasets.label,
              tension: 0.4,
              borderWidth: 0,
              borderRadius: 4,
              borderSkipped: false,
              backgroundColor: "#fff",
              data: this.chart.datasets.data,
              maxBarThickness: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          scales: {
            y: {
              grid: {
                drawBorder: false,
                display: false,
                drawOnChartArea: false,
                drawTicks: false,
              },
              ticks: {
                suggestedMin: 0,
                suggestedMax: 500,
                beginAtZero: true,
                padding: 15,
                font: {
                  size: 14,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
                color: "#fff",
              },
            },
            x: {
              grid: {
                drawBorder: false,
                display: false,
                drawOnChartArea: false,
                drawTicks: false,
              },
              ticks: {
                display: false,
              },
            },
          },
        },
      });
    },
  },
  watch: {
    isLoading: {
      handler(newValue) {
        if (!newValue) {
          this.$nextTick(() => {
            this.drawGraph();
          });
        }
      }
    },
    '$store.state.language': {
      handler() {
        this.$nextTick(() => {
          this.drawGraph();
        });
      }
    }
  },
}; 
</script>
