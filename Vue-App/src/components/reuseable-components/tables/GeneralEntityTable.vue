<template>
    <div class="card h-100 w-100 overflow-hidden">
        <div class="card-body px-2 pt-0 h-100">
            <div 
                class="table-responsive h-100 thin-scrollbar overflow-x-hidden overflow-y-auto"
                ref="tableContainer"
                @scroll="handleScroll"
            >
                <table 
                    class="table align-items-center mb-0 table-hover custom-width-columns"
                >

                    <!-- header -->
                    <thead class="table-header">
                        <tr>
                            <th 
                                v-for="(column, colIndex) in visibleColumns"
                                :key="colIndex"
                                class="text-uppercase text-gradient text-dark text-shadow-lg font-weight-bolder"
                            >
                                <div 
                                    class="d-flex align-items-center" 
                                    :class="[
                                        column === 'target' ||  mapColumnType(column).includes('reference')
                                        ? 'justify-content-start' 
                                        : 'justify-content-center'
                                    ]"
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
                            class="table-row h-100"
                            @click="toggleInstanceSlider({display: true, id: record.id, target: target})"
                        >
                            <td 
                                v-for="(column, colIndex) in visibleColumns"
                                :key="colIndex"
                                class="tabe-cell"
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
                                <div 
                                    v-if="mapColumnType(column) == 'reference'"
                                    class="d-flex align-items-center"
                                >
                                    <IconEntity 
                                        v-if="record[column]"
                                        :theme="themeColour" 
                                        :icon="getIcon(column)" 
                                        :name="record[column][getRecordName(column, $i18n.locale)]"
                                        :id="record[column].id"
                                        :target="column"
                                    />
                                </div>

                                <!-- categorical field -->
                                <div 
                                    v-if="mapColumnType(column) == 'categorical'"
                                    class="d-flex align-items-center justify-content-center"
                                >
                                    <CategoricalBadge 
                                        v-if="record[column]"
                                        :target="column"
                                        :category="record[column]" 
                                    />
                                </div>

                                <!-- ordinary field -->
                                <div 
                                    v-if="mapColumnType(column).includes('ordinary')"
                                    class="d-flex align-items-center justify-content-center"
                                >
                                    <div class="text-gradient text-dark info-span font-weight-bold">

                                        <!-- numeric field -->
                                        <NumericalCell
                                            v-if="mapColumnType(column).includes('numeric')"
                                            :record="record"
                                            :column="column"
                                            :columnType="mapColumnType(column)"
                                            :target="target"
                                        />

                                        <!-- string field -->
                                        <span v-else>{{ record[column] }}</span>
                                    </div>
                                </div>

                                <!-- Date field -->
                                 <FormattedDate 
                                    v-if="mapColumnType(column) == 'date'"
                                    :date="record[column]"
                                />

                                 <!-- customised reference field -->
                                <div v-if="mapColumnType(column).includes('custom')">   
                                    <CustomProductsMaterial
                                        v-if="column === 'product & materials'"
                                        :product="record['product']"
                                        :materials="record['materials']"
                                        :themeColour="themeColour"
                                    />

                                    <TransactionDetails
                                        v-if="column === 'transaction details'"
                                        :transaction="
                                            record.id && getRecordName(target, $i18n.locale) ? 
                                            {id: record.id, [getRecordName(target, $i18n.locale)]: record[getRecordName(target, $i18n.locale)]}
                                            : null"
                                        :client="record['client']"
                                        :company="record['company']"
                                        :status="record['status']"
                                    />

                                    <DimensionDetails
                                        v-if="column === 'dimension'"
                                        :length="record['length']"
                                        :width="record['width']"
                                        :size="record['size']"
                                        :size_unit="record['size_unit']"
                                        :dimension_unit="record[`${$i18n.locale}_unit`]"
                                        :themeColour="themeColour"
                                    />

                                    <div 
                                        v-if="column === 'id'"
                                        class="font-weight-bold text-gradient text-dark ms-4 d-flex align-items-center text-shadow-lg h-100"
                                    >
                                        <i :class="getIcon('id')"></i>
                                        <span class="ms-2" style="font-size: 0.9rem">{{ record.id }}</span>
                                    </div>

                                    <PricingConditionDetails
                                        v-if="column === 'conditions'"
                                        :quantity="record['quantity']"
                                        :quantity_unit="record['quantity_unit']"
                                        :materials="record['materials']"
                                        :size="record['size']"
                                        :size_unit="record['size_unit']"
                                        :threshold="record['threshold']"
                                        :client="record['client']"
                                        :company="record['company']"
                                        :colour="record['colour']"
                                        :useBorder="false"
                                    />
                                    
                                    <!-- single price condition -->
                                    <ConditionCategoryTag
                                        v-if="column === 'category'"
                                        :client="record['client']"
                                        :company="record['company']"
                                    />

                                    <!-- group of pricing conditions -->
                                    <ConditionListing
                                        v-if="column === 'listed_conditions'"
                                        :conditions="record['conditions']"
                                        :themeColour="themeColour"
                                    />
                                </div>
                            </td>
                        </tr>
                        
                        <!-- indicator for lazy-loading -->
                        <tr v-if="isScrolledLoading">
                            <td 
                                :colspan="visibleColumns.length"
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
import { mapMutations } from "vuex";
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import search from "@/api/search";
import DotLoader from "@/components/reuseable-components/loader/DotLoader.vue";
import DashLoader from "@/components/reuseable-components/loader/DashLoader.vue";
import { getRecordName, mapColumnType, getTargetImage, getSortImage } from "@/utils/helpers";
import { generateOrderByClause, mapGeneralListingBody } from "@/utils/formatters";
import { useValidators } from '@/utils/useValidators';
const { isSortingAllowed } = useValidators();
import { initTooltips, removeExistingTooltips }  from "@/assets/js/tooltip.js";
import { getIcon } from "@/utils/iconMapper.js";

