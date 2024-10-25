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
            :formatStatus="formatStatus"
            @update-form="updateDetails"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />
        <p v-else class="text-danger text-gradient font-weight-bold">
            -- {{ `${t('validation.missing')}` }} --
        </p>

        <!-- materials -->
        <p 
            class="my-1 text-lg text-gradient font-weight-bold text-dark"
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
        
        <!-- Size -->
    </div>
    
</template>

<script>
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import { getRecordName, mapDisabled, mapMandatory } from "@/utils/helpers";
import EditableReference from "@/components/reuseable-components/forms/EditableReference.vue";
import EditableReferenceList from "@/components/reuseable-components/forms/EditableReferenceList.vue";
import { mapDisabled } from "../../../utils/helpers";
import { config } from "@/config/config";

export default {
    name: "EditableProductDetails",
    components:{
        EditableReference,
        EditableReferenceList,

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
            type: [Number, null],
            required: true
        },
        width: {
            type: [Number, null],
            required: true
        },
        enUnit:{
            type: [String, null],
            required: true
        },
        chUnit:{
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
            originalEnUnit: null,
            originalChUnit: null,
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
            return this.length && this.width && (this.enUnit || this.chUnit);
        },
        currentDimensionUnit(){
            if (this.enUnit){
                return this.enUnit;
            }
            else{
                return this.chUnit;
            }
        }
    },
    methods:{
        getIcon,
        getRecordName,
        mapMandatory,
        mapDisabled,
        updateDetails(target, value, isValid){
            
        }
    }
}
</script>