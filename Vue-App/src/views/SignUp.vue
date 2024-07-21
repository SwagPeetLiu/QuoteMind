<template>
  <!-- background Image -->
  <div
    class="pt-5 m-3 page-header align-items-start min-vh-50 pb-11 border-radius-lg"
    :style="{
      backgroundImage:
        'url(' + require('@/assets/img/curved-images/curvedx1.jpg') + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }"
  >
    <!-- <span class="mask bg-gradient-dark opacity-6"></span> -->

    <!-- Title -->
    <div class="container">
      <div class="row justify-content-center">
        <div class="mx-auto text-center col-lg-5">
          <h1 class="mt-5 mb-3 text-white text-glow display-2 font-weight-bold ">
            {{ t('signUp.title') }}
          </h1>
          <p class="text-white text-lead fs-5 text-glow font-weight-normal">
            {{ t('signUp.subtitle') }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Registeration Form -->
  <div class="container">
    <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
      <div class="mx-auto col-xl-4 col-lg-5 col-md-7">
        <div class="card z-index-0">
          <div class="pt-4 text-center font-weight-bolder">
            <h5>{{ t('signUp.register now') }}</h5>
          </div>
          <div class="card-body">
            <form class="text-start, was-validated d-flex flex-column gap-3" role="form" novalidate>
              <!-- User Name -->
              <div class="position-relative">
                <input
                  id="name"
                  class="form-control"
                  :class="{
                    'input-green-tick': name.touched && nameValidation.valid,
                    'is-invalid': name.touched && !nameValidation.valid
                  }"
                  type="text"
                  v-model.trim="name.value"
                  :placeholder="t('signUp.name')"
                  @blur="name.touched = true"
                />
                <div 
                  class="invalid-tooltip fs-7" 
                  v-if="name.touched && !nameValidation.valid"
                >
                  {{ nameValidation.message }}
                </div>
              </div>

              <!-- Email -->
              <div class="position-relative">
                  <input
                  id="email"
                  type="email"
                  class="form-control"
                  :class="{'input-green-tick': email.touched  && emailValidation.valid,
                            'is-invalid': email.touched  && !emailValidation.valid
                  }"
                  v-model="email.value"
                  @blur="email.touched = true"
                  :placeholder="t('signUp.email')"
                />
                <div 
                  class="invalid-tooltip fs-7" 
                  :class="{ 'is-invalid': email.touched && !emailValidation.valid }">
                  {{ emailValidation.message }}
                </div>
              </div>

              <!-- Password -->
              <div class="position-relative">
                <input
                    id="password"
                    type="password"
                    class="form-control"
                    :class="{'input-green-tick': password.touched && passwordValidation.valid,
                            'is-invalid': password.touched && !passwordValidation.valid
                    }"
                    v-model="password.value"
                    @blur="password.touched = true"
                    :placeholder="t('signUp.password')"
                />
                <div class="invalid-tooltip fs-7" :class="{ 'is-invalid': password.touched && !passwordValidation.valid }">
                  {{ passwordValidation.message }}
                </div>
              </div>

              <!-- Token -->
              <div class="position-relative">
                <input
                    id="token"
                    type="text"
                    class="form-control"
                    :class="{'is-invalid': token.touched && !tokenValidation.valid}"
                    v-model="token.value"
                    @blur="token.touched = true"
                    :placeholder="t('signUp.token')"
                />
                <div class="invalid-tooltip fs-7" :class="{ 'is-invalid': token.touched && !tokenValidation.valid }">
                  {{ tokenValidation.message }}
                </div>
              </div>

              <!-- Checkbox -->
              <div class="form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input"
                  :class="{ 
                    'font-weight-bold': agreedToForm.unagreedWhileSubmitted && !agreedToForm.value,
                    'is-invalid': agreedToForm.unagreedWhileSubmitted && !agreedToForm.value
                    }"
                  id="conditionCheck" 
                  aria-required="true" 
                  v-model="agreedToForm.value"
                >
                <label 
                  class="form-check-label font-weight-light" 
                  :class="{ 'font-weight-bold': agreedToForm.unagreedWhileSubmitted && !agreedToForm.value }" 
                  for="conditionCheck"
                >
                  <span>{{ t('signUp.agree') }}</span>
                  <span href="javascript:;" class="font-weight-bolder">
                      {{ t('signUp.terms and conditions') }}
                  </span>
                </label>
              </div>

              <button class="text-center btn bg-gradient-dark" :disabled="isLoading" type="submit" @click.prevent="handleSubmission">
                <Spinner v-if="isLoading"/>
                <span v-else>{{ t('signUp.sign up') }}</span>
              </button>
            </form>

            <!-- option to log in directly -->
            <p class="text-sm mb-0">
              {{ t('signUp.already have an account?') }}
              <router-link :to="{ name: 'Sign In' }" class="text-dark font-weight-bolder">
                  {{ t('signUp.sign in') }}
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <app-footer />
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';
import AppFooter from "@/components/page-layouts/Footer.vue";
import { mapMutations } from "vuex";
import { useValidators } from "../utils/useValidators";
import register from '../api/register';
import Spinner from '../components/reuseable-components/Spinner.vue';
import { inject } from 'vue';

