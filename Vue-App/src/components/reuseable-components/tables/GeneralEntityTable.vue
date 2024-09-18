<template>
    <div class="card h-100 w-100 overflow-hidden">
        <div class="card-body px-2 pt-0 h-100">
            <div 
                
                class="table-responsive h-100 thin-scrollbar overflow-x-hidden overflow-y-auto"
                ref="tableContainer"
                @scroll="handleScroll"
            >
                <table class="table align-items-center mb-0 table-hover custom-width-columns">

                    <!-- header -->
                    <thead class="table-header">
                        <tr>
                            <th 
                                v-for="(column, colIndex) in entityColumns"
                                :key="colIndex"
                                class="text-uppercase text-gradient text-dark text-shadow-lg font-weight-bolder"
                            >
                                <div 
                                    class="d-flex align-items-center justify-content-start" 
                                    :class="[column === 'target' ? 'ms-2' : '']"
                                >
                                    <img 
                                        :src="getTargetImage(column === 'target' ? target : column)" 
                                        alt="Icon" 
                                        class="table-header-image my-0 me-2"
                                    />
                                    <span class="mt-1">
                                        {{ column === 'target' ? t(`routes.${target}`) : t(`columns.${column}`) }}
                                    </span>

                                    <!-- sort button -->
                                    <div 
                                        v-if="isSortingAllowed(column, $store.state.dbReferences).valid"
                                        class="d-flex flex-column justify-content-center align-items-center table-header-sort-button ms-1"
                                        @click="handleSort(column)"
                                        :data-bs-toggle="isSortingNow(column) ? 'tooltip' : ''"
                                        data-bs-placement="top"
                                        :title="sortingTooltips"
                                    >
                                        <img :src="getSortImage(column, 'up', orderBy)" class="up-arrow"/>
                                        <img :src="getSortImage(column, 'down', orderBy)" class="down-arrow"/>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <!-- content -->
                    <tbody v-if="isCurrentDataAvaialble && !isInitialisedLoading">
                        <tr 
                            v-for="(record, rowIndex) in entities"
                            :key="rowIndex"
                            class="table-row"
                        >
                            <td 
                                v-for="(column, colIndex) in entityColumns"
                                :key="colIndex"
                            >
                                <!-- Record Identification -->
                                <IconEntity 
                                    v-if="column === 'target'"
                                    :theme="themeColour" 
                                    :icon="getIcon(target)" 
                                    :name="record[getRecordName(target, $i18n.locale)]"
                                    :id="record.id"
                                    :target="target"
                                />

                                <!-- Reference Identification -->
                                <span v-if="mapColumnType(column) == 'reference'">
                                    {{ record[column] }}
                                </span>

                                <!-- ordinary field -->
                                <span 
                                    v-if="mapColumnType(column) == 'ordinary'"
                                    class="text-dark"
                                >
                                    {{ record[column] }}
                                </span>
                            </td>
                        </tr>
                        
                        <!-- indicator for lazy-loading -->
                        <tr v-if="isScrolledLoading">
                            <td 
                                :colspan="entityColumns.length"
                                class="text-center pt-2"
                                style="height: 65px;"
                            >
                                <DotLoader :size="40"/>
                            </td>
                        </tr>
                    </tbody>

                    <!-- indicator for no data matchings -->
                    <p 
                        class="w-100 h-100 mt-n5 position-absolute d-flex justify-content-center align-items-center h2 text-gradient text-dark text-shadow-lg" 
                        v-if="!isCurrentDataAvaialble && !isInitialisedLoading"
                    >
                        {{ t("stats.no data available") }}
                    </p>

                    <!-- loading indicator -->
                    <div v-if="isInitialisedLoading" class="position-absolute d-flex w-100 h-100 mt-n5 justify-content-center align-items-center">
                        <DashLoader :size="80"/>
                    </div>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import search from "@/api/search";
import DotLoader from "@/components/reuseable-components/loader/DotLoader.vue";
import DashLoader from "@/components/reuseable-components/loader/DashLoader.vue";
import { getRecordName, mapColumnType, getTargetImage, getSortImage } from "@/utils/helpers";
import { generateOrderByClause, mapGeneralListingBody } from "@/utils/formatters";
import { useValidators } from '@/utils/useValidators';
const { isSortingAllowed } = useValidators();
import { getIcon } from "@/utils/iconMapper.js";
import IconEntity from "@/components/reuseable-components/IconEntity.vue";
import { initTooltips, removeExistingTooltips }  from "@/assets/js/tooltip.js";

