<template>
    <div class="w-100">

        <!-- Display mode -->
        <SlideUpElement v-if="!isEditing & isSizeConditionProvided">
            <div 
                class="w-100 d-flex align-items-center font-weight-bold text-gradient text-dark text-lg"
            >
                <i class="me-2 my-0" :class="getIcon('size')"></i>
                <span class="my-0">{{ t(`columns.size`) }}</span>
                <span class="mx-2 my-0">{{ currentThreshold }}</span>
                <span class="my-0">{{ size }}</span>
                <span class="my-0">{{ sizeUnit }}</span>
            </div>
        </SlideUpElement>

        <SlideUpElement v-if="!isEditing & !isSizeConditionProvided">
            <div 
                class="w-100 d-flex align-items-center text-lg"
            >
                <i class="me-2 my-0 font-weight-bolder text-gradient text-dark" :class="getIcon('size')"></i>
                <span class="my-0 text-gradient text-dark">{{ t('form.pricing applies for') }}</span>
                <span class="my-0 text-gradient text-dark">{{ t('others.space') }}</span>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('form.any size') }}</span>
            </div>
        </SlideUpElement>

        <!-- Editing Mode -->
        <div class="w-100 d-flex align-items-center mb-2" v-if="isEditing">
            <p class="text-gradient text-dark my-0 pe-1 text-nowrap" style="width: fit-content;">
                {{ t('stats.total') }}:
            </p>
            <!-- Dropdowns for numerical condition on threshold -->
            <div class="h-100" style="width: 30%;">
                <GeneralDropdown
                    :target="'threshold'"
                    :selectableOptions="availableTresholdOptions"
                    :currentSelection="currentThreshold"
                    :isDisabled="false"
                    :isRequired="isComplementRequired"
                    @update-selection="updateCondition"
                />
            </div>

            <!-- Input for numerical value -->
            <div class="flex-grow-1 h-100 px-1">
                <EditableInfo
                    :icon="getIcon('size')"
                    :name="'size'"
                    :value="size"
                    :formStatus="formStatus"
                    :isRequired="isQuantityRequired"
                    :isDisabled="false"
                    type="number"
                    @update-form="updateCondition"
                />
            </div>

            <!-- Dropdown Selection on units -->
            <div class="h-100" style="width: 30%;">
                <GeneralDropdown
                    :target="getRecordUnit('size')"
                    :selectableOptions="availableUnitOptions"
                    :currentSelection="currentSizeUnit"
                    :isDisabled="false"
                    :isRequired="isComplementRequired"
                    @update-selection="updateCondition"
                />
            </div>
        </div>

        <!-- showing what the condition will look like -->
        <div 
            class="w-100 d-flex align-items-center text-gradient text-dark mb-1" 
            v-if="isEditing && isSizeConditionProvided"
        >
            <p>{{ t('form.generated condition as follows') }}</p>
        </div>
        <div 
            class="w-100 d-flex align-items-center justify-content-center text-gradient text-dark mt-n2" 
            v-if="isEditing && isSizeConditionProvided"
        >
            <span class="mt-n4 me-2">{{ $i18n.locale === 'en' ? '"' : '“' }}</span>
            <p 
                class="d-flex align-items-center text-nowrap"
                style="max-width: 80%; 
                text-overflow: ellipsis;"
            >
                <span>{{ t(`columns.size`) }}</span>
                <span>{{ t(`others.space`) }}</span>
                <span>{{ t(`multipleOptions.threshold.${currentThreshold}`) }}</span>
                <span>{{ t(`others.space`) }}</span>
                <span>{{ size }}</span>
                <span>{{ sizeUnit }}</span>
            </p>
            <span class="mt-n4 ms-2">{{ $i18n.locale === 'en' ? '"' : '”' }}</span>
        </div>
    </div>
</template>

