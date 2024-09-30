<template>
    <div
        class="fixed-plugin"
        ref="InstanceSliderContainer"
        :class="{ 'show': this.$store.state.showInstanceSlider.display }"
    >

        <!-- Instance display Card -->
        <div class="shadow-lg card blur instance-slider">
            <div class="wavy-header" :class="`gradient-${themeColour}`">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="var(--gradient-start-color)"/>
                            <stop offset="100%" stop-color="var(--gradient-end-color)"/>
                        </linearGradient>
                        <filter id="shadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
                        </filter>
                    </defs>
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill" fill="url(#wave-gradient)" filter="url(#shadow)"></path>
                </svg>
            </div>

            <!-- Slider Header -->
            <div class="instance-header ms-1 mt-2 text-white font-weight-bolder">
                <p class="d-flex align-items-center text-white font-weight-bolder my-0 text-shadow-lg">
                    <i class="me-2" :class="getIcon('id')"></i>
                    <span>{{ t('columns.id') }}</span>
                </p>
                <p class="my-0 font-weight-bolder text-sm text-shadow-lg">
                    {{ this.$store.state.showInstanceSlider.id }}
                </p>

                <!-- Close Button -->
                <i 
                    class="close-button text-shadow-md"
                    :class="getIcon('cancel')" 
                    @click="closeInstanceSlider">
                </i>

                <!-- instance Icon -->
                <i 
                    class="instance-icon text-shadow-md"
                    :class="getIcon(this.$store.state.showInstanceSlider.target)"
                >
                </i>

                <!-- Category of the instance -->
                <div class="instance-target">
                    <p class="text-gradient text-shadow-md" :class="`text-${themeColour}`">
                        {{ t(`routes.${this.$store.state.showInstanceSlider.target}`) }}
                    </p>
                </div>
            </div>

            <!-- Slider Content -->
            <div class="mt-5 mb-2 mx-1 w-100 h-100" v-if="this.$store.state.showInstanceSlider.display">
                <InfoForm 
                    :target="this.$store.state.showInstanceSlider.target"
                    :id="this.$store.state.showInstanceSlider.id"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";
import { useI18n } from "vue-i18n";
import InfoForm from "@/components/page-layouts/InstanceSlider/InfoForm.vue";

export default {
    name: "index",
    data(){
        const { t } = useI18n({});
        return{
            t
        }
    },
    computed: {
        themeColour(){
            return this.$store.state.themeColor;
        }
    },
    components:{
        InfoForm
    },
    methods:{
        getIcon,

        // function used to close the instance slider:
        closeInstanceSlider() {
            this.$store.commit("toggleInstanceSlider", { display: false, id: null, target: null });
            document.removeEventListener('click', this.handleClickOutside, true);
        },
        // function used to handle clicks outside
        handleClickOutside(event) {
            if (this.$store.state.showInstanceSlider.display === true &&
                this.$refs.InstanceSliderContainer &&
                !this.$refs.InstanceSliderContainer.contains(event.target) &&
                this.$store.getters.haveNoDialogs === true
            ) {
                this.closeInstanceSlider();
            }
        },
        addOutsideClickListener() {
            setTimeout(() => {
                document.addEventListener('click', this.handleClickOutside, true);
            }, 100);
        },
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    },
    watch: {
        '$store.state.showInstanceSlider': {
            handler(newValue) {
                if (newValue.display) {
                    this.$nextTick(() => {
                        this.addOutsideClickListener();
                    });
                }
            },
            deep: true
        }
    },
}
</script>