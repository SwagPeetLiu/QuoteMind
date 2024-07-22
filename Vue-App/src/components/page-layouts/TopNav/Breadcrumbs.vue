<!-- Breadcrumbe page navigations on the top of the main frame - naved directories -->
<template>
  <nav aria-label="breadcrumb">

    <!-- page navs -->
    <ol class="px-0 pt-1 pb-0 mb-0 bg-transparent breadcrumb" >
      <li class="text-sm breadcrumb-item" :class="textWhite">
        <a :class="textWhite" class="opacity-8" href="#">{{ t('routes.pages') }}</a>
      </li>
      
      <li
        class="text-sm breadcrumb-item active"
        :class="textWhite ? 'text-white' : 'text-dark'"
        aria-current="page"
      >
        {{ currentPage }}
      </li>

      <!-- adding in the instance specific routes later on -->
       
    </ol>
    
    <!-- current page name determination -->
    <h6 class="mb-0 font-weight-bolder" :class="textWhite ? 'text-white' : ''">
      {{ currentPage }}
    </h6>
  </nav>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "breadcrumbs",
  props: {
    currentPage: {
      required: true,
    },
    textWhite: {
      type: String,
    },
  },
  setup(){
    const { t } = useI18n();
    return { t }
  }
};
</script>
