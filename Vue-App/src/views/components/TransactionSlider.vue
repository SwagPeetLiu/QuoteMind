<template>
    <div id="transaction-carousel" class="card p-3 carousel carousel-dark slide h-100" data-bs-ride="carousel"
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
        <div class="carousel-inner h-100 d-flex">

            <!-- counter linear chart (Side 1)-->
            <div class="carousel-item pe-2 px-md-3 h-100 active d-flex flex-column justify-content-center align-items-center"
                :class="{
                    'd-flex justify-content-center align-items-center': !isCoutingLoading,
                }">
                <gradient-line-chart v-if="!isCoutingLoading && activeSlide === 0"
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
                <DotLoader v-if="isCoutingLoading && activeSlide === 0" :size="60" />
            </div>

            <!-- distribution doughnut chart (Slide 2) -->
            <div class="carousel-item w-100 h-100 px-md-6 ms-md-n4 d-flex justify-content-center align-items-center">
                <div class="w-80 w-md-50" v-if="!isDistritbuionLoading && activeSlide === 1">
                    <DoughnutChart :title="t('stats.time.transaction distribution in the last year')" :inputs="{
                        labels: transactionDistributionData.labels.map(label => t(`stats.${label}`)),
                        data: transactionDistributionData.data,
                        backgroundColor: transactionDistributionData.backgroundColors
                    }" :key="$i18n.locale" />
                </div>

                <div class="position-relative border-radius-lg bg-cover ms-md-3 ms-xxl-2 w-50 shadow-lg p-xxxl-3 d-none d-md-inline overflow-hidden"
                    v-if="!isDistritbuionLoading && activeSlide === 1" :style="{
                        backgroundImage:
                            'url(' + require('@/assets/img/realistic-images/transaction-bg.jpg') + ')',
                        backgroundPositionY: '50%',
                    }">
                    <span class="mask bg-gradient-dark"></span>
                    <div class="card-body position-relative overflow-y-auto">
                        <div class="d-flex flex-column">
                            <h5 class="text-white font-weight-bolder mb-4 pt-2">
                                <i class="fa-solid fa-money-bills"></i>
                                <span class="ms-3"> {{ t('dashboard.access your transaction quotations') }}</span>
                            </h5>
                            <p class="text-white text-sm mb-md-2 mb-xxxl-4 d-none d-md-block transaction-justifications">
                                {{ t('dashboard.transaction automation justifications') }}
                            </p>
                            <a class="text-white font-weight-bolder ps-1 mb-0 icon-move-left mt-auto"
                                href="/transactions">
                                {{ t('dashboard.use now') }}
                                <i class="fas fa-arrow-right text-sm mx-1" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div v-if="isDistritbuionLoading && activeSlide === 1"
                    class="w-100 h-100 d-flex justify-content-center align-items-center">
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
import {
getYearlyTransactionCountsBody,
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
            transactionDistributionData: null,
            carouselInstance: null,
            listener: null,
            activeSlide: 0
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
                            this.activeSlide = 1;
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
                        if (item.status === "quoted") {
                            backgroundColors.push("theme");
                        }
                        else if (item.status === "paid") {
                            backgroundColors.push("opposite");
                        }
                        else {
                            backgroundColors.push("secondary");
                        }
                    });
                    this.transactionDistributionData = { labels: labels, data: data, backgroundColors: backgroundColors };
                })
                .catch((error) => {
                    console.error("failed to get transaction distribution", error);
                    this.transactionDistributionData = { labels: labels, data: data, backgroundColors: backgroundColors };
                })
                .finally(() => {
                    this.isDistritbuionLoading = false;
                });
        }
    },
    mounted() {
        this.fetchTransactionCounts();
        this.fetchTransactionDistributions();
        this.carouselInstance = new bootstrap.Carousel(document.getElementById('transaction-carousel'), {
            interval: false // Disable auto-sliding
        });
        this.listener = (event) => {
            this.activeSlide = event.to;
        }
        this.carouselInstance._element.addEventListener('slide.bs.carousel', this.listener);
    },
    unmounted() {
        if (this.carouselInstance) {
            this.carouselInstance._element.removeEventListener('slide.bs.carousel', this.listener);
        }
    }
};
</script>

<style scoped>
@media (min-width: 768px){
    .transaction-justifications {
        max-lines: 5;
        text-wrap: normal;
        display: -webkit-box;
        display: box;
        -webkit-line-clamp: 5;
        line-clamp: 5;
        -webkit-box-orient: vertical;
        box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: calc(1.5em * 5); /* Adjust 1.5em to match your line-height if different */
    }
}
</style>