export default{
    name: "GeneralEntityTable",
    props:{
        target:{
            type: String,
            required: true
        },
    },
    components:{
        DashLoader,
        DotLoader,
        IconEntity
    },
    data(){
        const { t } = useI18n();
        return{
            t,
            whereClauses: null,
            isInitialisedLoading: true,
            isScrolledLoading: false,
            currentPage: null, // initialised to ask the server if there are more data (counts)
            totalCount: null,
            orderBy: null,
            entities: [],
        }
    },
    methods:{
        getIcon,
        getRecordName,
        mapColumnType,
        getTargetImage,
        getSortImage,
        isSortingAllowed,
        fetchData(type){
            // manage the current status of loading:
            if (type == "initialise") {
                this.totalCount = null;
                this.currentPage = null;
                this.isInitialisedLoading = true;
                this.isScrolledLoading = false;
            }
            else{
                this.isScrolledLoading = true;
            }
            
            // use default if user did not modify the order by clause, else map to user-defined
            const orderbyClause = 
                this.orderBy == config.search.defaultOrder[this.target] 
                ? "default": generateOrderByClause(this.orderBy);
            const serachBody = mapGeneralListingBody(this.whereClauses, orderbyClause, this.currentPage === null ? null : this.currentPage + 1, this.target);
            
            // get search results
            search.getSearchResults(serachBody)
                .then(res => {
                    if (res.isCompleted) {
                        const response = res.data;
                        // manage the entities to display
                        if (type == "initialise") {
                            this.currentPage = 1;
                            this.totalCount = response.count;
                            this.entities = response.results;
                        }
                        else{
                            setTimeout(()=>{
                                this.isScrolledLoading = false;
                                this.entities.push(...response.results);
                                this.currentPage += 1; // only update page once load was successful
                            }, this.$store.state.loadingDelay);
                        }
                    }
                })
                .catch((error) => {
                    console.error("failed to get search results", error);
                })
                .finally(() => {
                    if(type == "initialise") {
                        setTimeout(()=>{
                            this.isInitialisedLoading = false;
                        }, this.$store.state.loadingDelay);
                    }
                });
        },
        handleSort(column){

            // only proceed to sorting if the column is sortable
            if (isSortingAllowed(column, this.$store.state.dbReferences).valid){

                removeExistingTooltips();
                
                // if the to be sorted column is already sorted, then reverse the order
                if (column === this.orderBy.column || 
                    (column === "target" && (this.orderBy.column === "id" || this.orderBy.column.includes("name")))
                ) {
                    this.orderBy.order = this.orderBy.order === "ASC" ? "DESC" : "ASC";
                }

                // else select the newly sortby Column and fetch with DESC order by default:
                else{
                    
                    if (column === "target") {
                        this.orderBy = config.search.defaultOrder[this.target];
                    }
                    else{
                        this.orderBy = {column: column, order: "DESC"}
                    }
                }
                this.fetchData("initialise");
            }
        },
        // function used to control the scrolling effects on lazy loading
        handleScroll(){
            const container = this.$refs.tableContainer;
            if (container) {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight){
                    if (this.isThereMoreData && !this.isInitialisedLoading && !this.isScrolledLoading) {
                        this.fetchData("scroll");
                    }
                }
            }
        },
        isSortingNow(column){
            if (this.orderBy){
                if (column === this.orderBy.column && !this.isInitialisedLoading) {
                    return true;
                }
                else if (
                    column === "target" && 
                    (this.orderBy.column === "id" || this.orderBy.column.includes("name") &&
                    !this.isInitialisedLoading)
                ) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else{
                return false;
            }
        }
    },
    computed:{
        isThereMoreData(){
            if (this.totalCount == null || typeof this.totalCount !== "number") {
                return false;
            }
            else{
                return this.totalCount > this.entities.length;
            }
        },
        entityColumns(){
            return config.defaultListings[this.target];
        },
        themeColour(){
            return this.$store.getters.getMainTheme;
        },
        isCurrentDataAvaialble(){
            return this.entities.length > 0;
        },
        sortingTooltips(){
            if (this.orderBy){
                if (this.$store.getters.getLanguage === "en") {
                    return `${this.t("stats.sorting")}${this.t(`stats.${this.orderBy.order === "ASC" ? "ascendingly" : "descendingly"}`)} ${this.t("stats.by")}${this.t(`columns.${this.orderBy.column}`)}`;
                }
                else{
                    return `${this.t("stats.by")}${this.t(`columns.${this.orderBy.column}`)}${this.t(`stats.${this.orderBy.order === "ASC" ? "ascendingly" : "descendingly"}`)}${this.t("stats.sorting")}`;
                }
            }
            else{
                return "";
            }
        }
    },
    created(){
        this.whereClauses = this.$store.state.searchWhereBody;
        this.orderBy = config.search.defaultOrder[this.target];
        this.fetchData("initialise");
    },
    updated() {
        this.$nextTick(() => {
            initTooltips();
        });
    },
    watch:{
        '$store.state.searchWhereBody': {
            handler(){
                this.whereClauses = this.$store.state.searchWhereBody;
                this.fetchData("initialise");
            },
            deep: true
        }
    }
}
</script>