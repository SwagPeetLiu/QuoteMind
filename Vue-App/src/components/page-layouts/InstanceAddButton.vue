<template>
    <div 
      class="fixed-add-on"
      :class="[
        this.$store.state.hideConfigButton ? 'd-none' : '',
        !isCurrentRouteResourceful ? 'd-none' : ''
      ]"
    >
      <a 
        class="px-3 py-2 fixed-plugin-button text-white position-fixed"
        :class="`bg-gradient-${$store.state.themeColor}`"
        @click="$emit('add-instance', currentResource)"
    >
        <span class="button-content">
          <i class="py-2 fa fa-plus"></i>
          <span class="resource-text font-weight-bold">{{ currentResource }}</span>
        </span>
      </a>
    </div>
  </template>

<script>
import { useI18n } from 'vue-i18n';
export default {
    name: "InstanceAddButton",
    data(){
      const { t } = useI18n({});
      return {
        t
      }
    },
    computed:{
        isCurrentRouteResourceful(){
            const name = this.$route.name;
            if (name == "/" || name == "Dashboard" || name == "Profile" || name == "Sign In" || name == "Sign Up") {
                return false;
            }
            else{
                return true;
            }
        },
        currentResource(){
            return this.t(`routes.${this.$store.state.searchTarget.target}`);
        }
    }
}
</script>