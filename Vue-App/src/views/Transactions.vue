<template>
    <button 
    @click="$store.commit('setToastMessage', {message: 'sadssa', type: 'error'})">
    transactions to be developed
    </button>
  </template>
  
  <script>
  import { useI18n } from 'vue-i18n';
  
  export default {
    name: "Transactions",
    setup() {
      const { t } = useI18n();
      return { t };
    }
  };
  </script>
  