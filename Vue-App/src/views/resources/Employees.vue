<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column">
      <SearchController :target="'employees'"/>
      <div class="pt-3" style="height: 65vh;">
        <GeneralEntityTable :target="'employees'"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchController from '@/components/reuseable-components/SearchController.vue';
import GeneralEntityTable from '@/components/reuseable-components/tables/GeneralEntityTable.vue';
export default {
  name: "Employees",
  components:{
    SearchController,
    GeneralEntityTable
  }
};
</script>