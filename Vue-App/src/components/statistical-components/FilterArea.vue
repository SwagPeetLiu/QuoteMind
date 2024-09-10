<template>
    <div 
        class="w-100 h-100 border-3 border-secondary position-relative" 
        style="border-style: dotted;"
    >
        <!-- overlay -->
        <div class="bg-gradient-dark h-100 w-100 position-absolute z-1" style="opacity: 0.12;"></div>
        
        <!-- displaying the current mapped WhereClauses -->
        <div 
            v-if="isWhereClausePresents && !isLoading" 
            class="d-flex flex-wrap align-items-start justify-content-start z-2 p-2 thin-scrollbar overflow-x-hidden overflow-y-auto"
            style="height: 90px;"
        >
            <div 
                v-for="(target, index) in Object.keys(mappedWhereClauses)"
                :key="index"
                class="badge clause-badge my-1 py-3 px-2 me-2 d-inline-flex align-items-center z-2 shadow" 
                :class="`bg-gradient-${$store.state.themeColor}`"
            >
                
                <!-- target -->
                <i class="text-white text-lg me-1 my-0" :class="getIcon(target)"></i>
                <u class="text-white text-lg me-1 my-0">{{ t(`columns.${target}`) }}</u>

                <!-- indicator -->
                <div 
                    class="text-white text-lg me-1 my-0"
                    v-if="mappedWhereClauses[target].type.includes('timestamp') && 
                        (mappedWhereClauses[target].values[0].start == null || 
                        mappedWhereClauses[target].values[0].end == null)"
                >
                    {{ mappedWhereClauses[target].values[0].end == null? t('stats.time.starts from') : t('stats.time.before') }}
                </div>
                <span 
                    v-if="!mappedWhereClauses[target].type.includes('timestamp')"
                    class="text-white text-lg me-1 my-0">{{ t('stats.includes') }}
                </span>


                <!-- input Contents (time-based) -->
                <div 
                    v-if="mappedWhereClauses[target].type.includes('timestamp')"
                    class="text-white text-lg ms-2 my-0 d-flex align-items-center"
                >
                    <span class="my-0" v-if="mappedWhereClauses[target].values[0].start">
                        {{ formatDate(mappedWhereClauses[target].values[0].start, $i18n.locale) }}
                    </span>
                    <i 
                        v-if="mappedWhereClauses[target].values[0].start && mappedWhereClauses[target].values[0].end" 
                        class="mx-2 my-0 text-xs" 
                        :class="getIcon('between')">
                    </i>
                    <span class="my-0" v-if="mappedWhereClauses[target].values[0].end">
                        {{ formatDate(mappedWhereClauses[target].values[0].end, $i18n.locale) }}
                    </span>
                </div>

                <!-- input Contents (text-based) -->
                <div 
                    v-else
                    class="text-white text-lg my-0 d-flex align-items-center"
                    v-for="(inputValue, inputIndex) in mappedWhereClauses[target].values" 
                    :key="inputIndex"
                >
                    <!-- search input -->
                    <span class="my-0">
                        {{isCurrentLanEnglish? "'" : "“"}}
                        {{ inputValue }}
                        {{isCurrentLanEnglish? "'" : "”"}}
                    </span>

                    <!-- connector -->
                    <div 
                        class="my-0 ms-2 rounded-2 bg-gray-600 d-flex align-items-center px-2 cursor-pointer" 
                        v-if="inputIndex < mappedWhereClauses[target].values.length - 1">
                        <span class="my-0 text-sm">{{ t(`stats.${connectorMap.get(target)}`) }}</span>
                        <i class="ms-2 my-0 text-xs" :class="getIcon('switch')"></i>
                    </div>
                </div>

                <!-- remove button -->
                <i class="text-white ms-3 me-1 mt-1 text-lg cursor-pointer" :class="getIcon('cancel')"></i>
            </div>
        </div>

        <!-- if no whereClauses are present -->
        <div v-if="!isWhereClausePresents && !isLoading" class="z-n1 bg-transparent w-100 h-100 d-flex align-items-center justify-content-center">
            <p class="my-0 z-2 h6 font-weight-bold text-gradient text-dark">{{ t("apiMessage.search.add your filter") }}
            </p>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { getUniqueObjects } from "@/utils/helpers";
import {getIcon} from "@/utils/iconMapper.js";
import { formatDate } from "@/utils/helpers";

export default {
    name: "FilterArea",
    data() {
        const { t } = useI18n({});
        return {
            t,
            isLoading: false,
            connectorMap: new Map()
        };
    },
    props: {
        inputClauses:{
            type: Array,
            required: true
        }
    },
    computed: {
        isWhereClausePresents() {
            return this.inputClauses.length > 0;
        },
        /*
        mapped WhereClauses 
            - no repeat
            - by default use or operator on the same target
            - by default overriding existing date columns (i.e., only showing the latest value)
        */
        mappedWhereClauses() {
            if (this.inputClauses.length > 0) {
                // filter out non-qunie clauses
                const uniqueClauses = getUniqueObjects(this.inputClauses);

                // map by search targets' columns
                const categorisedClauses = uniqueClauses.reduce((acc, item) => {

                    const { target, value, type } = item;
                    if (!acc[target]) {
                        acc[target] = { values: [], type: type };
                    }
                    
                    if (type.includes("timestamp")) {
                        // For timestamp, only keep the last value
                        acc[target].values = [value];
                    } else {
                        acc[target].values.push(value);
                    }
                    
                    return acc;
                }, {});

                return categorisedClauses;
            }
            return {};
        },
        isCurrentLanEnglish(){
            return this.$store.getters.getLanguage === "en";
        }
    },
    methods:{
        getIcon,
        formatDate,
        mapArrayToCategorizedObject(arr){
            return arr
        },
        changeConnector(connector, target) {
            if (this.connectorMap.has(target)) {
                this.connectorMap.set(target, connector);
            }
        }
    },
    watch:{
        // update the connectorMap when whereClauses are changed
        mappedWhereClauses : {
            handler(newValue){
                const currentTargets = Object.keys(newValue);
                if (currentTargets.length > 0) {
                    currentTargets.forEach(target => {
                        if (!this.connectorMap.has(target)) {
                            this.connectorMap.set(target, "or");
                        }
                    });
                }
            },
            immediate: true,
            deep: true
        }
    }
};
</script>