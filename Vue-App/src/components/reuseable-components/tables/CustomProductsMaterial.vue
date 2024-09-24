<template>
    <div v-if="isProductAvailable" class="d-flex flex-column align-items-start">
        <IconEntity 
            :theme="themeColour"
            :icon="getIcon('product')"
            :name="product[getRecordName('product', $i18n.locale)]"
            :id="product.id" 
            target="product"
        />
    </div>
    <p v-else class="text-gradient text-danger font-weight-bolder">
        {{ `${t('validation.missing')}${t('validation.product')}` }}
    </p>
</template>

<script>
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { useI18n } from "vue-i18n";
import { getRecordName } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
export default {
    name: "CustomProductsMaterial",
    components: {
        IconEntity
    },
    props: {
        product: {
            type: [Object, null],
            required: true
        },
        materials: {
            type: [Array, null],
            required: true
        },
        themeColour: {
            type: String,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t
        }
    },
    computed: {
        isProductAvailable() {
            return this.product !== null;
        }
    },
    methods: {
        getIcon,
        getRecordName
    }
}
</script>