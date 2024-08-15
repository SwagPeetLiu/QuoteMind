<template>
    <div>
        <!-- recent sales performance card -->
        <reports-bar-chart id='sales-bar-chart' color='dark' :isLoading="isLoading" :chart="{
            labels: labels.length > 0 ? labels.map(label => `${t(label.month)}/${label.year}`) : [],
            datasets: {
                label: t('dashboard.total sales'),
                data: dataArray
            },
        }" :title="t('dashboard.recent sales')" :key="$i18n.locale" />

        <!-- Timeline demonstration on transactions -->
        <Horizontal-Timeline
            :data="[
                {
                    color: 'dark',
                    icon: 'done',
                    title: t('dashboard.transactions'),
                    description: t('dashboard.see all transactions'),
                }
            ]"
            :key="$i18n.locale"
        />
    </div>
</template>

<script>
import ReportsBarChart from "@/components/statistical-components/ReportsBarChart.vue";
import { getRecentSalesPerformanceBody, FormatMonthAndYear } from "@/utils/helpers.js";
import search from "@/api/search";
import { useI18n } from "vue-i18n";

export default {
    name: "SalesReportCard",
    components: {
        ReportsBarChart
    },
    setup() {
        const { t } = useI18n();
        return { t };
    },
    data() {
        return {
            isLoading: true,
            labels: [],
            dataArray: [],
        };
    },
    methods: {
        getRecentSalesPerformance() {
            const queryBody = getRecentSalesPerformanceBody();
            search.getSearchResults(queryBody)
                .then(response => {
                    const data = response.results;
                    if (data && data.length > 0) {
                        data.forEach(item => {
                            this.labels.push(FormatMonthAndYear(item.month, item.year));
                            this.dataArray.push(item.sales);
                        });
                    }
                })
                .catch((error) => {
                    console.error("failed to get recent sales performance", error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    },
    mounted() {
        this.getRecentSalesPerformance();
    }
};
</script>