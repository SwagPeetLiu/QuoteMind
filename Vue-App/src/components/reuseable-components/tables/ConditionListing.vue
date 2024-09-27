<template>
    <div 
        class="d-flex flex-column align-items-start mt-2"
        v-if="conditions && relatedProduct"
    >
        <IconEntity
            :theme="themeColour" 
            :icon="getIcon('product')" 
            :name="relatedProduct[getRecordName('product', $i18n.locale)]"
            :id="relatedProduct.id"
            :target="'product'"
        />

        <div class="d-flex flex-wrap align-items-center">
            <PricingConditionDetails
                v-for="(record, index) in conditions"
                :key="index"
                :quantity="record['quantity']"
                :quantity_unit="record['quantity_unit']"
                :materials="record['materials']"
                :size="record['size']"
                :size_unit="record['size_unit']"
                :threshold="record['threshold']"
                :client="record['client']"
                :company="record['company']"
                :colour="record['colour']"
                :useBorder="true"
            />
        </div>
    </div>
    <div v-else class="d-flex align-items-start justify-content-center text-gradient text-danger font-weight-bold">
        {{ t("validation.missing") }}
    </div>
</template>

<script>
import PricingConditionDetails from "@/components/reuseable-components/tables/PricingConditionDetails.vue";
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import { getRecordName } from "@/utils/helpers";

export default {
    name: "ConditionListing",
    components:{
        PricingConditionDetails,
        IconEntity
    },
    props:{
        conditions: {
            type: [Array, null],
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
        relatedProduct(){
            if (this.conditions) {
                return this.conditions[0]['product'];
            }
            else{
                return null;
            }
        }
    },
    methods:{
        getIcon,
        getRecordName
    }
}
</script>