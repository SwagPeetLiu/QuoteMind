<template>
  <div class="container-fluid mt-n7">
    <!-- background-image container -->
    <div class="mt-4 page-header border-radius-xl z-n1 d-flex align-items-center justify-content-center"
      :style="{
        minHeight: '450px',
        backgroundImage:
          'url(' + require('@/assets/img/curved-images/mountain.jpg') + ')',
        backgroundPositionY: '10%',
      }">
      <LoadInText inputClass="text-white font-weight-bold text-glow display-3" :text="t('profile.title')" />
    </div>

    <!-- profile card -->
    <div class="mx-4 overflow-hidden card card-body blur shadow-blur mt-n6">
      <div class="row gx-4">
        <div class="col-auto">
          <div class="avatar avatar-xl position-relative">
            <img src="@/assets/img/people/file.jpg" alt="profile_image" class="shadow-sm w-100 border-radius-lg"
              style="filter: brightness(95%); image-rendering: -webkit-optimize-contrast;" />
          </div>
        </div>

        <!-- User name & current role -->
        <div class="col-auto my-auto">
          <div class="h-100">
            <h5 class="mb-1">{{ $store.state.user.username }}</h5>
            <p class="ms-1 mb-0 text-sm font-weight-bold">{{ t(`profile.${role}`) }}</p>
          </div>
        </div>

        <!-- Tab based role selector -->
        <div class="mx-auto mt-3 col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0">
          <div class="nav-wrapper position-relative end-0" id="role-selector">
            <ul class="p-1 bg-transparent nav nav-pills nav-fill" role="tablist">
              <li class="nav-item">
                <a class="px-0 py-1 mb-0 nav-link" :class="{ 'active': role === 'admin' }" data-bs-toggle="tab" role="tab"
                  :aria-selected="role === 'admin' ? 'true' : 'false'" @click.prevent="handleRoleSwitch('admin')">
                  <i class="fa-solid fa-user-gear"></i>
                  <span class="ms-2">{{ t('profile.admin') }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="px-0 py-1 mb-0 nav-link" :class="{ 'active': role === 'user' }" data-bs-toggle="tab" role="tab"
                  :aria-selected="role === 'user' ? 'true' : 'false'" @click.prevent="handleRoleSwitch('user')">
                  <i class="fa-solid fa-user-tie"></i>
                  <span class="ms-2">{{ t('profile.user') }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="px-0 py-1 mb-0 nav-link" :class="{ 'active': role === 'tester' }" data-bs-toggle="tab"
                  role="tab" :aria-selected="role === 'tester' ? 'true' : 'false'"
                  @click.prevent="handleRoleSwitch('tester')">
                  <i class="fa-solid fa-person-dots-from-line"></i>
                  <span class="ms-2">{{ t('profile.tester') }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- profile Info & application settings -->
    <div class="row mt-3 mb-0 mx-n2">
      <div class="col-6 px-2">
        <div class="card" style="height: 250px;">
          <p class="card-header text-gradient text-dark font-weight-bold h4 my-0">{{ t('profile.accountDetails') }}</p>
          <form 
            class="card-body position-relative was-validated mt-n4" 
            :class="{'needs-validation': isEditing}" 
            name="form"
            novalidate
          >
            <div class="row g-3">
              <div class="col-12">
                <EditableInfo
                  :icon="'fa-solid fa-envelope-open-text'"
                  name="email"
                  :isDisabled="true"
                  :isRequired="true"
                  :value="$store.state.user.email"
                  type="email"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
              
              <div class="col-md-6">
                <EditableInfo
                  :icon="'fa-solid fa-user-tag'"
                  name="username"
                  :isDisabled="false"
                  :isRequired="true"
                  :value="$store.state.user.username"
                  type="text"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
              
              <div class="col-md-6">
                <EditableInfo
                  :icon="'fa-solid fa-unlock-keyhole'"
                  name="password"
                  :isDisabled="false"
                  :isRequired="true"
                  :value="'***********(sajdjaklssasa sadas )'"
                  type="password"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
            </div>
            
            <!-- form controls -->
            <div class="position-absolute bottom-0 end-0 me-3 d-flex gap-2">
              <button 
                v-if="isEditing"
                type="button" 
                class="btn btn-secondary form-button" 
                @click.prevent="updateStatus('cancel')"
              >
                {{ t('form.cancel') }}
              </button>
              <button 
                type="button" 
                class="btn bg-gradient-info form-button" 
                @click.prevent="updateStatus(`${isEditing ? 'saving' : 'editing'}`)"
              >
                {{ isEditing ? t('form.save') : t('form.edit') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-6 px-2">
        <div class="card" style="height: 300px;">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import setNavPills from "@/assets/js/nav-pills.js";
import { useI18n } from "vue-i18n";
import { fadeOutSlideRight } from "@/utils/styler";
import LoadInText from '@/components/reuseable-components/text/LoadInText.vue';
import EditableInfo from "@/components/reuseable-components/EditableInfo.vue";

export default {
  name: "ProfileOverview",
  components: {
    LoadInText,
    EditableInfo
  },
  data() {
    const { t } = useI18n({});
    return {
      t,
      role: this.$store.state.user.role,
      resizeObserver: null,
      initialised: false,
      formStatus: "display",
      formData: {
        email: { value: this.$store.state.user.email, isvaldiated: null },
        username: { value: this.$store.state.user.username, isvaldiated: null },
        password: { value: "", isvaldiated: null },
      }
    };
  },
  mounted() {
    this.$nextTick(() => {
      setNavPills();
      this.setResizeListener();
    });
  },
  beforeUnmount() {
    this.teardownResizeObserver();
  },
  methods: {
    handleRoleSwitch(role) {
      this.role = role;
    },
    handleResize() {
      if (!this.initialised) {
        this.initialised = true;
        return;
      }
      if (this.$store.state.pillResizing) return;
      this.$store.commit("setPillResizing", true);
      var total = document.querySelectorAll('.nav-pills');
      total.forEach(function (item) {
        // check to remove existing tab animations
        var existingMovingTab = item.querySelector('.moving-tab');
        if (existingMovingTab) {
          fadeOutSlideRight(existingMovingTab, 500, 20)
        }
      });
      setTimeout(() => {
        setNavPills()
          .then(() => {
            this.$store.commit("setPillResizing", false);
          });
      }, 250);
    },
    setResizeListener() {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(document.getElementById("role-selector"));
    },
    teardownResizeObserver() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    },
    updateStatus(status) {
      this.formStatus = status;
    },
    validateInputUpdate(name, value, isValid) {
      console.log("validateInputUpdate", name, value, isValid);
    }
  },
  computed:{
    isEditing() {
      return this.formStatus === 'editing';
    }
  }
};
</script>