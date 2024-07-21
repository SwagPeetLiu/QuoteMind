<template>
  <main class="mt-0 main-content main-content-bg">
    <div class="container top-0 position-sticky z-index-sticky">
      <div class="row">
        <div class="col-12">
          <ThinBar
            styles="blur blur-rounded my-3 py-2 start-0 end-0 mx-4 shadow-lg"
            :isBlur="true"
            :dark-mode="false"
            btnBackground="bg-gradient-dark"
          />
        </div>
      </div>
    </div>
    <section>
      <div class="page-header min-vh-75 relative">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-md-6 col-lg-5 col-xl-4 d-flex flex-column">
              <div class="mt-8 card card-plain">
                <div class="pb-0 card-header text-start">
                  <h3 class="font-weight-bolder text-success text-gradient">
                    {{ t('signIn.title') }}
                  </h3>
                  <p class="mb-0">{{ t('signIn.subtitle') }}</p>
                </div>
                <div class="card-body">

                  <!--Submission Form-->
                  <form @submit.prevent="handleSubmission" class="text-start needs-validation d-flex flex-column gap-2"
                    name="form" novalidate>

                    <!--Message for failing of login-->
                    <p class="text-danger fs-6" v-if="submitted && !validity && !isLoading">
                      {{ t('signIn.invliad credentials') }}
                    </p>

                    <!--Inputs-->
                    <div class="position-relative">
                      <label for="email" class="fs-6">{{ t('signIn.email') }}</label>
                      <input class="form-control"
                        :class="{ 'is-invalid': submitted && !isEmailValid, 'is-valid': submitted && isEmailValid && validity }"
                        type="email" id="email" :placeholder="t('signIn.email')" v-model="email" required />
                      <div class="invalid-tooltip fs-7">
                        {{ t('signIn.require valid email') }}
                      </div>
                    </div>
                    <div class="position-relative">
                      <label for="password" class="fs-6">{{ t('signIn.password') }}</label>
                      <input class="form-control" :class="{ 'is-invalid': submitted && !isPasswordValid }" id="password"
                        type="password" :placeholder="t('signIn.password')" v-model="password" required />
                      <div class="invalid-tooltip fs-7">
                        {{ t('signIn.require valid password') }}
                      </div>
                    </div>

                    <!--Sign in button-->
                    <button class="text-center my-4 mb-2 btn bg-gradient-success w-100" :disabled="isLoading"
                      type="submit">
                      <Spinner v-if="isLoading" />
                      <span v-else class="fs-6">{{ t('signIn.sign in') }}</span>
                    </button>
                  </form>
                </div>

                <!--Option to redirect to sign up-->
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    {{ t('signIn.noAccountQuestion') }}
                    <router-link :to="{ name: 'Sign Up' }" class="text-success text-gradient font-weight-bold">{{
                      t('signIn.sign up') }}</router-link>
                  </p>
                </div>
              </div>
            </div>

            <!--decoration takes 6 units of the 12 units grids on medium and larger screens-->
            <div class="col-md-6 col-lg-7 col-xl-8">
              <div class="top-0 oblique position-absolute h-100 d-md-block d-none me-n8">
                <div class="bg-cover oblique-video position-absolute fixed-top ms-auto w-100 h-100 z-index-0 ms-md-n10
                            d-flex justify-content-center align-items-center">
                  <!-- :style="{ backgroundImage: 'url(' + require('@/assets/img/curved-images/curved9.jpg') + ')' }"> -->
                  <video 
                    autoplay loop muted playsinline @loadedmetadata="setSpeed" id="bg-video"
                    class="w-100 h-100 object-fit-cover position-absolute sign-in-rotation"
                  >
                    <source :src="require('@/assets/vid/v2.mp4')" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>

                  <p class="large-title text-glow fw-bold text-white position-relative z-index-1">
                    {{ t('signIn.imageTitle') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <app-footer />
</template>

<script>
import AppFooter from "@/components/page-layouts/Footer.vue";
import ThinBar from "../components/page-layouts/ThinBar.vue";
import Spinner from "../components/reuseable-components/Spinner.vue";
const body = document.getElementsByTagName("body")[0];
import { mapMutations } from "vuex";
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import auth from "../api/auth";
import { useRouter } from 'vue-router';
import store from "../store";
import { inject } from 'vue';

export default {
  name: "SignIn",
  components: {
    AppFooter,
    Spinner,
    ThinBar
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const email = ref("");
    const password = ref("");
    const submitted = ref(false);
    const validity = ref(true);
    const isLoading = ref(false);
    const sanitize = inject('$sanitize');

    // computed properties:
    const isEmailValid = computed(() => {
      if (!submitted.value) return true;
      const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!email.value ||
        !email.value.trim() ||
        !regex.test(sanitize(email.value))
      ) {
        return false;
      }
      return true;
    });
    const isPasswordValid = computed(() => {
      if (!submitted.value) return true;
      if (!password.value || !password.value.trim()) return false
      return true;
    });

    const handleSubmission = (event) => {
      event.preventDefault();
      event.stopPropagation();

      // setting the validation states of the form
      submitted.value = true;
      document.getElementsByName("form")[0].classList.add("was-validated");
      // proceed to attempt login
      if (isEmailValid.value && isPasswordValid.value) {
        isLoading.value = true;
        setTimeout(() => {
          auth.login({ email: sanitize(email.value), password: sanitize(password.value) })
            .then((isLoggedIn) => {
              isLoading.value = false;
              if (isLoggedIn) {
                validity.value = true;
                router.push({ name: "/" });
              }
              else {
                validity.value = false;
              }
            })
        }, store.state.loadingDelay);
      } else {
        validity.value = true;
      }
    };
    return { t, email, password, submitted, validity, isLoading, isEmailValid, isPasswordValid, handleSubmission, sanitize };
  },
  created() {
    this.toggleEveryDisplay();
    body.classList.remove("bg-gray-100");
  },
  beforeUnmount() {
    this.toggleEveryDisplay();
    body.classList.add("bg-gray-100");
  },
  methods: {
    ...mapMutations(["toggleEveryDisplay"]),
    setSpeed() {
      const video = document.getElementById("bg-video");
      video.playbackRate = 0.77;
    }
  }
};
</script>
