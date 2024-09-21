<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column">
      <SearchController :target="'positions'"/>
      <div class="pt-3" style="height: 65vh;">
        <GeneralEntityTable :target="'positions'"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchController from '@/components/reuseable-components/search/SearchController.vue';
import GeneralEntityTable from '@/components/reuseable-components/tables/GeneralEntityTable.vue';
export default {
  name: "Positions",
  components:{
    SearchController,
    GeneralEntityTable
  }
};
</script>