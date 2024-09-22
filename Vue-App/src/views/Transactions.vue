<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column">
      <SearchController :target="'transactions'"/>
      <div class="pt-3" style="height: 65vh;">
        <GeneralEntityTable :target="'transactions'"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchController from '@/components/reuseable-components/search/SearchController.vue';
import GeneralEntityTable from '@/components/reuseable-components/tables/GeneralEntityTable.vue';
export default {
  name: "Transactions",
  components:{
    SearchController,
    GeneralEntityTable
  }
};
</script>