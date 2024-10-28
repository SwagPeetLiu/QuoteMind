<template>
    <div class="w-100">
        <!-- product -->
        <EditableReference
            v-if="isProductAvailable || (isEditing && !isProductAvailable)"
            :icon="getIcon('product')"
            :target="'product'"
            :id="product ? product.id : null"
            :name="product? product[getRecordName('product', $i18n.locale)] : null"
            :isDisabled="mapDisabled('product', $i18n.locale)"
            :isRequired="mapMandatory('product')"
            :formStatus="formStatus"
            @update-form="updateDetails"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />
        <p v-else class="text-danger text-gradient font-weight-bold">
            {{ `${t('validation.missing')}` }}
        </p>

        <!-- materials -->
        <p 
            class="mb-2 text-lg text-gradient font-weight-bold text-dark"
            v-if="isEditing"
        >
            {{ t('columns.materials') }}:
        </p>
        <EditableReferenceList
            v-if="isEditing || (isProductAvailable && isMaterialsAvailable)"
            :list="materials"
            :target="'materials'"
            :isDisabled="mapDisabled('materials', $i18n.locale)"
            :isRequired="mapMandatory('materials')"
            :formStatus="formStatus"
            @update-form="updateDetails"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />

        <!-- Dimensions -->
        <p 
            class="mb-2 text-lg text-gradient font-weight-bold text-dark"
            v-if="isEditing"
        >
            {{ t('columns.dimension') }}:
        </p>
        <SlideUpElement v-if="!isEditing">
            <div class="w-100 d-flex justify-content-start align-items-center">
                <i class="text-gradient text-dark font-weight-bold me-1 my-0" :class="getIcon('length')"></i>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('columns.length') }}</span>
                <span class="mx-2 my-0 font-weight-bolder">x</span>
                <i class="text-gradient text-dark font-weight-bold me-1 my-0" :class="getIcon('width')"></i>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('columns.width') }}</span>
                
                <span class="me-2 my-0">:</span>

                <div v-if="isDimensionsAvailable" class="d-flex justify-content-start align-items-center">
                    <span class="my-0 text-gradient text-dark">{{ length }}</span>
                    <span class="my-0 text-gradient text-dark">{{ t(`multipleOptions.dimension_unit.${dimensionUnit}`) }}</span>
                    <span class="mx-2 my-0 font-weight-bolder">x</span>
                    <span class="my-0 text-gradient text-dark">{{ width }}</span>
                    <span class="my-0 text-gradient text-dark">{{ t(`multipleOptions.dimension_unit.${dimensionUnit}`) }}</span>
                </div>
                <span v-else class="my-0 text-gradient text-danger">{{ `${t('validation.missing')}` }}</span>
            </div>
        </SlideUpElement>
        <div v-else class="d-flex flex-column w-100 mb-2">
            <div class="w-100 my-0 d-flex align-items-center">
                <div class="h-100" style="width: 60%;">
                    <EditableInfo
                        :icon="getIcon('length')"
                        :name="'length'"
                        :isDisabled="mapDisabled('length', $i18n.locale)"
                        :isRequired="isDimensionRequired"
                        :value="length"
                        :type="'number'"
                        :formStatus="formStatus"
                        @update-form="updateDetails"
                    />
                </div>
                <div class="h-100 ps-1" style="width: 40%;">
                    <GeneralDropdown
                        :target="getRecordUnit('length')"
                        :selectableOptions="availableDimensionUnitOptions"
                        :currentSelection="currentDimensionUnit"
                        :isDisabled="false"
                        :isRequired="isDimensionUnitRequired"
                        @update-selection="updateDetails"
                        @scroll-down="(distance) => $emit('scroll-down', distance)"
                    />
                </div>
            </div>
            <div class="w-100 my-1 d-flex align-items-center justify-content-center font-weight-bolder text-dark">
                x
            </div>
            <div class="w-100 my-0 d-flex align-items-center">
                <div class="h-100" style="width: 60%;">
                    <EditableInfo
                        :icon="getIcon('width')"
                        :name="'width'"
                        :isDisabled="mapDisabled('width', $i18n.locale)"
                        :isRequired="isDimensionRequired"
                        :value="width"
                        :type="'number'"
                        :formStatus="formStatus"
                        @update-form="updateDetails"
                    />
                </div>
                <div class="h-100 ps-1" style="width: 40%;">
                    <GeneralDropdown
                        :target="getRecordUnit('width')"
                        :selectableOptions="availableDimensionUnitOptions"
                        :currentSelection="currentDimensionUnit"
                        :isDisabled="false"
                        :isRequired="isDimensionUnitRequired"
                        @update-selection="updateDetails"
                        @scroll-down="(distance) => $emit('scroll-down', distance)"
                    />
                </div>
            </div>
        </div>

        <!-- Size -->
        <SlideUpElement v-if="!isEditing">
            <div class="w-100 d-flex justify-content-start align-items-center">
                <i class="text-gradient text-dark font-weight-bold me-2 my-0" :class="getIcon('size')"></i>
                <span class="my-0 text-gradient text-dark font-weight-bold">{{ t('stats.total') }}</span>
                <span class="me-2 my-0">:</span>

                <div v-if="isSizeAvailable" class="d-flex justify-content-start align-items-center">
                    <span class="my-0 text-gradient text-dark">{{ size }}</span>
                    <span class="my-0 text-gradient text-dark">{{ t(`multipleOptions.size_unit.${sizeUnit}`) }}</span>
                </div>
                <span v-else class="my-0 text-gradient text-danger">{{ `${t('validation.missing')}` }}</span>
            </div>
        </SlideUpElement>

        <div v-else class="w-100 mb-2">
            <div class="w-100 mt-1 mb-2 d-flex align-items-center justify-content-center font-weight-bolder text-dark">
                <i :class="getIcon('map down')"></i>
            </div>
            <div class="w-100 my-0 d-flex align-items-center">
                <div class="h-100" style="width: 60%;">
                    <EditableInfo
                        :icon="getIcon('size')"
                        :name="'size'"
                        :isDisabled="mapDisabled('size', $i18n.locale)"
                        :isRequired="isSizeRequired"
                        :value="size"
                        :type="'number'"
                        :formStatus="formStatus"
                        @update-form="updateDetails"
                    />
                </div>
                <div class="h-100 ps-1" style="width: 40%;">
                    <GeneralDropdown
                        :target="getRecordUnit('size')"
                        :selectableOptions="availableSizeUnitOptions"
                        :currentSelection="currentSizeUnit"
                        :isDisabled="false"
                        :isRequired="isSizeUnitRequired"
                        @update-selection="updateDetails"
                        @scroll-down="(distance) => $emit('scroll-down', distance)"
                    />
                </div>
            </div>
        </div>
    </div>
    
