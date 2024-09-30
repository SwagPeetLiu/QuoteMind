<template>
    <div class="editable-descriptions">
        <!-- input Label -->
        <div class="d-flex align-items-center justify-content-start input-header font-weight-bold">
            <i :class="[icon, 'text-gradient me-2 my-0 text-lg', `text-${isEditing ? $store.state.themeColor : 'dark'}`]"></i>
            <span class="text-gradient text-dark my-0 text-lg">{{ t(`columns.${name}`) }}</span>
        </div>

        <!-- description values -->
        <div 
            class="display-section position-relative mt-1" 
            :class="[isEditing ? 'editing border border-2 border-dark' : '']"
        >
            <textarea 
                class="form-control overflow-x-hidden overflow-y-auto thin-scrollbar"
                v-if="isEditing" 
                v-model="inputValue" :maxlength="inputUpperLimitations"
                :placeholder="`${t('form.enter')}${t('columns.' + name)}`"
            >
            </textarea>
            <p class="text-secondary position-absolute end-0 me-2 mt-n1 text-sm" v-if="isEditing">{{ currentLength }}/{{ inputUpperLimitations }}</p>

            <SlideUpElement v-else>
                <p class="text-dark text-gradient ms-1">
                    {{ value }}
                </p>
            </SlideUpElement>
        </div>
    </div>
</template>

<script>
import { config } from "@/config/config";
import { useI18n } from "vue-i18n";
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();
import SlideUpElement from "@/components/reuseable-components/styler/SlideUpElement.vue";

export default {
    name: "EditableDescriptions",
    components:{
        SlideUpElement
    },
    props: {
        icon: {
            type: String,
            default: "fa-solid fa-circle-info",
        },
        name: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
        formStatus: {
            type: String,
            required: true
        },
        isRequired: {
            type: Boolean,
            required: true
        },
        isDisabled: {
            type: Boolean,
            default: false
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            inputValue: this.value,
            originalValue: this.value,
            isValid: true,
            validationTips: ""
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        inputUpperLimitations(){
            return config.limitations.Max_Descriptions_Length;
        },
        currentLength(){
            if (!this.inputValue) return 0;
            return this.inputValue.length;
        }
    },
    watch:{
        formStatus(newValue){
            // retur nto original value upon cancelling
            if (newValue === "cancel"){
                this.inputValue = this.originalValue;
                return this.$emit("update-form", this.name, this.originalValue, false);
            }
            // no need to clear it if this textarea is disabled
            else if (newValue === "saving" || newValue === "editing"){
                if (this.isDisabled){
                    this.isValid = true;
                    return this.$emit("update-form", this.name, this.originalValue, true);
                }
            }
        },
        inputValue(newValue){
            const inputValidation = mapValidation(this.name, newValue, this.isRequired);
            this.isValid = inputValidation.valid;
            if (!this.isValid){
                this.validationTips = inputValidation.message;
            }
            this.$emit("update-form", this.name, newValue, this.isValid);
        }
    }
}
</script>