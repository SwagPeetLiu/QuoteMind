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
        <div class="col-auto mt-md-3 mt-lg-0">
          <div class="avatar avatar-xl position-relative">
            <img src="@/assets/img/people/file.jpg" alt="profile_image" class="shadow-sm w-100 border-radius-lg"
              style="filter: brightness(95%); image-rendering: -webkit-optimize-contrast;" />
          </div>
        </div>

        <!-- User name & current role -->
        <div class="col-auto my-auto">
          <div class="h-100">
            <h5 class="mb-1">{{ $store.state.user.username }}</h5>
            <p class="ms-1 mb-0 text-sm font-weight-bold">{{ t(`form.${role}`) }}</p>
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
                  <span class="ms-2">{{ t('form.admin') }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="px-0 py-1 mb-0 nav-link" :class="{ 'active': role === 'user' }" data-bs-toggle="tab" role="tab"
                  :aria-selected="role === 'user' ? 'true' : 'false'" @click.prevent="handleRoleSwitch('user')">
                  <i class="fa-solid fa-user-tie"></i>
                  <span class="ms-2">{{ t('form.user') }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="px-0 py-1 mb-0 nav-link" :class="{ 'active': role === 'tester' }" data-bs-toggle="tab"
                  role="tab" :aria-selected="role === 'tester' ? 'true' : 'false'"
                  @click.prevent="handleRoleSwitch('tester')">
                  <i class="fa-solid fa-person-dots-from-line"></i>
                  <span class="ms-2">{{ t('form.tester') }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-3 mb-0 mx-n2">
      <div class="col-12 col-xl-6 px-2">
        <!-- profile Info -->
        <div class="card profile-card" :class="{'editing': formStatus === 'editing' || formStatus === 'saving'}">
          <p class="card-header text-gradient text-dark font-weight-bold h4 my-0">{{ t('profile.accountDetails') }}</p>
          <form 
            class="card-body position-relative was-validated mt-n4" 
            :class="{'needs-validation': formStatus === 'editing'}" 
            name="form"
            novalidate
          >
            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <EditableInfo
                  :icon="getIcon('role')"
                  name="role"
                  :isDisabled="true"
                  :isRequired="true"
                  :value="$store.state.user.role"
                  type="text"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>

              <div class="col-12 col-lg-6">
                <EditableInfo
                  :icon="getIcon('email')"
                  name="email"
                  :isDisabled="true"
                  :isRequired="true"
                  :value="$store.state.user.email"
                  type="email"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
              
              <div class="col-12 col-lg-6">
                <EditableInfo
                  :icon="getIcon('username')"
                  name="username"
                  :isDisabled="false"
                  :isRequired="true"
                  :value="$store.state.user.username"
                  type="text"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
              
              <div class="col-12 col-lg-6">
                <EditableInfo
                  :icon="getIcon('password')"
                  name="password"
                  :isDisabled="false"
                  :isRequired="true"
                  :value="passwordOverlay"
                  type="password"
                  :formStatus="formStatus"
                  @update-form="validateInputUpdate"
                />
              </div>
            </div>
            
            <!-- form controls -->
            <div class="position-absolute bottom-0 end-0 me-3 d-flex gap-2">
              <button 
                v-if="formStatus === 'editing'"
                type="button" 
                class="btn btn-secondary form-button" 
                @click.prevent="updateStatus('cancel')"
              >
                {{ t('form.cancel') }}
              </button>
              <button 
                type="button" 
                class="btn form-button" :class="`bg-gradient-${$store.state.themeColor}`"
                @click.prevent="updateStatus(`${formStatus === 'editing' ? 'saving' : 'editing'}`)"
                :disabled="formStatus === 'saving' || (formStatus === 'editing' && isInputInvalid)"
              >
                <Spinner v-if="formStatus === 'saving'" :size="1.1"/>
                <span v-else>{{ formStatus === 'editing' ? t('form.save') : t('form.edit') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Application settings -->
      <div class="col-12 col-xl-6 mt-3 mt-xl-0 px-2">
        <div class="card control-card" :class="{'editing': formStatus === 'editing' || formStatus === 'saving'}">
          <p class="card-header text-gradient text-dark font-weight-bold h4 my-0">
            {{ t('profile.applicationSettings') }}
          </p>
          <div class="card-body mt-n5 mt-md-n4">
            <div class="row g-3 mx-2">
              <div class="col-12 col-md-6 mt-4 mt-md-0 d-flex align-items-center justify-content-center">
                  
                  <!-- Side Menu Fixed -->
                  <div class="d-flex align-items-center">
                    <i 
                      class="my-0 h4 text-gradient fopnt-weight-bolder d-none d-sm-inline" 
                      :class="[`text-${$store.state.themeColor}`, getIcon('setting menu')]">
                    ></i>
                    <h6 class="my-0 ms-3 h5">{{ t("configurator.Side Menu Fixed") }}</h6>
                  </div>
                  <div class="form-check form-switch">
                    <input class="mt-1 form-check-input ms-auto" 
                      type="checkbox" id="menuFixed" :checked="this.$store.state.isMenuFixed" @change="setMenuFixed" />
                  </div>
              </div>

              <!-- Language settings -->
              <div class="col-12 col-md-6 mt-2 mt-md-0 d-flex align-items-center justify-content-center">
                  <div class="d-flex align-items-center">
                    <i 
                      class="my-0 h3 text-gradient fopnt-weight-bolder d-none d-sm-inline" 
                      :class="[`text-${$store.state.themeColor}`, getIcon('language')]">
                    ></i>
                    <h6 class="my-0 ms-3 h5">{{ t("configurator.Language") }}</h6>
                  </div>
                  <LanguageDropDown :class="['mt-3 ps-4']"/>
              </div>

              <!-- Colouring Changes -->
              <p class="col-12 mt-1 text-center mb-0 h4 text-gradient text-dark font-weight-bold">
                {{ t("configurator.SideBar Colours") }}
              </p>
              <div class="col-12 mt-2 d-flex align-items-center justify-content-center colour-pickers">
                <i class="h4 px-3 my-0 text-gradient text-primary text-shadow-lg" :class="[$store.state.themeColor === 'primary' ? 'active' : '', getIcon('locale')]" @click="themeColor('primary')"></i>
                <i class="h4 px-3 my-0 text-gradient text-dark text-shadow-lg" :class="[$store.state.themeColor === 'dark' ? 'active' : '', getIcon('locale')]" @click="themeColor('dark')"></i>
                <i class="h4 px-3 my-0 text-gradient text-info text-shadow-lg" :class="[$store.state.themeColor === 'info' ? 'active' : '', getIcon('locale')]" @click="themeColor('info')"></i>
                <i class="h4 px-3 my-0 text-gradient text-success text-shadow-lg" :class="[$store.state.themeColor === 'success' ? 'active' : '', getIcon('locale')]" @click="themeColor('success')"></i>
                <i class="h4 px-3 my-0 text-gradient text-warning text-shadow-lg" :class="[$store.state.themeColor === 'warning' ? 'active' : '', getIcon('locale')]" @click="themeColor('warning')"></i>
                <i class="h4 px-3 my-0 text-gradient text-danger text-shadow-lg" :class="[$store.state.themeColor === 'danger' ? 'active' : '', getIcon('locale')]" @click="themeColor('danger')"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "@/components/reuseable-components/loader/Spinner.vue";
import setNavPills from "@/assets/js/nav-pills.js";
import { useI18n } from "vue-i18n";
import { fadeOutSlideRight } from "@/utils/styler";
import LoadInText from '@/components/reuseable-components/text/LoadInText.vue';
import EditableInfo from "@/components/reuseable-components/forms/EditableInfo.vue";
import { config } from '@/config/config';
import profile from "@/api/profile";
import LanguageDropDown from "@/components/reuseable-components/styler/languageDropDown.vue";
import { getIcon } from "@/utils/iconMapper.js";

export default {
  name: "ProfileOverview",
  components: {
    LoadInText,
    EditableInfo,
    Spinner,
    LanguageDropDown
  },
  data() {
    const { t } = useI18n({});
    const passwordOverlay = config.passwordOverlay;
    return {
      t,
      role: this.$store.state.user.role,
      resizeObserver: null,
      initialised: false,
      formStatus: "display",
      formData: {
        role: { value: this.$store.state.user.role, isValidated: true },
        email: { value: this.$store.state.user.email, isValidated: true },
        username: { value: this.$store.state.user.username, isValidated: true },
        password: { value: config.samePasswordIndicator, isValidated: true },
      },
      passwordOverlay: passwordOverlay
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
  computed: {
    isInputInvalid() {
      return Object.values(this.formData).some((input) => !input.isValidated);
    }
  },
  methods: {
    getIcon,
    setMenuFixed() {
      this.$store.commit("setMenuFixed", !this.$store.state.isMenuFixed);
    },
    themeColor(color = "dark") {
      this.$store.commit("setThemeColor", color);
    },
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
      if (status === "saving") {
        this.submitform();
      }else{
        this.formStatus = status;
      }
    },
    validateInputUpdate(name, value, isValid) {
      // the special cases that user not to change their password
      if (name === "password" && value === this.passwordOverlay) {
        this.formData[name] = { value: config.samePasswordIndicator, isValidated: true };
      }
      else{
        this.formData[name] = { value: value, isValidated: isValid };
      }
    },
    submitform() {
      this.formStatus = "saving";

      // Await for data updates
      setTimeout(() => {
        if (!this.isInputInvalid) {
          profile.updateProfile({
            username: this.formData.username.value,
            email: this.formData.email.value,
            password: this.formData.password.value
          }).
          then((response) => {
            if (response.isCompleted){
              this.formStatus = "display";
            }
            else{
              this.formStatus = "editing";
            }
          })
          .catch(() => {
            this.formStatus = "editing";
          });
        }
        else{
          this.formStatus = "editing";
        }
      }, 500);
    }
  }
};
</script>

<style scoped>
.colour-pickers {
  i{
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover{
      transform: scale(1.2);
    }
  }
}

/* Add the following CSS for the active class */
@keyframes rotate {
  from {
    transform: scale(1.4) rotate(0deg);
  }
  to {
    transform: scale(1.4) rotate(360deg);
  }
}
.colour-pickers i.active {
  transform: scale(1.4);
  animation: rotate 5s linear infinite;
}

/* Mobile devices */
@media (min-width: 300px) {
  .profile-card{
    height: 320px;
    transition: height 0.3s ease-in-out;

    &.editing{
      height: 370px;
    }
  }
  .control-card{
    height: 270px;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .control-card{
    height: 230px;
    transition: height 0.3s ease-in-out;

    &.editing{
      height: 260px;
    }
  }
}

/* Small laptops */
@media (min-width: 992px) {
  .profile-card{
    height: 230px;
    transition: height 0.3s ease-in-out;

    &.editing{
      height: 260px;
    }
  }
}
</style>