<template>
    <div class="w-100">

        <!-- Display mode -->
        <SlideUpElement v-if="!isEditing & isQuantityProvided">
            <div 
                class="w-100 d-flex align-items-center font-weight-bold text-lg"
            >
                <i class="me-2 pe-1 my-0 text-gradient text-dark" :class="getIcon('quantity')"></i>
                <span class="my-0 text-gradient text-dark">{{ t(`columns.quantity`) }}</span>
                <span class="mx-2 my-0 text-gradient text-dark">{{ mapThresholdOperator('ge') }}</span>
                <span class="text-gradient text-dark my-0">{{ quantity }}</span>
                <span class="text-gradient text-dark my-0">{{ quantityUnit }}</span>
            </div>
        </SlideUpElement>
        <SlideUpElement v-if="!isEditing && !isQuantityProvided">
            <div 
                class="w-100 d-flex align-items-center text-lg"
            >
                <i class="me-2 my-0 text-gradient text-dark font-weight-bold" :class="getIcon('quantity')"></i>
                <span class="my-0 text-gradient text-dark">{{ t('form.pricing applies for') }}</span>
                <span class="my-0 text-gradient text-dark">{{ t('others.space') }}</span>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('form.any quantity') }}</span>
            </div>
        </SlideUpElement>

        <!-- Editing Mode -->
        <div class="w-100 h-100 d-flex align-items-center mb-3" v-if="isEditing">
            <p class="text-gradient text-dark my-0 text-nowrap">
                {{ t('stats.more than') }}:
            </p>
            <div class="h-100 px-1 flex-grow-1">
                <EditableInfo
                    :icon="getIcon('quantity')"
                    :name="'quantity'"
                    :value="quantity"
                    :formStatus="formStatus"
                    :isRequired="isQuantityRequired"
                    :isDisabled="false"
                    type="number"
                    @update-form="updateCondition"
                />
            </div>
            <div class="h-100" style="width: 50%;">
                <EditableInfo
                    :icon="getIcon('unit')"
                    :name="'quantity_unit'"
                    :value="quantityUnit"
                    :formStatus="formStatus"
                    :isRequired="isUnitRequired"
                    :isDisabled="false"
                    @update-form="updateCondition"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapThresholdOperator } from "@/utils/helpers";
import SlideUpElement from '@/components/reuseable-components/styler/SlideUpElement.vue';
import { getIcon } from "@/utils/iconMapper.js";
import EditableInfo from '@/components/reuseable-components/forms/EditableInfo.vue';
import { config } from "@/config/config";

export default {
    name: "EditableQuantityCondition",
    components:{
        SlideUpElement,
        EditableInfo
    },
    props: {
        quantity: {
            type: [Number, String, null], // string if user inputted an invalid string that is not numerical
            required: true
        },
        quantityUnit: {
            type: [String, null],
            required: true
        },
        formStatus: {
            type: String,
            required: true
        }
    },
    data() {
        const { t } = useI18n({});
        return{
            t,
            originalQauntity: null,
            originalQuantityUnit: null,
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        isQuantityProvided(){
            if (this.quantity && this.quantityUnit){
                return true;
            }
            return false;
        },
        isQuantityRequired(){
            if (this.quantityUnit !== null && this.quantityUnit){
                return true;
            }
            else{
                return false;
            }
        },
        isUnitRequired(){
            if (this.quantity !== null && this.quantity){
                return true;
            }
            else{
                return false;
            }
        }
    },
    methods: {
        mapThresholdOperator,
        getIcon,
        updateCondition(target, value, isValid){

            // Quantity updates
            if (target === "quantity"){

                // if user is clearing the input
                if (value === null && this.quantityUnit){
                    this.$emit("update-form", "quantity", null, true);
                    this.$emit("update-form", "quantity_unit", null, true);
                }
                // if Initialise an input, then do so for the unit as well
                else if (value && isValid && !this.quantityUnit){
                    this.$emit("update-form", "quantity", Number(value) > 0 ? value : null, true);
                    this.$emit(
                        "update-form",
                        "quantity_unit", 
                        this.$store.getters.getLanguage == 'ch' ? 
                        config.units.defaultQuantityCHUnit : 
                        config.units.defaultQuantityENUnit, 
                        true
                    );
                }
                // if the value is not null, but failed validation
                else{
                    if(isValid){
                        this.$emit("update-form", "quantity", Number(value) > 0 ? value : null, isValid);
                    }
                    else{
                        this.$emit("update-form", "quantity", value, isValid);
                    }
                }
            }
            else{
                // if user is inputing the unit first, initialise a default quantity
                if (value && isValid && !this.quantity){
                    this.$emit("update-form", "quantity", config.defaultValue.quantity, true);
                }
                this.$emit("update-form", target, value, isValid);
            }
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", "quantity", this.originalQauntity, true);
                this.$emit("update-form", "quantity_unit", this.originalQuantityUnit, true);
                return;
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalQuantity = this.quantity;
                this.originalQuantityUnit = this.quantityUnit;
            }
        },
    },
    beforeMount() {
        this.originalQauntity = this.quantity;
        this.originalQuantityUnit = this.quantityUnit;
    }
}
</script>