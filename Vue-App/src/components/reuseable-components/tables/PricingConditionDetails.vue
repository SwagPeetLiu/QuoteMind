<template>
    <div class="d-flex flex-column my-3 custom-product-materials"
        :class="[useBorder ? 'border border-2 rounded border-dark py-2 px-3 mx-2' : 'ms-4']"
        :style="{ width: 'fit-content' }"
    >
        <!-- quantity -->
        <div 
            class="d-flex align-items-center text-gradient text-dark font-weight-bold my-1"
            v-if="isQuantityAvailable && numericThreshold"
        >
            <i :class="getIcon('quantity')"></i>
            <span class="ms-2 my-0">{{ t(`columns.quantity`) }}</span>
            <span class="mx-2 font-weight-bolder my-0">{{ numericThreshold }}</span>
            <span class="my-0">{{ `${quantity}${quantity_unit}` }}</span>
        </div>

        <!-- size -->
        <div
            v-if="mappedSize"
            class="d-flex align-items-center text-gradienttext-dark my-1 font-weight-bold"
        >
            <i :class="getIcon('size')"></i>
            <span class="ms-2 my-0">{{ t(`columns.size`) }}</span>
            <span class="mx-2 font-weight-bolder my-0">{{ numericThreshold }}</span>
            <span class="my-0">{{ `${mappedSize}${mappedSizeUnit}`}}</span>
        </div>

        <!-- materials -->
        <div 
            v-if="isMaterialsAvailable" 
            class="d-flex flex-wrap align-items-center materials-container mt-0 mb-1 ms-n2"
        >
            <span
                v-for="(material, index) in materials"
                :key="index"
                class="text-gradient text-dark ms-2 mt-1"
            >
                {{ material[getRecordName('material', $i18n.locale)] }}
            </span>
        </div>

        <!-- client -->
        <p v-if="client" class="d-flex align-items-center text-gradient text-dark font-weight-bold related-entity my-1">
            <i class="me-2" :class="getIcon('client')"></i>
            <span>
                {{ client[getRecordName('client', $i18n.locale)] }}
            </span>
        </p>

        <!-- company -->
        <p v-if="company" class="d-flex align-items-center text-gradient text-dark font-weight-bold related-entity my-1">
            <i class="me-2" :class="getIcon('company')"></i>
            <span>
                {{ company[getRecordName('company', $i18n.locale)] }}
            </span>
        </p>

        <!-- colour -->
        <p v-if="colour" class="d-flex align-items-center text-gradient text-dark font-weight-bold my-1">
            <i class="me-2" :class="getIcon('colour')"></i>
            <span>{{ colour }}</span>
        </p>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { getIcon } from '@/utils/iconMapper.js';
import { config } from "@/config/config";
import { mapDefaultDimensions, mapThresholdOperator, getRecordName } from '@/utils/helpers';

export default{
    name: "PricingConditionDetails",
    props:{
        quantity: {
            type: [Number, null],
            required: true
        },
        quantity_unit:{
            type: [String, null],
            required: true
        },
        materials: {
            type: [Array, null],
            required: true
        },
        size:{
            type: [Number, null],
            required: true
        },
        size_unit:{
            type: [String, null],
            required: true
        },
        threshold:{
            type: [String, null],
            required: true
        },
        client:{
            type:[Object, null],
            required: true
        },
        company:{
            type:[Object, null],
            required: true
        },
        colour:{
            type:[String, null],
            required: true
        },
        useBorder:{
            type: Boolean,
            required: true
        }
    },
    data(){
        const { t } = useI18n();
        return {
            t
        }
    },
    computed:{
        numericThreshold(){
            return mapThresholdOperator(this.threshold);
        },
        isQuantityAvailable(){
            if (this.quantity && this.quantity_unit) {
                return true;
            }
            else{
                return false;
            }
        },
        isMaterialsAvailable(){
            if (!this.materials || !Array.isArray(this.materials) || this.materials.length === 0) {
                return false;
            }
            return true;
        },
        isSizeAvailable(){
            if (this.size && this.size_unit){
                return true;
            }
            else{
                return false;
            }
        },
        mappedSize(){
            return mapDefaultDimensions(this.size, this.size_unit, config.units.defaultSize);
        },
        mappedSizeUnit(){
            return this.t(`multipleOptions.size_unit.${config.units.defaultSize}`);
        }
    },
    methods:{
        getIcon,
        getRecordName
    }
}
</script>