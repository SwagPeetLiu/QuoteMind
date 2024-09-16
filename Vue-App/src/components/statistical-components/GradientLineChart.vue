<template>
  <div class="w-100 h-100">
      <div class="px-4 d-flex justify-content-between align-items-center">
      <!-- Title of the chart -->
      <p class="chart-title text-shadow-lg mt-2">{{ title }}</p>

      <!-- eslint-disable vue/no-v-html -->
      <div v-if="isDataAvailable" class="h6 chart-description">
        <span class="d-none d-xxl-inline" v-if="!isCurrentLanEnglish">{{ t('stats.time.in this period') }}</span>
        <i v-if="isIncreasing.isUp" :class="getIcon('periodic increase')" class='text-gradient text-success px-1'></i>
        <i v-else :class="getIcon('periodic decrease')" class='text-gradient text-danger px-1'></i>
        <span class='font-weight-bold'>{{ isIncreasing.value }}</span>
        <span class="d-none d-xxl-inline" v-if="isCurrentLanEnglish">{{ t('stats.time.in this period') }}</span>
      </div>
    </div>

    <!-- linear line chart -->
    <canvas v-if="isDataAvailable" id="line-chart" ref="gradientLineChart" class="chart-canvas" style="max-height: 290px;">
    </canvas>
    <div v-else class="pb-7 w-100 h-100 d-flex justify-content-center align-items-center">
      <p class="text-gradient text-dark display-5 font-weight-bold">{{ t('stats.no data available') }}</p>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import { useI18n } from "vue-i18n";
import { getContrastColour, createLinearGradient, calculateRelativeChanges } from "../../utils/helpers";
import { config as appConfig } from "../../config/config";
import { getIcon } from "@/utils/iconMapper.js";

export default {
  name: "GradientLineChart",
  props: {
    height: {
      type: String,
      default: "300",
    },
    title: {
      type: String,
      default: "",
    },
    chart: {
      type: Object,
      required: true,
      labels: Array,
      datasets: {
        type: Array,
        label: String,
        data: Array,
        backgroundColor: String,
      },
    }
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      chartInstance: null,
    };
  },
  computed: {
    isDataAvailable() {
      if (!this.chart || !this.chart.datasets || !this.chart.datasets[0] || !this.chart.datasets[0].data) {
        return false;
      }
      if (this.chart.datasets[0].data.length === 0) {
        return false;
      }
      return true;
    },
    isIncreasing() {
      const targetArray = this.chart.datasets[0].data;
      return calculateRelativeChanges(targetArray);
    },
    isCurrentLanEnglish() {
      return this.$store.getters.getLanguage === "en";
    },
    mappedColours() {
      const mainTheme = this.$store.getters.getMainTheme;
      if (this.isDataAvailable) {
        return this.chart.datasets.map(item => {
          if (item.backgroundColor === 'theme') {
            if (mainTheme !== 'dark'){
              return mainTheme;
            }
            else{
              return getContrastColour(mainTheme);
            }
          }
          else {
            return item.backgroundColor;
          }
        });
      } else {
        return [];
      }
    }
  },
  methods: {
    getIcon: getIcon,
    createChart() {
      if (!this.isDataAvailable || !this.$refs.gradientLineChart) {
        return;
      }
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      const ctx = document.getElementById("line-chart").getContext("2d");
      const gradientColour = this.$store.getters.getMainTheme === 'dark' ? getContrastColour('dark') : this.$store.getters.getMainTheme;
      const gradientStroke = createLinearGradient(ctx, appConfig.ChartColours[gradientColour][1]);
      
      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.chart.labels,
          datasets: this.chart.datasets.map((item, index) => ({
            label: item.label,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            borderColor: appConfig.ChartColours[this.mappedColours[index]][1],
            backgroundColor: gradientStroke,
            fill: true,
            data: item.data,
            maxBarThickness: 6,
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
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
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                padding: 10,
                color: "#b2b9bf",
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
            x: {
              grid: {
                drawBorder: false,
                display: false,
                drawOnChartArea: false,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                color: "#b2b9bf",
                padding: 20,
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
          },
        },
      });
    }
  },
  mounted() {
    this.createChart();
  },
  watch: {
    '$store.getters.getMainTheme': {
      handler() {
        this.createChart();
      },
    }
  },
};
</script>