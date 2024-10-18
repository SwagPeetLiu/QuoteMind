<template>
    <div class="w-100">
        <SlideUpElement v-if="!isEditing">
            <div 
                v-if="isNumericalConditionProvided"
                class="w-100 d-flex align-items-center text-gradient text-dark"
            >
                <i class="me-2 my-0" :class="getIcon(currentNumericalTarget)"></i>
                <span class="my-0 font-weight-bold">{{ t(`columns.${currentNumericalTarget}`) }}</span>
                <span class="mx-2 font-weight-bold my-0">{{ currentThreshold }}</span>
                <span class="my-0">{{ `${currentNumericalTarget === 'size' ? size : quantity}`}}</span>
                <span class="my-0">{{ `${currentNumericalTarget === 'size' ? sizeUnit : quantityUnit}` }}</span>
            </div>

            <div 
                v-else
                class="w-100 d-flex align-items-center justify-content-center text-gradient text-dark"
            >
                -- {{ t('form.temporarily empty') }} --
            </div>
        </SlideUpElement>

        <!-- Editing Mode -->
        <div class="w-100 d-flex flex-wrap align-items-center" v-if="isEditing">
            <!-- Dropdowns for numerical condition on quantity and size -->
            <div class="w-50 h-100 mb-3 pe-1">
                <GeneralDropdown
                    :target="'category'"
                    :selectableOptions="[t('columns.quantity'), t('columns.size')]"
                    :currentSelection="t(`columns.${currentNumericalTarget}`) ? t(`columns.${currentNumericalTarget}`) :  t('columns.quantity')"
                    :isDisabled="false"
                    :isRequired="true"
                    @update-selection="updateCondition"
                />
            </div>

            <!-- Dropdowns for numerical condition on threshold -->
            <div class="w-50 h-100 mb-3">
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

            <div class="w-50 h-100 pe-1 mb-2">
                <EditableInfo
                    :key="currentNumericalTarget"
                    :icon="getIcon(currentNumericalTarget)"
                    :name="currentNumericalTarget"
                    :value="currentNumericalTarget === 'size' ? size : quantity"
                    :formStatus="formStatus"
                    :isRequired="true"
                    :isDisabled="false"
                    type="number"
                    @update-form="updateCondition"
                />
            </div>

            <!-- Dropdown Selection on units -->
            <div class="w-50 mb-2">
                <GeneralDropdown
                    v-if="currentNumericalTarget === 'size'"
                    :target="getRecordUnit(currentNumericalTarget, $i18n.locale)"
                    :selectableOptions="availableUnitOptions"
                    :currentSelection="currentSize"
                    :isDisabled="false"
                    :isRequired="true"
                    @update-selection="updateCondition"
                />

                <EditableInfo
                    v-else
                    :icon="getIcon('unit')"
                    :name="'quantity_unit'"
                    :value="quantityUnit"
                    :formStatus="formStatus"
                    :isRequired="true"
                    :isDisabled="false"
                    @update-form="updateCondition"
                />
            </div>

            <!-- showing what the condition will look like -->
            <div class="w-100 d-flex align-items-center text-gradient text-dark mb-1">
                <p>{{ t('form.generated condition as follows') }}</p>
            </div>
            <div class="w-100 d-flex align-items-center justify-content-center text-gradient text-dark mt-n2">
                <span class="mt-n4 me-2">{{ $i18n.locale === 'en' ? '"' : '“' }}</span>
                <p class="d-flex align-items-center">
                    <span>{{ t(`columns.${currentNumericalTarget}`) }}</span>
                    <span>{{ t(`others.space`) }}</span>
                    <span>{{ t(`multipleOptions.threshold.${currentThreshold}`) }}</span>
                    <span>{{ t(`others.space`) }}</span>
                    <span>{{ currentNumericalTarget === 'size' ? size : quantity }}</span>
                    <span>{{ currentNumericalTarget === 'size' ? sizeUnit : quantityUnit }}</span>
                </p>
                <span class="mt-n4 ms-2">{{ $i18n.locale === 'en' ? '"' : '”' }}</span>
            </div>
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
        quantity: {
            type: [Number, null],
            required: true
        },
        quantityUnit: {
            type: [String, null],
            required: true
        },
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
            originalQuantity: null,
            originalQuantityUnit: null,
            originalSize: null,
            originalSizeUnit: null,
            originalThreshold: null,
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        isNumericalConditionProvided(){
            if (this.size && this.sizeUnit && this.threshold){
                return true;
            }
            if (this.quantity && this.quantityUnit && this.threshold){
                return true;
            }
            return false;
        },
        currentNumericalTarget(){
            if (this.size !== null){
                return "size";
            }
            if (this.quantity !== null){
                return "quantity";
            }
            return null;
        },
        availableTresholdOptions(){
            return config.multipleOptions.threshold;
        },
        currentThreshold(){
            const mappedOperator = mapThresholdOperator(this.threshold);
            if (mappedOperator){
                return mappedOperator;
            }
            return this.availableTresholdOptions[0];
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
                    return config.units.defaultSize;
                }
            }
            else{
                return config.units.defaultSize;
            }
        }
    },
    methods:{
        getIcon,
        getRecordUnit,
        updateCondition(target, value, isValid){
            if (target === "category"){
                // assign the category
                let newCategory = value;
                if (value === "size" || value === this.t("columns.size")){
                    newCategory = "size";
                }
                else{
                    newCategory = "quantity";
                }

                // only update if the category is changing
                if (newCategory !== this.currentNumericalTarget){
                    const removingCategory = newCategory == "size" ? "quantity" : "size";
                    let defaultValue = newCategory == "size" ? config.defaultValue.size : config.defaultValue.quantity;
                    let defualtUnit = 
                    newCategory == "size" ? 
                        config.units.defaultSize : 
                        `${this.$i18n.locale === "en" ? config.units.defaultQuantityENUnit : config.units.defaultQuantityCHUnit}`;

                    // add the entries for the new category
                    this.$emit("update-form", newCategory, defaultValue, true);
                    this.$emit("update-form", getRecordUnit(newCategory, this.$i18n.locale), defualtUnit, true);

                    // remove the entries for the old category & its unit
                    this.$emit("update-form", removingCategory, null, true);
                    this.$emit("update-form", getRecordUnit(removingCategory, this.$i18n.locale), null, true);
                }
            }
            else if (target === "threshold"){
                this.$emit("update-form", target, reverseThresholdOperator(value), true);
            }
            else{
                this.$emit("update-form", target, value, isValid);
            }
        },
        revertoOriginal(){
            this.isValid = true;
            this.$emit("update-form", "quantity", this.originalQuantity, true);
            this.$emit("update-form", "quantity_unit", this.originalQuantityUnit, true);
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
                this.originalQuantity = this.quantity;
                this.originalQuantityUnit = this.quantityUnit;
                this.originalSize = this.size;
                this.originalSizeUnit = this.sizeUnit;
                this.originalThreshold = this.threshold;
            }
        },
    },
    beforeMount(){
        this.originalQuantity = this.quantity;
        this.originalQuantityUnit = this.quantityUnit;
        this.originalSize = this.size;
        this.originalSizeUnit = this.sizeUnit;
        this.originalThreshold = this.threshold;
    }
}
</script>