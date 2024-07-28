<template>
    <!-- card styling -->
    <div class="card stats-card">
        <div class="p-3 card-body">

            <!-- flex direction definition -->
            <div class="d-flex justify-content-between">

                <!-- statistic definition -->
                <div class="d-flex flex-column justify-content-start">
                    <p class="mb-0 text-sm text-capitalize font-weight-bold">
                        {{ title }}
                    </p>
                    <h5 class="mb-0 font-weight-bolder">
                        <DotLoader :size="40" v-if="isLoading"/>
                        <span v-else>{{ statsValue }}</span>
                    </h5>
                </div>

                <!-- icon definition -->
                <div 
                    class="text-center shadow icon icon-shape border-radius-lg" 
                    :class="currentMainTheme"
                >
                    <i class="text-lg opacity-10 mt-1" :class="icon" aria-hidden="true"></i>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import counter from "@/api/counter";
import DotLoader from '../reuseable-components/DotLoader.vue';

export default {
    name: "StatsCard",
    components: {
        DotLoader
    },
    props: {

        title: {
            type: String,
            required: true,
        },
        type:{
            type: String,
            required: true,
        },
        target:{
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "ni ni-money-coins",
        }
    },
    data(){
        return{
            isLoading: true,
            statsValue: "",
        }
    },
    mounted(){
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
    computed:{
        currentMainTheme(){
            const maintheme = this.$store.getters.getMainTheme;
            return `bg-gradient-${maintheme}`;
        }
    }
};
</script>