</template>

<script>
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import { 
    getRecordName, 
    mapDisabled, 
    mapMandatory, 
    getRecordUnit, 
    mapDefaultDimensions,
    mapDimensionUnitToSizeUnit 
} from "@/utils/helpers";
import { config } from "@/config/config";

import EditableReference from "@/components/reuseable-components/forms/EditableReference.vue";
import EditableReferenceList from "@/components/reuseable-components/forms/EditableReferenceList.vue";
import GeneralDropdown from '@/components/reuseable-components/forms/components/GeneralDropdown.vue';
import EditableInfo from '@/components/reuseable-components/forms/EditableInfo.vue';
import SlideUpElement from '@/components/reuseable-components/styler/SlideUpElement.vue';

export default {
    name: "EditableProductDetails",
    components:{
        EditableReference,
        EditableReferenceList,
        GeneralDropdown,
        EditableInfo,
        SlideUpElement
    },
    props: {
        product: {
            type: [Object, null],
            required: true
        },
        materials:{
            type: [Array, null],
            required: true
        },
        length: {
            type: [Number, String, null],
            required: true
        },
        width: {
            type: [Number, String, null],
            required: true
        },
        dimensionUnit:{
            type: [String, null],
            required: true
        },
        size:{
            type: [Number, String, null],
            required: true
        },
        sizeUnit:{
            type: [String, null],
            required: true
        },
        formStatus:{
            type: String,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t: t,
            originalProduct: null,
            originalMaterials: null,
            originalLength: null,
            originalWidth: null,
            originalDimensionUnit: null,
            originalSize: null,
            originalSizeUnit: null
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        isProductAvailable(){
            if (this.product === null) return false;
            return true;
        },
        isMaterialsAvailable(){
            if (!this.materials || !Array.isArray(this.materials) || this.materials.length === 0) return false;
            return true;
        },
        isDimensionsAvailable(){
            return this.length && this.width && this.currentDimensionUnit;
        },
        isSizeAvailable(){
            return this.size && this.currentSizeUnit;
        },
        availableDimensionUnitOptions(){
            return config.units.dimension;
        },
        availableSizeUnitOptions(){
            return config.units.size;
        },
        currentSizeUnit(){
            if (this.sizeUnit !== null){
                if (this.availableSizeUnitOptions.includes(this.sizeUnit)){
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
        currentDimensionUnit(){
            if (this.dimensionUnit){
                if (this.availableDimensionUnitOptions.includes(this.dimensionUnit)){
                    return this.dimensionUnit;
                }
                else return null;
            }
            else{
                return null;
            }
        },
        isDimensionRequired(){
            if ((this.length || this.width) && this.currentDimensionUnit !== null){
                return true;
            }
            else{
                return false;
            }
        },
        isDimensionUnitRequired(){
            if (this.length || this.width){
                return true;
            }
            else{
                return false;
            }
        },
        isSizeRequired(){
            if (this.currentSizeUnit || this.isDimensionRequired || this.isDimensionUnitRequired){
                return true;
            }
            else{
                return false;
            }
        },
        isSizeUnitRequired(){
            if (this.size || this.isDimensionRequired || this.isDimensionUnitRequired){
                return true;
            }
            else{
                return false;
            }
        }
    },
    methods:{
        getIcon,
        getRecordName,
        mapMandatory,
        mapDisabled,
        getRecordUnit,
        // if the composite value is valid and dimension unit is selected, mapput the size automatically:
        checkForSizeCalculation(){
            if (this.currentDimensionUnit && this.length && this.width){
                if (typeof this.length == "number" && typeof this.width == "number" && this.length > 0 && this.width > 0){
                    
                    //mapping the size based on the provided dimensions
                    const size = parseFloat((this.length * this.width).toFixed(3));
                    const mappingUnit = mapDimensionUnitToSizeUnit(this.currentDimensionUnit);
                    
                    // if the current mapping is not direct comparing to the dimension units provided at this point, then 
                    // convert them
                    if (mappingUnit !== this.currentSizeUnit){
                        let mappedSize = mapDefaultDimensions(size, mappingUnit, this.currentSizeUnit ? this.currentSizeUnit : config.units.defaultSize);
                        mappedSize = mappedSize < config.defaultValue.minimumSize ? config.defaultValue.minimumSize : mappedSize;
                        this.$emit("update-form", "size", mappedSize, true);
                        
                        // don't forget to update the size unit as well
                        if (!this.currentSizeUnit){
                            this.$emit("update-form", "size_unit", config.units.defaultSize, true);
                        }
                    }

                    // if they are the same scale, then update the size only
                    else{
                        this.$emit("update-form", "size", size, true);
                    }
                }
            }
        },
        updateDetails(target, value, isValid){
            // update as usual for the product and materials
            if (target == "product" || target === "materials"){
                this.$emit("update-form", target, value, isValid);
            }
            if (target === "length" || target === "width"){
                const compositeValue = target === "length" ? this.width : this.length;
                
                // if the user is clearing the inputs
                if (value === null && compositeValue === null){
                    this.$emit("update-form", "length", null, true);
                    this.$emit("update-form", "width", null, true);
                    this.$emit("update-form", "dimension_unit", null, true);
                    this.$emit("update-form", "size", null, true);
                    this.$emit("update-form", "size_unit", null, true);
                }

                // if initialise an input, then do so for its unit (reset the size as calculation is required)
                else if (value && isValid && !this.currentDimensionUnit){
                    this.$emit("update-form", target, Number(value) > 0 ? Number(value) : null, true);
                    this.$emit("update-form", target === "length" ? "width" : "length", null, false);
                    this.$emit("update-form", "dimension_unit", config.units.defaultDimension, true);
                    this.$emit("update-form", "size", null, true);
                    this.$emit("update-form", "size_unit", config.units.defaultSize, true);
                    setTimeout(() => this.checkForSizeCalculation(), 100);
                }

                // else update based on its validity
                else{
                    if (isValid){
                        this.$emit("update-form", target, Number(value) > 0 ? Number(value) : null, isValid);
                        setTimeout(() => this.checkForSizeCalculation(), 100);
                    }
                    else{
                        this.$emit("update-form", target, value, isValid);
                    }
                }
            }
            if(target === "size"){
                // upon clearing the input
                if (value === null && this.currentSizeUnit){
                    this.$emit("update-form", "size", null, true);
                    this.$emit("update-form", "size_unit", null, true);

                    if (this.length || this.width || this.currentDimensionUnit){
                        this.$emit("update-form", "length", null, true);
                        this.$emit("update-form", "width", null, true);
                        this.$emit("update-form", "dimension_unit", null, true);
                    }
                }
                // initialise from the input first
                else if (value && isValid && !this.currentSizeUnit && !this.length && !this.width && !this.currentDimensionUnit){
                    this.$emit("update-form", "size", Number(value) > 0 ? Number(value) : null, true);
                    this.$emit("update-form", "size_unit", config.units.defaultSize, true);
                }
                else{
                    if (isValid){
                        this.$emit("update-form", "size", Number(value) > 0 ? Number(value) : null, isValid);
                    }
                    else{
                        this.$emit("update-form", "size", value, isValid);
                    }
                }
            }
            if(target === "dimension_unit" || target === "size_unit"){
                this.$emit("update-form", target, value, isValid);
                setTimeout(() => this.checkForSizeCalculation(), 100);
            }
        }
    }
}
</script>