export default {
  name: "SignupBasic",
  components: {
    AppFooter,
    Spinner
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const { isUsernameValid, isEmailValid, isPasswordValid, isRegisterTokenValid } = useValidators();
    const name = ref({value: "", touched: false});
    const email = ref({value: "", touched: false});
    const password = ref({value: "", touched: false});
    const token = ref({value: "", touched: false});
    const agreedToForm = ref({value: false, unagreedWhileSubmitted: false});
    const isLoading = ref(false);
    const sanitize = inject('$sanitize');

    const handleSubmission = (event) => {
      event.preventDefault();
      event.stopPropagation();

      // if submitted, then everything should be touched
      name.value.touched = true;
      email.value.touched = true;
      password.value.touched = true;
      token.value.touched = true; 
      
      // ensure the agreement to the conditions are signed
      if (!agreedToForm.value.value){
        agreedToForm.value.unagreedWhileSubmitted = true;
      }
      else{ 
        agreedToForm.value.unagreedWhileSubmitted = false;
      }

      if (nameValidation.value.valid && 
          emailValidation.value.valid && 
          passwordValidation.value.valid && 
          tokenValidation.value.valid &&
          agreedToForm.value.value) 
      {
        isLoading.value = true;
        setTimeout(() => {
          register.register({ 
            username: sanitize(name.value.value), 
            email: sanitize(email.value.value), 
            password: sanitize(password.value.value), 
            registerToken: sanitize(token.value.value) 
          })
          .then((response) => {
            if (response == true){
              router.push({ name: "Sign In" });
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            isLoading.value = false;
          });
        }, 800);
      }
      else{
        isLoading.value = false;
      }
    };

    const nameValidation = computed(() => {
      if (!name.value.touched) return { valid: true, message: "" };
      return isUsernameValid(sanitize(name.value.value));
    });

    const emailValidation = computed(() => {
      if (!email.value.touched) return {valid: true, message: ""};
      return isEmailValid(sanitize(email.value.value, true));
    });

    const passwordValidation = computed(() => {
      if (!password.value.touched) return {valid: true, message: ""};
      return isPasswordValid(sanitize(password.value.value));
    });

    const tokenValidation = computed(() => {
      if (!token.value.touched) return {valid: true, message: ""};
      return isRegisterTokenValid(sanitize(token.value.value));
    });

    return {
      t,
      name,
      email,
      password,
      token,
      agreedToForm,
      isLoading,
      handleSubmission,
      nameValidation,
      emailValidation,
      passwordValidation,
      tokenValidation,
      sanitize
    };
  },
  methods: {
    ...mapMutations(["toggleEveryDisplay"]),
  },
  created() {
    this.toggleEveryDisplay();
  },
  beforeUnmount() {
    this.toggleEveryDisplay();
  }
};
</script>