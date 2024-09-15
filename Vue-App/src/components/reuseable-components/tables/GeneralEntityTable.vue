<template>
    <div class="card h-100 w-100 overflow-hidden">
        <div class="card-body px-2 pt-0 h-100">
            <div 
                v-if="!isInitialisedLoading"
                class="table-responsive h-100 thin-scrollbar overflow-x-hidden overflow-y-auto"
            >
                <table class="table align-items-center mb-0 table-hover custom-width-columns">

                    <!-- header -->
                    <thead class="z-2 sticky-top table-header" style="position: sticky">
                        <tr>
                            <th 
                                v-for="(column, colIndex) in entityColumns"
                                :key="colIndex"
                                class="text-uppercase text-gradient text-dark text-shadow-lg font-weight-bolder"
                            >
                                <div class="d-flex align-items-center justify-content-start" :class="[column === 'target' ? 'ms-2' : '']">
                                    <img src="@/assets/img/icons/products.svg" alt="Icon" class="table-header-image me-2"/>
                                    <span>
                                        {{ column === 'target' ? t(`routes.${target}`) : t(`columns.${column}`) }}
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <!-- content -->
                    <tbody>
                        <tr 
                            v-for="(record, rowIndex) in entities"
                            :key="rowIndex"
                            class="table-row z-1"
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
                    </tbody>
                </table>
            </div>

            <div v-else class="d-flex justify-content-center align-items-center">
                <DashLoader :size="80"/>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import search from "@/api/search";
import DashLoader from "@/components/reuseable-components/loader/DashLoader.vue";
import { getRecordName, mapColumnType } from "@/utils/helpers";
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
        fetchData(type){
            console.log("calleed");
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
            const serachBody = mapGeneralListingBody(this.whereClauses, orderbyClause, this.currentPage, this.target);
            
            // get search results
            search.getSearchResults(serachBody)
                .then(response => {
                    this.entities = response.results;
                    if (this.currentPage == null) {
                        this.currentPage = 1;
                        this.totalCount = response.count;
                    }

                    // manage the entities to display
                    if (type == "initialise") {
                        this.entities = response.results;
                    }
                    else{
                        this.entities.push(...response.results);
                    }
                })
                .catch((error) => {
                    console.error("failed to get search results", error);
                })
                .finally(() => {
                    this.isInitialisedLoading = false;
                    this.isScrolledLoading = false;
                    console.log(this.entities);
                });
        }
    },
    computed:{
        isThereMoreData(){
            return true;
        },
        entityColumns(){
            return config.defaultListings[this.target];
        },
        themeColour(){
            return this.$store.getters.getMainTheme;
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