<template>
    <div 
        class="d-flex align-items-center justify-content-start position-relative editable-container"
    >
        <!-- input icon -->
        <i 
            class="me-2 text-lg text-gradient input-icon" 
            :class="
                [
                    icon, isEditing? 'editing': '', 
                    isEditing? `text-${$store.state.themeColor}`: 'text-dark',
                    size === 'large' ? 'text-2xl' : 'text-lg'
                ]"
        >
        </i>
        <!-- input label -->
        <p 
            class="me-2 me-3 my-0 font-weight-bold text-dark input-label"
            :class="[isEditing ? 'editing': '', size === 'large' ? 'text-2xl' : 'text-lg']"
        >
            {{ t(`columns.${name}`) }}
            <span v-if="!isEditing" class="ms-n1">:</span>
        </p>

        <!-- current value -->
        <LoadInText 
            v-if="!isEditing" 
            :inputClass="`text-dark my-0 ${size === 'large' ? 'text-2xl' : 'text-lg'}`" 
            :text="value"
            :spaceWidth="7" 
        />

        <!-- input value -->
        <input 
            v-if="isEditing" 
            class="form-control overflow-hidden border border-2 border-dark"
            :class="{'is-invalid': !isValid}"
            :type="type" 
            :id="name" 
            :required="isRequired"
            v-model="inputValue"
            :disabled="isDisabled"
        />

        <!-- validation tooltip -->
        <div v-if="isEditing" class="invalid-tooltip fs-7">
            {{ validationTips }}
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import LoadInText from '@/components/reuseable-components/text/LoadInText.vue';
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();

export default {
    name: "EditableInfo",
    components:{
        LoadInText
    },
    props: {
        icon: {
            type: String,
            default: "fa-solid fa-circle-info",
        },
        name: {
            type: String,
            default: "username",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        value: {
            type: String,
            required: true,
            default: "InputValue",
        },
        type: {
            type: String,
            default: "text",
        },
        formStatus: {
            type: String,
            required: true
        },
        isRequired: {
            type: Boolean,
            default: false
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        size:{
            type: String,
            default: "large"
        }
    },
    data(){
        const { t } = useI18n({});

        return {
            inputValue: this.value,
            originalValue: this.value,
            isValid: true,
            validationTips: "",
            t: t
        }
    },
    watch:{
        formStatus(newValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.inputValue = this.originalValue;
                return this.$emit("update-form", this.name, this.originalValue, false);
            }
            else if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    this.isValid = true;
                    return this.$emit("update-form", this.name, this.originalValue, true);
                }
            }
        },
        // changing inputs when the form is in editing mode
        inputValue(newValue){
            const inputValidation = mapValidation(this.name, newValue);
            this.isValid = inputValidation.valid;
            if (!this.isValid){
                this.validationTips = inputValidation.message;
            }
            this.$emit("update-form", this.name, newValue, this.isValid);
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        }
    }
}
</script>


