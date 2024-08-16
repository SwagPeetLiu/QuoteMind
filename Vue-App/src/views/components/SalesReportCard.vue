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
        <HorizontalTimeline
            :title="t('transactions.simply quoting')"
            :link="{text: t('transactions.my transactions'), path: '/transactions'}"
            :data="[
                {
                    color: 'success',
                    icon: 'fa-solid fa-cart-plus',
                    title: t('transactions.create'),
                    description: t('transactions.create your transactions'),
                },
                {
                    color: 'info',
                    icon: 'fa-solid fa-tags',
                    title: t('transactions.quote'),
                    description: t('transactions.quote your transactions'),
                },
                {
                    color: 'danger',
                    icon: 'fa-solid fa-eye',
                    title: t('transactions.view and extract'),
                    description: t('transactions.view and extract your transactions'),
                },
                {
                    color: 'dark',
                    icon: 'fa-solid fa-money-bill-wave',
                    title: t('transactions.account'),
                    description: t('transactions.account your transactions'),
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
import HorizontalTimeline from "@/components/reuseable-components/Horizontal-Timeline.vue";

export default {
    name: "SalesReportCard",
    components: {
        ReportsBarChart,
        HorizontalTimeline
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