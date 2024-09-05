<template>
  <div class="py-2 container-fluid">
    <div class="d-flex flex-column min-vh-80">
      <SearchController :target="'clients'"/>
      <div class="mt-3" style="min-height: 600px; max-height: 820px"></div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import SearchController from '@/components/reuseable-components/SearchController.vue';

export default {
  name: "Products",
  components:{
    SearchController
  },
  data(){
    const {t} = useI18n({});
    return{
      t
    }
  }
};
</script>