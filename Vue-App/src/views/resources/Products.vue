<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column">
      <SearchController :target="'products'"/>
      <div class="pt-3" style="height: 65vh;">
        <GeneralEntityTable :target="'products'"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchController from '@/components/reuseable-components/SearchController.vue';
import GeneralEntityTable from '@/components/reuseable-components/tables/GeneralEntityTable.vue';
export default {
  name: "Products",
  components:{
    SearchController,
    GeneralEntityTable
  }
};
</script>