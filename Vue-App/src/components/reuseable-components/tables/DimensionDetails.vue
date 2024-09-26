<template>
    <div class="w-100 h-100 d-flex flex-column align-items-center">
        <!-- total size -->
        <p 
            class="d-flex align-items-center text-gradient mt-1 mb-0 font-weight-bolder"
            :class="`text-${themeColour}`"
            v-if="isSizeAvailable || mappedSize"
        >
            <i :class="getIcon('size')"></i>
            <span class="ms-2">{{ `${ size ? size : mappedSize }${mappedSizeUnit}`}}</span>
        </p>

        <!-- dimension details -->
        <p 
            v-else-if="isLengthAvailable && isWidthAvailable" 
            class="text-gradient text-dark my-1 d-flex flex-column"
        >
            <span>{{ `${t('columns.length')}: ${length}${dimension_unit}` }}</span>
            <span class="mt-1">{{ `${t('columns.width')}: ${width}${dimension_unit}` }}</span>
        </p>

        <!-- missing diemsnions & size -->
        <p v-else class="text-gradient text-danger font-weight-bold my-0">
            {{ t('validation.missing') }}
        </p>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import { getIcon } from "@/utils/iconMapper.js";

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
            type: String,
            required: true
        },
        // unit of the total size of the product
        size_unit:{
            type: String,
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
        mappedSize(){
            if (this.isLengthAvailable && this.isWidthAvailable){
                return this.length * this.width;
            }
            else{
                return null;
            }
        },
        isLengthAvailable(){
            if (this.length && this.dimension_unit) {
                return true;
            }
            else{
                return false;
            }
        },
        isWidthAvailable(){
            if (this.width && this.dimension_unit) {
                return true;
            }
            else{
                return false;
            }
        },
        mappedSizeUnit(){
            if (this.size_unit && config.units.diemsion.includes(this.size_unit)){
                return this.t(`multipleOptions.size_unit.${this.size_unit}`);
            }
            else if (this.mappedSize){
                return this.t(`multipleOptions.size_unit.${config.units.defaultSize}`);
            }
            else{
                return "N/A";
            }
        }
    },
    methods:{
        getIcon
    }
}
</script>