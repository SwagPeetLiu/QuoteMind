<template>
  <button 
  @click="$store.commit('setToastMessage', {message: 'sadssa', type: 'error'})">
  test
  </button>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: "test",
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>
