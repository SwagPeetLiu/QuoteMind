<template>
    <div class="d-flex flex-column align-items-start">
        <!-- total size -->
        <p 
            class="d-flex align-items-center text-gradient"
            :class="`text-${themeColour}`"
            v-if="isSizeAvailable"
        >
            <i :class="getIcon('size')"></i>
            <span class="ms-2">{{ `${size} ${mappedSizeUnit}`}}</span>
        </p>

        <!-- dimension details -->
        <p v-if="isLengthAvailable" class="text-gradient text-dark">
            {{ `${t('columns.length')} : ${length} ${mappedDimensionUnit}` }}
        </p>
        <p v-if="isWidthAvailable" class="text-gradient text-dark">
            {{ `${t('columns.width')} : ${width} ${mappedDimensionUnit}` }}
        </p>
        <p v-if="isHeightAvailable" class="text-gradient text-dark">
            {{ `${t('columns.height')} : ${height} ${mappedDimensionUnit}` }}
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
        height:{
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
        isHeightAvailable(){
            if (this.height && this.dimension_unit) {
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