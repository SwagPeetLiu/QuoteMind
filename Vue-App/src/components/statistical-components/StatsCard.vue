<template>
    <!-- card styling -->
    <div class="card stats-card" @click="navigate(to)">
        <div class="p-3 card-body">

            <!-- flex direction definition -->
            <div class="d-flex justify-content-between align-items-center w-100">

                <!-- statistic definition -->
                <div class="d-flex flex-column justify-content-start w-80 stats-definition ms-2">
                    <p class="mb-0 text-sm text-capitalize font-weight-bold text-truncate">
                        {{ title }}
                    </p>
                    <p class="mb-n1 font-weight-bolder h3 text-truncate">
                        <DotLoader :size="40" v-if="isLoading" />
                        <IncrementNumber v-else :endValue="statsValue" :duration="500" />
                    </p>
                </div>

                <!-- icon definition -->
                <div class="text-center shadow icon icon-shape border-radius-lg"
                    :class="currentMainTheme">
                    <i class="text-lg opacity-10 mt-1" :class="icon" aria-hidden="true"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import counter from "@/api/counter";
import DotLoader from '../reuseable-components/loader/DotLoader.vue';
import IncrementNumber from "./IncrementNumber.vue";

export default {
    name: "StatsCard",
    components: {
        DotLoader,
        IncrementNumber
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        to:{
            type: String,
            required: true,
        },
        target: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "ni ni-money-coins",
        }
    },
    data() {
        return {
            isLoading: true,
            statsValue: "",
        }
    },
    mounted() {
        counter.getCounter({ target: this.target })
            .then((response) => {
                this.statsValue = response.counts;
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    },
    computed: {
        currentMainTheme() {
            const maintheme = this.$store.getters.getMainTheme;
            return `bg-gradient-${maintheme}`;
        }
    },
    methods:{
        navigate(to){
            this.$router.push({ path: to });
        }
    }
};
</script>