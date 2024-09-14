<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column min-vh-80">
      <SearchController :target="'products'"/>
      <div class="pt-3" style="min-height: 600px; max-height: 820px">
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