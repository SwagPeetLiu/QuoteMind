<template>
    <div class="w-100">

        <!-- Display mode -->
        <SlideUpElement v-if="!isEditing">
            <div 
                v-if="isQuantityProvided"
                class="w-100 d-flex align-items-center text-lg"
            >
                <i class="me-2 pe-1 my-0 text-gradient text-dark" :class="getIcon('quantity')"></i>
                <span class="my-0 font-weight-bold text-gradient text-dark">{{ t(`columns.quantity`) }}</span>
                <span class="mx-2 font-weight-bold my-0 text-gradient text-dark">{{ mapThresholdOperator('ge') }}</span>
                <span class="text-gradient text-dark font-weight-bold my-0">{{ quantity }}</span>
                <span class="text-gradient text-dark font-weight-bold my-0">{{ quantityUnit }}</span>
            </div>

            <div 
                v-else
                class="w-100 d-flex align-items-center text-lg"
            >
                <i class="me-2 my-0 text-gradient text-dark font-weight-bold" :class="getIcon('quantity')"></i>
                <span class="my-0 text-gradient text-dark">{{ t('form.pricing applies for') }}</span>
                <span class="my-0 text-gradient text-dark">{{ t('others.space') }}</span>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('form.any quantity') }}</span>
            </div>
        </SlideUpElement>

        <!-- Editing Mode -->
        <div class="w-100 h-100 d-flex align-items-center mb-3" v-else>
            <!-- <p class="text-gradient text-dark my-0 text-nowrap">
                {{ t('stats.more than') }}:
            </p> -->
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
// import { config } from "@/config/config";

export default {
    name: "EditableQuantityCondition",
    components:{
        SlideUpElement,
        EditableInfo
    },
    props: {
        quantity: {
            type: [Number, String, null],
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
            quantityValidity: true,
            unitValidity: true
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
            console.log("updateCondition", target, value, isValid);
            // update the validity:
            if (target === "quantity_unit"){
                this.unitValidity = isValid;
            }
            else{
                this.quantityValidity = isValid;
            }
            let validity = this.quantityValidity && this.unitValidity;
            console.log("combined validity", validity);

            // if we clearing the quantity based condition:
            if (target === "quantity" && value === 0){
                this.quantityValidity = true;
                this.unitValidity = true;
                this.$emit("update-form", "quantity", null, true);
                this.$emit("update-form", "quantity_unit", null, true);
            }
            // // initialise a quantity unit
            // else if (target === "quantity" && value && isValid && !this.quantityUnit){
            //     this.quantityValidity = true;
            //     this.unitValidity = true;
            //     this.$emit("update-form", "quantity", value, true);
            //     this.$emit(
            //         "update-form",
            //         "quantity_unit", 
            //         this.$store.getters.getLanguage == 'ch' ? 
            //         config.units.defaultQuantityCHUnit : 
            //         config.units.defaultQuantityENUnit, 
            //         true
            //     );
            // }
            else{
                //normal updates
                this.$emit("update-form", target, value, validity);
            }
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", "quantity", this.originalQauntity, true);
                this.$emit("update-form", "quantity_unit", this.originalQuantityUnit, true);
                this.quantityValidity = true;
                this.unitValidity = true;
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