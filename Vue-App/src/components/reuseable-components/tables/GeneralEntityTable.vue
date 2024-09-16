<template>
    <div class="card h-100 w-100 overflow-hidden">
        <div class="card-body px-2 pt-0 h-100">
            <div 
                v-if="!isInitialisedLoading"
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
                                <div class="d-flex align-items-center justify-content-start" :class="[column === 'target' ? 'ms-2' : '']">
                                    <img 
                                        :src="getTargetImage(column === 'target' ? target : column)" 
                                        alt="Icon" 
                                        class="table-header-image me-2 my-0"
                                    />
                                    <span class="mt-1">
                                        {{ column === 'target' ? t(`routes.${target}`) : t(`columns.${column}`) }}
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <!-- content -->
                    <tbody v-if="isCurrentDataAvaialble">
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
                                class="text-center"
                                style="height: 65px;"
                            >
                                <DotLoader :size="60"/>
                            </td>
                        </tr>
                    </tbody>

                    <!-- indicator for no data matchings -->
                    <p 
                        class="w-100 h-100 mt-n5 position-absolute d-flex justify-content-center align-items-center h2 text-gradient text-dark text-shadow-lg" 
                        v-if="!isCurrentDataAvaialble"
                    >
                        {{ t("stats.no data available") }}
                    </p>
                </table>
            </div>

            <div v-else class="d-flex h-100 justify-content-center align-items-center">
                <DashLoader :size="80"/>
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
import { getRecordName, mapColumnType, getTargetImage } from "@/utils/helpers";
import { generateOrderByClause, mapGeneralListingBody } from "@/utils/formatters";
import { getIcon } from "@/utils/iconMapper.js";
import IconEntity from "@/components/reuseable-components/IconEntity.vue";

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
            pageSize: config.search.pageSize,
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
                .then(response => {
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
                            this.currentPage += 1;
                            console.log("finished loading page", this.currentPage);
                        }, this.$store.state.loadingDelay);
                    }
                })
                .catch((error) => {
                    console.error("failed to get search results", error);
                })
                .finally(() => {
                    if(type == "initialise") {
                        setTimeout(()=>{
                            this.isInitialisedLoading = false;
                            console.log("finished loading page", this.currentPage);
                        }, this.$store.state.loadingDelay);
                    }
                });
        },
        handleScroll(){
            const container = this.$refs.tableContainer;
            if (container) {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight){
                    console.log("triggered");
                    if (this.isThereMoreData && !this.isInitialisedLoading && !this.isScrolledLoading) {
                        this.fetchData("scroll");
                    }
                }
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
        }
    },
    created(){
        this.whereClauses = this.$store.state.searchWhereBody;
        this.orderBy = config.search.defaultOrder[this.target];
        this.fetchData("initialise");
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