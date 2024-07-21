<template>
    <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x">
      <div 
        id="liveToast" 
        class="toast" 
        :class="{
          'bg-success': $store.state.toastMessage.type == 'success', 
          'bg-danger': $store.state.toastMessage.type == 'error',
          'bg-warning': $store.state.toastMessage.type == 'warning',
        }"
        role="alert"
        aria-atomic="true"
      >
        <div class="toast-body d-flex align-items-center justify-content-between">
          <div class="flex-grow-1 text-center pe-3">
            <i v-if="$store.state.toastMessage.type == 'success'" class="fas fa-check-circle me-2"></i>
            <i v-if="$store.state.toastMessage.type == 'error'" class="fas fa-exclamation-triangle me-2"></i>
            <i v-if="$store.state.toastMessage.type == 'warning'" class="fas fa-exclamation-triangle me-2"></i>
            {{ $store.state.toastMessage.message }}
          </div>
          <i 
            class="fa fa-close" 
            style="cursor: pointer;" 
            @click="$store.commit('setToastMessage', {message: '', type: ''})">
          </i>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Toast } from 'bootstrap';
  
  export default {
    name: "side-toast",
    data() {
      return {
        toast: null
      };
    },
    methods: {
      showToast() {
        this.$nextTick(() => {
          const toastEl = document.getElementById('liveToast');
          if (toastEl) {
            if (!this.toast) {
              this.toast = new Toast(toastEl);
            }
            this.toast.show();
          }
        });
      },
      hideToast() {
        if (this.toast) {
          this.toast.hide();
        }
      }
    },
    watch: {
      '$store.state.toastMessage': {
        handler(newValue) {
          if (newValue.message !== "") {
            this.showToast();
          } else {
            this.hideToast();
          }
        },
        deep: true
      }
    },
  }
  </script>