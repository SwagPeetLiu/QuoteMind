<template>
    <div class="w-100">

        <!-- Display mode -->
        <SlideUpElement v-if="!isEditing">
            <div 
                v-if="isSizeConditionProvided"
                class="w-100 d-flex align-items-center text-gradient text-dark text-lg"
            >
                <i class="me-2 my-0" :class="getIcon('size')"></i>
                <span class="my-0 font-weight-bold">{{ t(`columns.size`) }}</span>
                <span class="mx-2 font-weight-bold my-0">{{ currentThreshold }}</span>
                <span class="my-0">{{ size }}</span>
                <span class="my-0">{{ sizeUnit }}</span>
            </div>

            <div 
                v-else
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
                    :isRequired="true"
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
                    :isRequired="true"
                    :isDisabled="false"
                    type="number"
                    @update-form="updateCondition"
                />
            </div>

            <!-- Dropdown Selection on units -->
            <div class="h-100" style="width: 30%;">
                <GeneralDropdown
                    :target="getRecordUnit('size', $i18n.locale)"
                    :selectableOptions="availableUnitOptions"
                    :currentSelection="currentSize"
                    :isDisabled="false"
                    :isRequired="true"
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
            type: [Number, null],
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
            if (this.size && this.sizeUnit && this.currentThreshold){
                return true;
            }
            return false;
        },
        availableTresholdOptions(){
            return config.multipleOptions.threshold;
        },
        currentThreshold(){
            return mapThresholdOperator(this.threshold); // valid treshold will have non-null value
        },
        availableUnitOptions(){
            return config.units.size;
        },
        currentSize(){
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
        }
    },
    methods:{
        getIcon,
        getRecordUnit,
        updateCondition(target, value, isValid){
            if (target === "threshold"){
                this.$emit("update-form", target, reverseThresholdOperator(value), true);
            }

            else{
                this.$emit("update-form", target, value, isValid);
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
            // direct submission if the input is disabled
            if (newValue === "saving" || newValue === "editing"){
                if (this.isDisabled){
                    this.revertoOriginal();
                    return;
                }
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