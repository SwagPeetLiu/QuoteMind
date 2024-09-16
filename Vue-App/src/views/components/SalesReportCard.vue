<template>
    <div>
        <!-- recent sales performance card -->
        <reports-bar-chart id='sales-bar-chart' color='dark' :isLoading="isLoading" 
            :chart="{
                labels: labels.length > 0 ? labels.map(label => `${t(label.month)}/${label.year}`) : [],
                datasets: {
                    label: t('dashboard.total sales'),
                    data: dataArray
                },
            }" 
            :title="t('dashboard.recent sales')" 
        />

        <!-- Timeline demonstration on transactions -->
        <HorizontalTimeline
            :title="t('transactions.simply quoting')"
            :link="{text: t('transactions.my transactions'), path: '/transactions'}"
            :data="[
                {
                    color: 'success',
                    icon: getIcon('create transaction'),
                    title: t('transactions.create'),
                    description: t('transactions.create your transactions'),
                },
                {
                    color: 'info',
                    icon: getIcon('quote trnasaction'),
                    title: t('transactions.quote'),
                    description: t('transactions.quote your transactions'),
                },
                {
                    color: 'danger',
                    icon: getIcon('view and extract'),
                    title: t('transactions.view and extract'),
                    description: t('transactions.view and extract your transactions'),
                },
                {
                    color: 'dark',
                    icon: getIcon('account'),
                    title: t('transactions.account'),
                    description: t('transactions.account your transactions'),
                }
            ]"
        />
    </div>
</template>

<script>
import ReportsBarChart from "@/components/statistical-components/ReportsBarChart.vue";
import { getRecentSalesPerformanceBody } from "@/utils/formatters.js";
import { FormatMonthAndYear } from "@/utils/helpers.js";
import search from "@/api/search";
import { useI18n } from "vue-i18n";
import HorizontalTimeline from "@/components/reuseable-components/Horizontal-Timeline.vue";
import { getIcon } from "@/utils/iconMapper.js";

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
                .then(res => {
                    if (res.isCompleted){
                        const data = res.data.results;
                        if (data && data.length > 0) {
                            data.forEach(item => {
                                this.labels.push(FormatMonthAndYear(item.month, item.year));
                                this.dataArray.push(item.sales);
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error("failed to get recent sales performance", error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        getIcon: getIcon
    },
    mounted() {
        this.getRecentSalesPerformance();
    }
};
</script>