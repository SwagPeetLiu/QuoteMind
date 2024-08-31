<template>
    <div 
        class="d-flex align-items-center justify-content-start position-relative editable-container"
    >
        <!-- input icon -->
        <i 
            class="me-2 text-2xl text-gradient input-icon" 
            :class="
                [
                    icon, isEditing? 'editing': '', 
                    isEditing? `text-${$store.state.themeColor}`: 'text-dark'
                ]"
        >
        </i>
        <!-- input label -->
        <p 
            class="me-2 me-3 text-2xl my-0 font-weight-bold text-dark input-label"
            :class="{'editing': isEditing}"
        >
            {{ t(`form.${name}`) }}
            <span v-if="!isEditing" class="ms-n1">:</span>
        </p>

        <!-- current value -->
        <LoadInText 
            v-if="!isEditing" 
            inputClass="text-2xl text-dark my-0" 
            :text="value"
            :spaceWidth="9" 
        />

        <!-- input value -->
        <input 
            v-if="isEditing" 
            class="form-control overflow-hidden border border-2 border-dark"
            :type="type" 
            :id="name" 
            :required="isRequired"
            v-model="inputValue"
            :disabled="isDisabled"
        />

        <!-- validation tooltip -->
        <div v-if="isEditing" class="invalid-tooltip fs-7">
            {{ t('signIn.require valid email') }}
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
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            inputValue: this.value,
            originalValue: this.value,
            isValid: false,
            t: t
        }
    },
    watch:{
        formStatus(newValue){
            console.log("form status changed", newValue);
            if (newValue !== "editing"){ 
                this.prepareUpdate();
            }
        }
    },
    methods:{
        prepareUpdate(){
            if (this.formStatus === "cancel"){
                this.inputValue = this.originalValue;
                return this.$emit("update-form", this.name, this.originalValue, false);
            }
            else if (this.formStatus === "saving"){
                // no need validate if it cannot be updated
                if (this.isDisabled){
                    this.isValid = true;
                    return this.$emit("update-form", this.name, this.originalValue, true);
                }
                // conduct validations:
                const inputValidation = mapValidation(this.name, this.inputValue);
                this.isValid = inputValidation.valid;
                this.$emit("update-form", this.name, this.inputValue, this.isValid);
            }

            // no need to update anything if merely to display the updated
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        }
    }
}
</script>


