<template>
    <div id="transaction-carousel" class="card carousel carousel-dark slide w-100 h-100" data-bs-ride="carousel"
        data-bs-interval="false">

        <!-- the bottom indicators -->
        <div class="carousel-indicators">
            <button type="button" data-bs-target="#transaction-carousel" data-bs-slide-to="0" aria-current="true"
                class="active" aria-label="Slide 1">
            </button>
            <button type="button" data-bs-target="#transaction-carousel" data-bs-slide-to="1" aria-label="Slide 2">
            </button>
        </div>

        <!-- the slides -->
        <div class="carousel-inner w-100 h-100 px-6">

            <!-- counter linear chart (Side 1)-->
            <div class="carousel-item w-100 h-100 active"
                :class="{ 'd-flex justify-content-center align-items-center': isCoutingLoading }">
                <gradient-line-chart v-if="!isCoutingLoading" id="chart-line"
                    :title="`${t('stats.time.transactions in the last year')}`" :chart="{
                        labels: transactionCounterData.labels.map(label => `${t(label.month)}/${label.year}`),
                        datasets: [
                            {
                                label: t('stats.total'),
                                data: transactionCounterData.counts,
                                backgroundColor: 'theme'
                            },
                            {
                                label: t('stats.quoted'),
                                data: transactionCounterData.quoted,
                                backgroundColor: this.$store.state.themeColor === 'dark' ? 'opposite' : 'dark'
                            }
                        ]
                    }" :key="$i18n.locale" />
                <DotLoader v-else :size="60" />
            </div>

            <!-- distribution doughnut chart (Slide 2) -->
            <div class="carousel-item w-100 h-100">
                <div v-if="!isDistritbuionLoading"
                    class="w-100 h-100 d-flex flex-row justify-content-center align-items-center"
                >
                    <div class="w-40 h-100">
                        <DoughnutChart
                            :title="t('stats.time.transaction distribution in the last year')" :inputs="{
                                labels: transactionDistributionData.labels.map(label => t(`stats.${label}`)),
                                data: transactionDistributionData.data,
                                backgroundColor: transactionDistributionData.backgroundColors
                            }" 
                            :key="$i18n.locale"
                        />
                    </div>

                    <div class="overflow-hidden position-relative border-radius-lg bg-cover w-60 mx-auto px-2 shadow-lg"
                        :style="{
                            backgroundImage:
                                'url(' + require('@/assets/img/realistic-images/transaction-bg.jpg') + ')',
                            backgroundPositionY: '50%',
                        }">
                        <span class="mask bg-gradient-dark"></span>
                        <div class="card-body position-relative py-4 px-3">
                            <div class="d-flex flex-column">
                                <h5 class="text-white font-weight-bolder mb-4 pt-2">
                                    <i class="fa-solid fa-money-bills"></i>
                                    <span class="ms-3"> {{ t('dashboard.access your transaction quotations') }}</span>
                                </h5>
                                <p class="text-white mb-5">
                                    {{ t('dashboard.transaction automation justifications') }}
                                </p>
                                <a class="text-white font-weight-bold ps-1 mb-0 icon-move-left mt-auto"
                                    href="/transactions">
                                    {{ t('dashboard.use now') }}
                                    <i class="fas fa-arrow-right text-sm ms-1" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="w-100 h-100 d-flex justify-content-center align-items-center">
                    <DotLoader :size="60" />
                </div>
            </div>
        </div>

        <!-- Slide controls on two sides -->
        <button class="carousel-control-prev" type="button" data-bs-target="#transaction-carousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#transaction-carousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>
</template>

<script>
import GradientLineChart from "@/components/statistical-components/GradientLineChart.vue";
import DoughnutChart from "@/components/statistical-components/DoughnutChart.vue";
import DotLoader from "../../components/reuseable-components/DotLoader.vue";
import search from "@/api/search";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 
{ getYearlyTransactionCountsBody, 
        getyearlyTransactionDistributionBody, 
        FormatMonthAndYear, 
} from "../../utils/helpers";
import { useI18n } from "vue-i18n";

export default {
    name: "TransactionSlider",
    components: {
        GradientLineChart,
        DoughnutChart,
        DotLoader
    },
    data() {
        return {
            isCoutingLoading: true,
            isDistritbuionLoading: true,
            transactionCounterData: null,
            transactionDistributionData: null
        }
    },
    setup() {
        const { t } = useI18n();
        return { t };
    },
    computed: {
        // to determine whether a linear graph display will satisfy the requirements
        // or not, if not then display another donut chart
        isTransactionsExtensive() {
            if (!this.transactionCounterData) {
                return false;
            }
            else if (this.transactionCounterData.counts.length > 1 &&
                this.transactionCounterData.quoted.length > 1
            ) {
                return true;
            }
            else {
                return false;
            }
        }
    },
    methods: {

        // function that fetch the transactions data as an linear chart
        fetchTransactionCounts() {
            const { countQuery, quotedQuery } = getYearlyTransactionCountsBody();
            let labels = [];
            let countsArray = [];
            let quotedArray = [];
            this.isCoutingLoading = true;

            Promise.all([
                search.getSearchResults(quotedQuery),
                search.getSearchResults(countQuery)
            ])
                .then(([quotedData, countData]) => {

                    // formatting data arraies
                    countData.results.forEach(item => {
                        labels.push(FormatMonthAndYear(item.month, item.year));
                        countsArray.push(item.no_of_transaction);
                        const quotedItem = quotedData.results.find(i => i.month === item.month && i.year === item.year);
                        quotedArray.push(quotedItem ? quotedItem.no_of_transaction : 0);
                    });
                    this.transactionCounterData = { labels: labels, counts: countsArray, quoted: quotedArray };
                })
                .catch(err => {
                    console.error('Error fetching transaction data:', err);
                    this.transactionCounterData = { labels: labels, counts: countsArray, quoted: quotedArray };
                })
                .finally(() => {
                    this.isCoutingLoading = false;

                    // the linear charts are not able to display properly, then move the slide to the second:
                    if (!this.isTransactionsExtensive) {
                        const carouselInstance = bootstrap.Carousel.getInstance(document.getElementById('transaction-carousel'));
                        if (carouselInstance) {
                            carouselInstance.to(1);
                        }
                    }
                });
        },

        // function that fetch the transactions data as a donut chart:
        fetchTransactionDistributions() {
            const query = getyearlyTransactionDistributionBody();
            let labels = [];
            let data = [];
            let backgroundColors = [];

            search.getSearchResults(query)
                .then(response => {
                    response.results.forEach(item => {
                        labels.push(item.status);
                        data.push(parseInt(item.count));
                        if (item.status === "quoted"){
                            backgroundColors.push("theme");
                        }
                        else if (item.status === "paid"){
                            backgroundColors.push("opposite");
                        }
                        else{
                            backgroundColors.push("secondary");
                        }
                    });
                    this.transactionDistributionData = { labels: labels, data: data, backgroundColors: backgroundColors };
                })
                .catch((error) => {
                    console.error("failed to get transaction distribution", error);
                    this.transactionDistributionData = { labels: labels, data: data, backgroundColors: backgroundColors };
                })
                .finally(()=>{
                    this.isDistritbuionLoading = false;
                })
        }
    },
    mounted() {
        this.fetchTransactionCounts();
        this.fetchTransactionDistributions();
        new bootstrap.Carousel(document.getElementById('transaction-carousel'), {
            interval: false // Disable auto-sliding
        });
    }
};
</script>