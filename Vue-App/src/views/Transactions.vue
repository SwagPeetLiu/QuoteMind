<!-- <template>
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
</script> -->

<template>
  <div class="py-2 container-fluid">
    <p>{{ location.getDistricts({ code: "130100", name: "石家庄市"}, { code: "130000", name: "河北省"})}}</p>
    
    <p>Provinces: {{ provinces }}</p>
    <p>city: {{ location.getCities(currentAddress["province"]) }}</p>
    <p>county: {{ location.getDistricts(currentAddress["city"],currentAddress["province"]) }}</p>

    <p>{{ currentAddress }}</p>

    <button @click="update">ssss</button>
  </div>
</template>

<script>
import list from 'china-location/dist/location.json';
import ChinaLocation from 'china-location';

export default{
  name: "Transactions",
  data(){
    return {
      list,
      location: new ChinaLocation(list)
    }
  },
  computed: {
    provinces() {
      return this.location.getProvinces();
    },
    currentAddress(){
      return this.location.getCurrentAddress();
    },
  },
  methods: {
    isProvinceACity(province) {
      return province.name.includes("市");
    },
    update() {
      const tianjin = this.location.getProvinces().find(p => p.code === "430000");
      this.location.changeProvince(tianjin.code);
    }
  },
}
</script>