import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import CustomProductsMaterial from "@/components/reuseable-components/tables/CustomProductsMaterial.vue";
import TransactionDetails from "@/components/reuseable-components/tables/TransactionDetails.vue";
import CategoricalBadge from "@/components/reuseable-components//text/CategoricalBadge.vue";
import DimensionDetails from "@/components/reuseable-components/tables/DimensionDetails.vue";
import ConditionCategoryTag from "@/components/reuseable-components/tables/ConditionCategoryTag.vue";
import PricingConditionDetails from "@/components/reuseable-components/tables/PricingConditionDetails.vue";
import ConditionListing from "@/components/reuseable-components/tables/ConditionListing.vue";
import FormattedDate from "@/components/reuseable-components/tables/FormattedDate.vue";
import NumericalCell from "@/components/reuseable-components/tables//NumericalCell.vue";

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
        IconEntity,
        CategoricalBadge,
        CustomProductsMaterial,
        TransactionDetails,
        DimensionDetails,
        PricingConditionDetails,
        ConditionCategoryTag,
        ConditionListing,
        FormattedDate,
        NumericalCell
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
            visibleColumns: []
        }
    },
    methods:{
        getIcon,
        getRecordName,
        mapColumnType,
        getTargetImage,
        getSortImage,
        isSortingAllowed,
        ...mapMutations(["toggleInstanceSlider"]),
        fetchData(type){
            // manage the current status of loading:
            if (type == "initialise") {
                this.totalCount = null;
                this.currentPage = null;
                this.isInitialisedLoading = true;
                this.isScrolledLoading = false;
                
                // update the counts in total to be resetted
                this.$store.commit("setSearchTarget", {target: null, counts: null});
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

                            // Update the count references:
                            this.$store.commit("setSearchTarget", {target: this.target, counts: this.totalCount});

                            //reset the need to refresh listings upon instance manipulations:
                            this.$store.commit("setRefreshListing", false);
                            
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
                    (column === "target" && (this.orderBy.column === "id" || this.orderBy.column.includes("name")) ||
                    (column === "dimension" && this.orderBy.column === "size"))
                ) {
                    this.orderBy.order = this.orderBy.order === "ASC" ? "DESC" : "ASC";
                }

                // else select the newly sortby Column and fetch with DESC order by default:
                else{
                    if (column === "target") {
                        this.orderBy = config.search.defaultOrder[this.target];
                    }
                    else if (column === "dimension") {
                        this.orderBy = {column: "size", order: "DESC"}
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
                if (container.scrollTop + container.clientHeight + 50 >= container.scrollHeight){
                    if (this.isThereMoreData && !this.isInitialisedLoading && !this.isScrolledLoading) {
                        this.fetchData("scroll");
                    }
                }
            }
        },
        isSortingNow(column){
            if (this.orderBy){
                if (!this.isInitialisedLoading) {
                    return false;
                }
                else if (column === this.orderBy.column) {
                    return true;
                }
                else if (
                    column === "target" && 
                    (this.orderBy.column === "id" || this.orderBy.column.includes("name"))
                ){
                    return true;
                }
                else if (column === "dimension" && this.orderBy.column === "size") {
                    return true;
                }
                else {
                    return false;
                }
            }
            else{
                return false;
            }
        },
        updateVisibleColumns() {
            if (!this.$refs.tableContainer) return;

            const containerWidth = this.$refs.tableContainer.offsetWidth;
            const minColumnWidth = 200;
            const minVisibleColumns = 2; // Ensure at least 2 columns are always visible
            const maxVisibleColumns = Math.max(
                minVisibleColumns,
                Math.floor(containerWidth / minColumnWidth)
            );

            this.visibleColumns = this.entityColumns.slice(0, maxVisibleColumns);
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
    mounted() {
        this.updateVisibleColumns();
        window.addEventListener('resize', this.updateVisibleColumns);
    },
    updated() {
        this.$nextTick(() => {
            initTooltips();
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateVisibleColumns);
        this.$store.commit("setSearchTarget", {target: null, counts: null});
    },
    watch:{
        '$store.state.searchWhereBody': {
            handler(){
                this.whereClauses = this.$store.state.searchWhereBody;
                this.fetchData("initialise");
            },
            deep: true
        },
        '$store.state.refreshListing': {
            handler(newValue){
                if (newValue) {
                    this.fetchData("initialise");
                }
            }
        }
    }
}
</script>