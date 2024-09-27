<template>
    <div class="w-100 h-100 d-flex flex-column align-items-center">
        <!-- total size -->
        <p 
            class="d-flex align-items-center text-gradient mt-1 mb-0 font-weight-bolder"
            :class="`text-${themeColour}`"
            v-if="mappedSize"
        >
            <i :class="getIcon('size')"></i>
            <span class="ms-2">{{ `${mappedSize}${mappedSizeUnit}`}}</span>
        </p>


        <!-- dimension details -->
        <p 
            v-if="isDimensionsAvailable" 
            class="text-gradient text-dark my-1 d-flex flex-column"
        >
            <span>{{ `${t('columns.length')}: ${length}${dimension_unit}` }}</span>
            <span class="mt-1">{{ `${t('columns.width')}: ${width}${dimension_unit}` }}</span>
        </p>

        <!-- missing diemsnions & size -->
        <p v-if="!isSizeAvailable && !isDimensionsAvailable" class="text-gradient text-danger font-weight-bold my-0">
            {{ t('validation.missing') }}
        </p>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import { getIcon } from "@/utils/iconMapper.js";
import { mapDefaultDimensions, mapDimensionUnitToSizeUnit } from "@/utils/helpers";

export default {
    name: "DimensionDetails",
    props:{
        length:{
            type: [Number, null],
            required: true
        },
        width:{
            type: [Number, null],
            required: true
        },
        size:{
            type: [Number, null],
            required: true
        },
        // unit of the dimension (length, width, height)
        dimension_unit:{
            type: [String, null],
            required: true
        },
        // unit of the total size of the product
        size_unit:{
            type: [String, null],
            required: true
        },
        themeColour:{
            type: String,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return{
            t
        }
    },
    computed:{
        isSizeAvailable(){
            if (this.size && this.size_unit){
                return true;
            }
            else{
                return false;
            }
        },
        isDimensionsAvailable(){
            if (this.length && this.width && this.dimension_unit) {
                return true;
            }
            else{
                return false;
            }
        },
        mappedSize(){
            let givenSize = null;
            let mappedSize = null;
            // if size provided, map with default size unit
            if (this.isSizeAvailable){
                givenSize = mapDefaultDimensions(this.size, this.size_unit, config.units.defaultSize);
            }
            // if only dimensions are provided, then calculate and map to default size unit
            if (this.isDimensionsAvailable){
                const size = this.length * this.width;
                const mappedSizeUnit = mapDimensionUnitToSizeUnit(this.dimension_unit);
                mappedSize = mapDefaultDimensions(size, mappedSizeUnit, config.units.defaultSize);
            }
            return givenSize ? givenSize : mappedSize;
        },
        mappedSizeUnit(){
            return this.t(`multipleOptions.size_unit.${config.units.defaultSize}`);
        }
    },
    methods:{
        getIcon
    }
}
</script>