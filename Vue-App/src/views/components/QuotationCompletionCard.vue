<template>
  <div class="card h-100">
    <!-- table header -->
    <div class="card-header pb-0">
      <p class="h5 text-gradient text-dark m-0 w-100 text-center text-shadow-lg">Corporate customers Quotation Progress</p>
    </div>

    <div class="card-body px-2 py-2">
      <div class="table-responsive">
        <table class="table align-items-center mb-0 table-hover">
          <thead>
            <tr>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center">
                  <img src="../../assets/img/icons/company.png" alt="Company" style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">Companies</span>
                </div>
              </th>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center justify-content-center">
                  <img src="../../assets/img/icons/total-transactions.png" alt="Total Transactions"
                    style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">Transactions</span>
                </div>
              </th>
              <th class="text-uppercase text-secondary font-weight-bolder opacity-8">
                <div class="d-flex align-items-center justify-content-center">
                  <img src="../../assets/img/icons/percentage.png" alt="Percentage" style="width: 38px; height: 38px" />
                  <span class="ms-2 mt-1 text-xs">Quoted</span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- content of tables -->
          <tbody>
            <tr>
              <td>
                <IconEntity class="align-start" :theme="themeColour" icon="fa-solid fa-building" name="Company A"
                  id="74cc87b1-158e-45ab-a56b-54c967dec7e3" />
              </td>
              <td class="align-middle text-center font-weight-bold">
                <IncrementNumber :endValue="14000" :duration="500" />
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="font-weight-bold mx-2">60%</span>
                  <div>
                    <soft-progress :color="themeColour" class="mx-auto" variant="gradient" :percentage="60" />
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <IconEntity theme="success" icon="fa-solid fa-building" name="Company A"
                  id="74cc87b1-158e-45ab-a56b-54c967dec7e3" />
              </td>
              <td class="align-middle text-center text-sm">
                <span class="text-xs font-weight-bold">$3,000</span>
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="text-xs font-weight-bold mx-2">10%</span>
                  <div>
                    <soft-progress color="info" class="mx-auto" variant="gradient" :percentage="10" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <IconEntity theme="success" icon="fa-solid fa-building" name="Company A"
                  id="74cc87b1-158e-45ab-a56b-54c967dec7e3" />
              </td>
              <td class="align-middle text-center text-sm">
                <span class="text-xs font-weight-bold">Not set</span>
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="text-xs font-weight-bold mx-2">100%</span>
                  <div>
                    <soft-progress color="success" class="mx-auto" variant="gradient" :percentage="100" />
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <IconEntity theme="success" icon="fa-solid fa-building" name="Company A"
                  id="74cc87b1-158e-45ab-a56b-54c967dec7e3" />
              </td>
              <td class="align-middle text-center text-sm">
                <span class="text-xs font-weight-bold">$20,500</span>
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="text-xs font-weight-bold mx-2">100%</span>
                  <div>
                    <soft-progress color="success" class="mx-auto" variant="gradient" :percentage="100" />
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <IconEntity theme="success" icon="fa-solid fa-building" name="Company A"
                  id="74cc87b1-158e-45ab-a56b-54c967dec7e3" />
              </td>
              <td class="align-middle text-center text-sm">
                <span class="text-xs font-weight-bold">$500</span>
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center justify-content-center">
                  <span class="text-xs font-weight-bold mx-2">25%</span>
                  <div>
                    <soft-progress color="info" class="mx-auto" variant="gradient" :percentage="25" />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import setTooltip from "@/assets/js/tooltip.js";
import SoftProgress from "@/components/soft-components/SoftProgress.vue";
import IconEntity from "../../components/reuseable-components/IconEntity.vue";
import IncrementNumber from "@/components/statistical-components/IncrementNumber.vue";

export default {
  name: "quotation-completion-card",
  components: {
    SoftProgress,
    IconEntity,
    IncrementNumber
  },
  mounted() {
    setTooltip();
  },
  computed: {
    themeColour() {
      return this.$store.getters.getMainTheme
    },
  },
};
</script>
