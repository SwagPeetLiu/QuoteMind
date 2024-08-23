<template>
  <div class="card h-100">
    <!-- table header -->
    <div class="card-header pb-0">
      <p class="h5 text-gradient text-dark m-0 w-100 text-center text-shadow-lg">
        {{ t(`dashboard.${quoteTarget == "companies" ? "corporates" : "clients"} Quotation Progress`) }}
        </p>
    </div>

    <div class="card-body px-2 py-2">
      <div class="table-responsive h-100 overflow-hidden">
        <table class="table align-items-center mb-0 table-hover">
          <thead>
            <tr>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center">
                  <img :src="`/img/icons/${quoteTarget}.png`" alt="Total Transactions" style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">{{ t(`routes.${quoteTarget}`) }}</span>
                </div> 
              </th>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center justify-content-center">
                  <img :src="`/img/icons/${quoteTarget}.png`" alt="Total Transactions"
                    style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">{{ t('stats.unpaid') }}</span>
                </div>
              </th>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center justify-content-center">
                  <img src="../../assets/img/icons/percentage.png" alt="Percentage" style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">{{ t('stats.quoted') }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- content of tables -->
          <tbody v-if="!isLoading && isDataAvailable">
            <tr v-for="(record, index) in companies" :key="index">
              <td>
                <IconEntity :theme="themeColour" icon="fa-solid fa-building" :name="record.company.full_name"
                  :id="record.company.id" />
              </td>
              <td class="align-middle text-center font-weight-bold">
                <span>{{ $i18n.locale === "en" ? "$" : "¥" }}</span>
                <IncrementNumber :endValue="record.unpaid" :duration="500" />
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="font-weight-bold mx-2">{{record.percentage}}%</span>
                  <div>
                    <soft-progress 
                      :color="themeColour" 
                      class="mx-auto" 
                      variant="gradient" 
                      :percentage="parseInt(record.percentage)"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center h-100 mt-n4">
          loading
        </div>
        <div 
          v-if="!isLoading && !isDataAvailable" 
          class="d-flex justify-content-center align-items-center h-100 mt-n4 h3 mb-0 text-shadow-lg">
          {{t('stats.no data available')}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import setTooltip from "@/assets/js/tooltip.js";
import SoftProgress from "@/components/soft-components/SoftProgress.vue";
import IconEntity from "../../components/reuseable-components/IconEntity.vue";
import IncrementNumber from "@/components/statistical-components/IncrementNumber.vue";
import search from "@/api/search";
import { useI18n } from "vue-i18n";
import { calculatePercentage } from "@/utils/helpers";

export default {
  name: "quotation-completion-card",
  components: {
    SoftProgress,
    IconEntity,
    IncrementNumber
  },
  props:{
    quoteTarget: {
      type: String,
      default: "companies",
      required: true
    }
  },
  mounted() {
    setTooltip();
    this.getTopComapnies();
  },
  computed: {
    themeColour() {
      return this.$store.getters.getMainTheme
    },
    isDataAvailable(){
      return this.companies.length > 0
    }
  },
  data(){
    const { t } = useI18n();
    return {
      isLoading: true,
      companies: [],
      t: t
    }
  },
  methods:{
    // function used to get the companies that reuiqre user's attntion on transaction quotations
    getTopComapnies(){
      search.getQuotationTargets({target: this.quoteTarget})
        .then((response) => {
          if (response.isCompleted) {
            this.companies = response.data.companies.map((company) => ({
              ...company,
              percentage: calculatePercentage(company.created_transactions, company.total_transactions),
            }));
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
};
</script>
