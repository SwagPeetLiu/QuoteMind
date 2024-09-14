<template>
    <div class="card h-100 w-100">
        <div class="card-body px-2 py-2">
            <div 
                v-if="!isInitialisedLoading"
                class="table-responsive h-100 overflow-x-hidden overflow-y-auto thin-scrollbar"
            >
                <table class="table align-items-center mb-0 table-hover custom-width-columns">

                    <!-- header -->
                    <thead>
                        <tr>
                            <!-- <th 
                                v-for="(column, index) in entityColumns"
                                :key="index"
                                class="text-uppercase text-secondary font-weight-bolder opacity-8 col-target"
                            >
                                <div class="d-flex align-items-center justify-content-center mx-1">
                                    <span class="ms-2 mt-1 text-xs">{{ column }}</span>
                                </div>
                            </th> -->
                        </tr>
                    </thead>

                    <!-- content -->
                    <tbody>
                        <!-- <tr v-for="entities">
                            <div></div>
                        </tr> -->
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
import { generateOrderByClause, mapGeneralListingBody } from "@/utils/formatters";

export default{
    name: "GeneralEntityTable",
    props:{
        target:{
            type: String,
            required: true
        },
    },
    components:{
        DashLoader
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
            entityColumns: [],
        }
    },
    methods:{
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