<template>
    <div 
        class="d-flex justify-content-start position-relative editable-container"
        :class="[isEditing ? 'align-items-center' : 'align-items-start']"
    >
        <div class="d-flex align-items-center my-0">
            <!-- input icon -->
            <i 
                class="me-2 text-gradient input-icon" 
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
                class="me-2 me-1 my-0 font-weight-bold text-dark input-label"
                :class="[isEditing ? 'editing': '', size === 'large' ? 'text-2xl' : 'text-lg']"
            >
                {{ t(`columns.${name}`) }}
                <span v-if="!isEditing" class="ms-n1">:</span>
            </p>
        </div>

        <!-- current value -->
        <LoadInText 
            v-if="!isEditing && value" 
            :inputClass="`text-dark my-0 ${size === 'large' ? 'text-2xl' : ''}`"
            :style="{ paddingTop: `${size === 'large' ? '0' : '2px'}`}"
            :text="value"
            :spaceWidth="7" 
        />

        <!-- input value -->
        <input 
            v-if="isEditing" 
            class="form-control overflow-hidden border border-2 border-dark"
            :class="{'is-invalid': !isValid}"
            :id="name" 
            v-model="inputValue"
            :disabled="isDisabled"
            @input="onInput"
        />

        <!-- validation tooltip -->
        <div v-if="isEditing && validationTips" class="invalid-tooltip fs-7">
            {{ validationTips }}
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import LoadInText from '@/components/reuseable-components/text/LoadInText.vue';
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();
import { debounce } from 'lodash';
import { config } from '@/config/config';

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
        value: {
            type: [String, Number, null],
            required: true,
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
            inputValue: this.value ? this.value : "",
            originalValue: "",
            isValid: true,
            validationTips: "",
            t: t
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.inputValue = this.originalValue;
                this.isValid = true;
                return this.$emit("update-form", this.name, this.originalValue, true);
            }
            if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    this.isValid = true;
                    return this.$emit("update-form", this.name, this.originalValue, true);
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalValue = this.value;
            }
        },
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        }
    },
    methods:{
        onInput: debounce(function(){
            // validating value based on the type
            let validateValue;
            if (this.type == "number"){
                try{
                    validateValue = Number(this.inputValue);
                }
                catch(error){
                    console.error(error, this.inputValue);
                    validateValue = this.inputValue
                }
            }
            else{
                if (this.inputValue.trim() === ""){
                    validateValue = null;
                }
                else{
                    validateValue = this.inputValue.trim();
                }
            }

            // map out the input validations
            const inputValidation = mapValidation(this.name, validateValue, this.isRequired);
            this.isValid = inputValidation.valid;
            
            if (!this.isValid){
                this.validationTips = inputValidation.message;
            }
            else{
                this.validationTips = "";
            }
            this.$emit("update-form", this.name, validateValue, this.isValid);
        }, config.UI.textDebouce),
    },
    beforeMount(){
        this.originalValue = this.value;
    }
}
</script>


