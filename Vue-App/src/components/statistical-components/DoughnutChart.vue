<template>
    <div class="d-flex flex-column h-100 w-100 justify-content-center align-items-center my-2">
        <p class="text-center text-gradient text-dark mt-n2 mb-3 doughnut-chart-title">{{ title }}</p>
        <div v-if="isDataAvailable" class="doughnut-chart w-80 position-relative mx-auto">
            <canvas ref="chartCanvas"></canvas>
            <div class="tooltip-center" ref="tooltipCenter">
                <div class="font-weight-bold text-gradient text-dark doughnut-chart-value mt-4">{{ value }}</div>
                <div class="text-muted doughnut-chart-label"> {{ label }}</div>
                <i class="fa-solid fa-chart-simple mt-2" @click="clearClicks"></i>
            </div>
        </div>
        <p v-else class="pt-4 text-center text-gradient text-dark h4 font-weight-bold">
            {{ t('stats.no data available') }}
        </p>
    </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { ref, onMounted, computed } from 'vue';
import { config as appConfig } from "@/config/config.js";
import { createGradient, getContrastColour } from "@/utils/helpers";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

export default {
    name: 'DoughnutChart',
    props: {
        title: {
            type: String,
            default: 'Doughnut Chart'
        },
        inputs: {
            type: Object,
            required: true,
            labels: Array,
            data: Array,
            backgroundColor: Array
        },
    },
    setup(props) {
        const { t } = useI18n();
        const store = useStore();
        const chartCanvas = ref(null);
        const tooltipCenter = ref(null);
        const value = ref(0);
        const label = ref(t('stats.total'));
        let chart = null;

        const CHART_COLORS = appConfig.ChartColours;
        const OVERLAY_COLOR = appConfig.OVERLAY_COLOR;
        let gradients = {};

        const mappedBackgrounds = computed(() => {
            if (!props.inputs.backgroundColor || props.inputs.backgroundColor.length === 0) {
                return [];
            }
            return props.inputs.backgroundColor.map(color => {
                if (color === 'theme') {
                    return store.state.themeColor;
                }
                else if (color === 'opposite') {
                    return getContrastColour(store.state.themeColor);
                }
                else {
                    return color;
                }
            });
        });

        const isDataAvailable = computed(() => {
            return props.inputs.data && props.inputs.data.length > 0;
        });

        const updateChartColors = () => {
            if (chart && mappedBackgrounds.value && mappedBackgrounds.value.length > 0) {
                const newColors = mappedBackgrounds.value.map(color => gradients[color] || color);
                chart.data.datasets[0].backgroundColor = newColors;
                chart.update();
            }
        };

        const createChart = () => {
            if (!isDataAvailable.value || !chartCanvas.value) return;

            const ctx = chartCanvas.value.getContext('2d');
            console.log(ctx)
            // Create gradients
            Object.keys(CHART_COLORS).forEach(key => {
                gradients[key] = createGradient(ctx, CHART_COLORS[key]);
            });

            const data = {
                labels: props.inputs.labels,
                datasets: [
                    {
                        cutout: '75%',
                        data: props.inputs.data,
                        backgroundColor: [], // We'll set this in updateChartColors
                        borderWidth: 2,
                        borderRadius: 10,
                        spacing: 15,
                    }
                ]
            };

            const chartConfig = {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: false,
                        },
                    },
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const dataset = chart.data.datasets[0];
                            updateChartColors(); // Reset colors
                            const clickedIndex = elements[0].index;
                            dataset.backgroundColor[clickedIndex] = OVERLAY_COLOR;
                            updateCenterTooltip(dataset.data[clickedIndex], data.labels[clickedIndex]);
                            chart.update();
                        }
                    }
                }
            };
            if (chart) {
                chart.destroy();
            }

            chart = new Chart(ctx, chartConfig);

            // Set initial colors
            updateChartColors();

            // Initial center tooltip showing total
            const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            updateCenterTooltip(total, t('stats.total'));
        };

        onMounted(() => {
            createChart();
        });

        const updateCenterTooltip = (newValue, newLabel) => {
            if (tooltipCenter.value) {
                value.value = newValue;
                label.value = newLabel;
            }
        };

        const clearClicks = () => {
            updateChartColors();
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((sum, value) => sum + value, 0);
            updateCenterTooltip(total, t('stats.total'));
            chart.update();
        }

        return {
            t,
            value,
            label,
            chartCanvas,
            tooltipCenter,
            clearClicks,
            isDataAvailable
        };
    },
    watch:{
        '$store.getters.getMainTheme': {
            handler(){
                this.clearClicks();
            }
        }
    }
}
</script>