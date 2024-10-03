<template>
    <FadeInElement v-if="!isLoading && isDataAvailable">
        
        <form 
            class="w-100 slider-form was-validated overflow-x-hidden overflow-y-auto thin-scrollbar my-0 slider-form"
            :class="{'needs-validation': formStatus === 'editing'}"
            name="form"
            novalidate
        >

            <!-- display by sections -->
            <div 
                class="my-2 w-100 d-flex flex-wrap" 
                v-for="(section, index) in sections" 
                :key="index"
            >
                <!-- Section title -->
                <p class="w-100 text-gradient text-dark font-weight-bolder text-shadow-md h5 mt-0 mb-2">
                    {{ t(`detailedListings.${section}`) }}
                </p>
                
                <!-- display by attributes -->
                <div 
                    v-for="(attribute, index) in detailedListings[section]" 
                    :key="index"
                    class="w-100 px-1 mt-2"
                >
                    <!-- oridnary input field -->
                    <EditableInfo
                        v-if="mapFormSubmissionType(attribute) === 'text'"
                        :icon="getIcon(attribute)"
                        :name="attribute"
                        :isDisabled="mapDisabled(attribute, $i18n.locale)"
                        :isRequired="mapMandatory(attribute)"
                        :value="formData[attribute].value"
                        :type="'text'"
                        :formStatus="formStatus"
                        @update-form="validateInputUpdate"
                        :size="'lg'"
                        :class="'mb-2'"
                    />

                    <!-- descriptions input field -->
                    <EditableDescriptions
                        v-if="mapFormSubmissionType(attribute) === 'descriptions'"
                        :icon="getIcon(attribute)"
                        :name="attribute"
                        :isDisabled="mapDisabled(attribute, $i18n.locale)"
                        :isRequired="mapMandatory(attribute)"
                        :value="formData[attribute].value"
                        :formStatus="formStatus"
                        @update-form="validateInputUpdate"
                    />

                    <!-- reference input field -->
                    <EditableReference
                        v-if="mapFormSubmissionType(attribute) === 'reference dropdown'"
                        :icon="getIcon(attribute)"
                        :target="attribute"
                        :id="formData[attribute].value ? formData[attribute].value.id : null"
                        :name="formData[attribute].value? formData[attribute].value[getRecordName(target, $i18n.locale)]: null"
                        :isDisabled="mapDisabled(attribute, $i18n.locale)"
                        :isRequired="mapMandatory(attribute)"
                        :formStatus="formStatus"
                        @update-form="validateInputUpdate"
                    />
                </div>
            </div>
        </form>
    </FadeInElement>

    <!-- form controls -->
    <FadeInElement v-if="!isLoading && isDataAvailable">
        <div class="slider-controls w-100 px-4 my-0 gap-2 overflow-hidden d-flex align-items-center justify-content-end"
        >
            <button 
                v-if="formStatus === 'editing'" 
                class="btn btn-secondary form-button" 
                @click.stop.prevent="updateStatus('cancel')"
            >
                {{ t('form.cancel') }}
            </button>
            <button 
                class="btn form-button active" 
                :class="`bg-gradient-${$store.state.themeColor}`"
                @click.prevent="updateStatus(`${formStatus === 'editing' ? 'saving' : 'editing'}`)"
                :disabled="formStatus === 'saving' || (formStatus === 'editing' && isInputInvalid)"
            >
                <Spinner v-if="formStatus === 'saving'" :size="1"/>
                <span v-else>
                    {{ formStatus === 'editing' ? t('form.save') : t('form.edit') }}
                </span>
            </button>
        </div>
    </FadeInElement>

    <!-- loading indicator -->
    <FoldLoader v-if="isLoading"/>

    <!-- errors on fetching & displaying data -->
    <p 
        class="d-flex align-items-center justify-content-center w-100 h-100 mt-n6 text-gradient text-danger font-weight-bolder h3 text-shadow-md" 
        v-if="!isLoading && !isDataAvailable"
    >
        <FadeInElement>{{ t('stats.no data available') }}</FadeInElement>
    </p>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";
import { 
    getRecordName,
    mapFormData, 
    reverseFormatData, 
    mapFormSubmissionType, 
    mapMandatory, 
    mapDisabled
} from "@/utils/helpers";
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import instance from "@/api/instance";
import FoldLoader from "@/components/reuseable-components/loader/FoldLoader.vue";
import FadeInElement from "@/components/reuseable-components/styler/FadeInElement.vue";
import Spinner from "@/components/reuseable-components/loader/Spinner.vue";
import EditableInfo from "@/components/reuseable-components/forms/EditableInfo.vue";
import EditableDescriptions from "@/components/reuseable-components/forms/EditableDescriptions.vue";
import EditableReference from "@/components/reuseable-components/forms/EditableReference.vue";

export default {
    name: "InfoForm",
    data(){
        const { t } = useI18n({});
        return{
            t,
            isLoading: true,
            formStatus: "display",
            formData: null
        }
    },
    props:{
        target:{
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    },
    components:{
        FoldLoader,
        FadeInElement,
        EditableInfo,
        Spinner,
        EditableDescriptions,
        EditableReference
    },
    computed:{
        detailedListings(){
            return config.detailedListings[this.target];
        },
        sections(){
            return Object.keys(this.detailedListings);
        },
        isDataAvailable(){
            return this.formData !== null;
        },
        isInputInvalid() {
            if (this.formData === null) {
                return false;
            }
            return Object.values(this.formData).some((input) => !input.isValidated);
        }
    },
    methods:{
        getIcon,
        getRecordName,
        mapMandatory,
        mapFormSubmissionType,
        mapDisabled,

        // fetching data based on the provided ID:
        fetchData(){
            this.formData = null;
            this.isLoading = true;
            instance
                .getSpecificEntity({target: this.target, id: this.id})
                .then((response) => {
                    if (response.isCompleted) {
                        this.formData = mapFormData(Object.values(response.data)[0], true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setTimeout(() => {
                        this.isLoading= false;
                        this.formStatus = "display";
                    }, 1600);
                });
        },
        // function used to update the form's status:
        updateStatus(status) {
            if (status === "saving") {
                this.submitform();
            }else{
                this.formStatus = status;
            }
        },
        // function used to submit the form
        submitform(){
            this.formStatus = "saving";
            setTimeout(() => {
                if (!this.isInputInvalid) {
                    instance.updateSpecificEntity({
                        target: this.target,
                        id: this.id,
                        body: reverseFormatData(this.formData)
                    })
                    .then((response) => {
                        if (response.isCompleted){
                            this.formStatus = "display";

                            // refresh listing upon successful update
                            if (!this.$store.state.refreshListing){
                                this.$store.commit("setRefreshListing", true);
                            }
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
        },
        validateInputUpdate(name, value, isValid) {
            this.formData[name] = { value: value, isValidated: isValid };
        }
    },
    mounted(){
        this.fetchData();
    }
}
</script>

<style scoped>
.slider-form{
    max-height: 90%;
    z-index: 1;
}
.slider-controls{
    height: 10%;
    z-index: 1;
}
</style>