<!-- Controls displays of single directory item -->
<template>
  <router-link :to="to" v-bind="$attrs" custom v-slot="{ navigate, isActive }">

    <div ref="mainLink" class="nav-link" :class="{
      'dropdown-link d-flex align-items-center': hasChildren,
      'active': isActive || isChildActive
    }"
    @click="mainLinkClick(navigate)"
    >
      <!-- the nav icon -->
      <div class="text-center shadow icon icon-shape
      icon-sm border-radius-md d-flex 
      align-items-center justify-content-center me-2">
        <slot name="icon"></slot>
      </div>

      <span class="nav-link-text ms-2">{{ navText }}</span>

      <!-- the dropdown icon -->
      <i 
        ref="dropdownIcon" 
        v-if="hasChildren" 
        class="fa fa-chevron-down ms-auto dropdown-arrow" 
        :class="{ 'open': isOpened }"
        aria-hidden="true">
      </i>
    </div>

    <!-- if the component has children, then nest directories -->
    <div class="dropdown-links" 
          :class="{
            'open': hasChildren && isOpened,
            'mt-3': isActive || isChildActive
          }">
      <div
        v-for="(route, text) in nestedChildren" :key="text" 
        @click.stop="handleNestedClick(route)"
        class="dropdown-link-item d-flex align-items-center"
        :class="{'active': isNestedActive(route)}"
      >
        <i v-if="isNestedActive(route)" class="fa fa-tags" aria-hidden="true"></i>
        <i v-else class="fa fa-circle" aria-hidden="true"></i>
        {{ text }}
      </div >
    </div>
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
    hasChildren: {
      type: Boolean,
      default: false
    },
    nestedChildren: {
      type: Object
    }
  },
  data(){
    return{
      isChildActive: false,
      isOpened: false
    }
  },
  methods: {
    mainLinkClick(navigate) {

      // if the directory is nested, then do not use to nav
      if (this.hasChildren && this.nestedChildren) {
        this.toggleMenu();
      }
      // if the directory is not nested then nav properly
      else {
        navigate();
      }
    },
    toggleMenu(){
      this.isOpened = !this.isOpened;
    },

    handleNestedClick(route) {
      this.isChildActive = true;
      this.$router.push({ name: route });
    },

    isNestedActive(route){
      if (this.$store.state.menuAct.subLink == route ||
        this.$route.name == route
      ) {
        return true;
      }
      else {
        return false;
      }
    },
  },
  created(){
    this.isChildActive = this.isNestedActive(this.to.name);
  },
  watch:{
    '$store.state.menuAct': {
      handler(newValue) {

        // for nested main link
        if (this.hasChildren){

          // if other main links are currently active, then dactivate this main link:
          if (newValue.mainLink !== this.to.name || newValue.subLink == ""){
            this.isChildActive = false;
            this.isOpened = false;
          }
          
          // regardless the activness, when the is menu is no longer hovered on
          // close the menu
          if (newValue.hoverOver === false) {
            this.isOpened = false;
          }
          // when it is hovered over, and the sublink belongs to this menu, then open it up again
          else {
            Object.keys(this.nestedChildren).forEach((key) => {
              if (this.nestedChildren[key] == newValue.subLink) {
                this.isChildActive = true;
                this.isOpened = true;
              }
            });
          }
        }
      }
    }
  }
};
</script>