<script>
import GeneralDropdown from '@/components/reuseable-components/forms/components/GeneralDropdown.vue';
import EditableInfo from '@/components/reuseable-components/forms/EditableInfo.vue';
import { getRecordUnit, mapThresholdOperator, reverseThresholdOperator } from "@/utils/helpers";
import { config } from "@/config/config";
import { useI18n } from 'vue-i18n';
import { getIcon } from "@/utils/iconMapper.js";
import SlideUpElement from '@/components/reuseable-components/styler/SlideUpElement.vue';

export default {
    name: "EditableNumericalCondition",
    components:{
        GeneralDropdown,
        EditableInfo,
        SlideUpElement
    },
    props: {
        size:{
            type: [Number, String, null], // string if user inputted an invalid string that is not numerical
            required: true
        },
        sizeUnit: {
            type: [String, null],
            required: true
        },
        threshold: {
            type: [String, null],
            required: true
        },
        formStatus: {
            type: String,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            originalSize: null,
            originalSizeUnit: null,
            originalThreshold: null,
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        isSizeConditionProvided(){
            if (this.size && this.currentSizeUnit && this.currentThreshold){
                return true;
            }
            return false;
        },
        currentThreshold(){
            return mapThresholdOperator(this.threshold); // valid treshold will have non-null value
        },
        availableTresholdOptions(){
            return config.multipleOptions.threshold; // =, <, <=, >, >= ...
        },
        availableUnitOptions(){
            return config.units.size; // letter represetation
        },
        currentSizeUnit(){
            if (this.sizeUnit !== null){
                if (this.availableUnitOptions.includes(this.sizeUnit)){
                    return this.sizeUnit;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        },
        isQuantityRequired(){
            if (this.currentSizeUnit !== null || this.currentThreshold !== null){
                return true;
            }
            else{
                return false;
            }
        },
        isComplementRequired(){
            if (this.size !== null && this.size){
                return true;
            }
            else{
                return false;
            }
        }
    },
    methods:{
        getIcon,
        getRecordUnit,
        updateCondition(target, value, isValid){
            if (target === "size"){
                // if the user is clearing the input
                if (value === null && (this.currentThreshold || this.currentSizeUnit)){
                    this.$emit("update-form", "size", null, true);
                    this.$emit("update-form", "size_unit", null, true);
                    this.$emit("update-form", "threshold", null, true);
                }

                // if Initialise an input, then do so for the unit & threshold as well
                else if (value && isValid && (!this.currentSizeUnit || !this.currentThreshold)){
                    this.$emit("update-form", "size", Number(value) > 0 ? Number(value) : null, true);
                    this.$emit("update-form", "size_unit", config.units.defaultSize, true); // needs to change this when app's config includeds Size Unit
                    this.$emit("update-form", "threshold", reverseThresholdOperator(config.defaultValue.threshold), true);
                }

                // else update based on the validity
                else{
                    if (isValid){
                        this.$emit("update-form", "size", Number(value) > 0 ? Number(value) : null, isValid);
                    }
                    else{
                        this.$emit("update-form", "size", value, isValid);
                    }
                }
            }
            else{
                // if user is inputting other information firtst, then initialise a default size
                if (value && isValid && !this.size){
                    this.$emit("update-form", "size", config.defaultValue.size, true);
                }
                this.$emit(
                    "update-form", 
                    target, 
                    target === "threshold" ? reverseThresholdOperator(value) : value, 
                    isValid
                );
            }
        },
        revertoOriginal(){
            this.isValid = true;
            this.$emit("update-form", "size", this.originalSize, true);
            this.$emit("update-form", "size_unit", this.originalSizeUnit, true);
            this.$emit("update-form", "threshold", this.originalThreshold, true);
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.revertoOriginal();
                return;
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalSize = this.size;
                this.originalSizeUnit = this.sizeUnit;
                this.originalThreshold = this.threshold;
            }
        },
    },
    beforeMount(){
        this.originalSize = this.size;
        this.originalSizeUnit = this.sizeUnit;
        this.originalThreshold = this.threshold;
    }
}
</script>