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
            class="d-flex flex-wrap align-items-start z-2 p-2 thin-scrollbar overflow-x-hidden overflow-y-auto"
            style="height: 90px;"
        >
            <div 
                v-for="(target, index) in Object.keys(mappedWhereClauses)"
                :id="index"
                :key="index"
                class="badge clause-badge my-1 py-3 px-2 me-2 d-inline-flex align-items-center z-2 shadow" 
                :class="`bg-gradient-${$store.state.themeColor}`"
            >
                
                <!-- target -->
                <i class="text-white text-lg mx-2 my-0" :class="getIcon(target)"></i>
                <u class="text-white text-lg me-1 my-0 badge-target">{{ t(`columns.${target}`) }}</u>

                <!-- indicator (dynamic depending on the filtration type)-->
                <div class="text-white text-lg me-1 my-0" v-if="mappedTargetType(mappedWhereClauses[target]) == 'ranged date'">
                    {{ mappedWhereClauses[target].values[0].end == null? t('stats.time.starts from') : t('stats.time.before') }}
                </div>
                <div 
                    v-if="!mappedTargetType(mappedWhereClauses[target]).includes('date')"
                    class="text-white text-lg mx-2 my-0">
                    <span v-if="mappedTargetType(mappedWhereClauses[target]) == 'number'">=</span>
                    <span v-else>{{ t(`stats.${mappIndicator(target)}`) }}</span>
                </div>

                <!-- input Contents (time-based) -->
                <div 
                    v-if="mappedTargetType(mappedWhereClauses[target]).includes('date')"
                    class="text-white text-lg ms-2 my-1 d-flex align-items-center"
                >
                    <span class="my-0" v-if="mappedWhereClauses[target].values[0].start">
                        {{ formatDate(mappedWhereClauses[target].values[0].start, $i18n.locale) }}
                    </span>
                    <i 
                        v-if="mappedTargetType(mappedWhereClauses[target]) == 'ranged date'" 
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
                    class="text-white text-lg d-inline-flex align-items-center"
                    v-for="(inputValue, inputIndex) in mappedWhereClauses[target].values" 
                    :key="inputIndex"
                >
                    <!-- search input -->
                    <span class="my-0">
                        {{isCurrentLanEnglish && mappedTargetType(mappedWhereClauses[target]) == 'number' ? "" : "“"}}
                        {{ inputValue }}
                        {{isCurrentLanEnglish && mappedTargetType(mappedWhereClauses[target]) == 'number' ? "" : "”"}}
                    </span>

                    <!-- connector (or / and) -->
                    <div 
                        class="py-0 mx-2 rounded-2 bg-gray-600 d-inline-flex align-items-center px-2 cursor-pointer" 
                        v-if="inputIndex < mappedWhereClauses[target].values.length - 1"
                        @click="changeConnector(connectorMap.get(target) == 'or' ? 'and' : 'or', target)"
                    >
                        <span class="my-0 text-sm">{{ t(`stats.${connectorMap.get(target)}`) }}</span>
                        <i class="ms-2 my-0 text-xs" :class="getIcon('switch')"></i>
                    </div>
                </div>

                <!-- remove button -->
                <i 
                    class="text-white ms-3 me-1 mt-1 text-lg cursor-pointer" 
                    :class="getIcon('cancel')"
                    @click="removeClause(target)"
                >
                </i>
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
import { formatDate, mappIndicator } from "@/utils/helpers";

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
        mappIndicator,
        mapArrayToCategorizedObject(arr){
            return arr
        },
        // toggle between the or and and connector for a specific column 
        changeConnector(connector, target) {
            if (this.connectorMap.has(target)) {
                this.connectorMap.set(target, connector);
            }
        },
        mappedTargetType(targetObject){
            if (targetObject.type.includes('timestamp') && 
                (targetObject.values[0].start == null || 
                targetObject.values[0].end == null)
            ){
                return "ranged date";
            }
            else if (targetObject.type.includes('timestamp')) {
                return "date";
            }
            else if(targetObject.type.includes('numeric') || targetObject.type.includes('integer')) {
                return "number";
            }
            else {
                return "text";
            }
        },
        // emits to remove the inputs for a specific search target:
        removeClause(target, index){
            const deletingElement = document.getElementById(index);
            if (deletingElement) {
                deletingElement.classList.add("fade-out");
            }
            else{
                console.warn('failed to fetching the filter element to delete')
            }
            const modifiedClauses = this.inputClauses.filter((clause) => {
                return clause.target !== target;
            });
            setTimeout(() => {
                console.log("updated clauses", modifiedClauses);
                this.$emit("update-clauses", modifiedClauses);
            }, 100);
        }
    },
    watch:{
        mappedWhereClauses: {
            handler(newValue){
                // update the connectorMap when whereClauses are changed
                const currentTargets = Object.keys(newValue);
                if (currentTargets.length > 0) {
                    currentTargets.forEach(target => {
                        if (!this.connectorMap.has(target)) {
                            this.connectorMap.set(target, "or");
                        }
                    });
                }

                // emits messages on the update of whereclause searches:
                this.$store.commit("setSearchWhereBody", {conditions: newValue, operators: this.connectorMap});
            },
            immediate: true,
            deep: true
        },
    }
};
</script>