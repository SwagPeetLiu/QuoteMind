<!-- Controller for the side name -->
<template>
  <aside
    class="my-3 ms-3 overflow-auto border-0 sidenav navbar navbar-vertical navbar-expand-xs border-radius-xl"
    id="sidenav-main"
  >
    <!-- side nav header -->
    <div class="sidenav-header">
      <i
        class="top-0 p-3 cursor-pointer fas fa-times text-secondary opacity-5 position-absolute end-0 d-none d-xl-none"
        aria-hidden="true"
        id="iconSidenav"
      > sad</i>
      <a class="m-0 navbar-brand" href="/">
        <img src="favicon-black.png" class="navbar-brand-img h-100" alt="main_logo" />
        <span class="ms-1 font-weight-bolder">Quote Mind Pro</span>
      </a>
    </div>

    <!-- Listings of the Routes -->
    <hr class="mt-0 horizontal dark" />
    <sidenav-list :cardBg="customClass" />
  </aside>
</template>
<script>
import SidenavList from "./SidenavList.vue";

export default {
  name: "index",
  components: {
    SidenavList,
  },
  props: {
    customClass: {
      type: String,
      default: "",
    },
  }
};
</script>
