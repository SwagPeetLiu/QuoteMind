<!-- Controls displays of single directory item -->
<template>
  <router-link class="nav-link" :to="to" v-bind="$attrs">
    <div
      class="text-center shadow icon icon-shape
      icon-sm border-radius-md d-flex 
      align-items-center justify-content-center me-2"
    >
      <!-- creating a named slot that allow sidenav to insert the icons dynamically -->
      <slot name="icon"></slot>
    </div>
    <span class="nav-link-text ms-1">{{ navText }}</span>
  </router-link>
</template>
<script>
export default {
  name: "sidenav-collapse",
  props: {
    to: {
      type: [Object, String],
      required: true,
    },
    navText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
};
</script>
