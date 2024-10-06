<template>
    <div v-if="isProductAvailable" class="d-flex flex-column align-items-start">
        <IconEntity 
            theme="dark"
            :icon="getIcon('product')"
            :name="product[getRecordName('product', $i18n.locale)]"
            :id="product.id" 
            target="product"
        />

        <!-- Related Materials -->
        <div 
            v-if="isMaterialsAvailable" 
            class="d-flex flex-wrap align-items-center references-container ms-2 mb-1"
        >
            <div
                v-for="(material, index) in materials"
                :key="index"
                class="text-gradient text-dark ms-2 mt-2"
            >
                <p>{{ material[getRecordName('material', $i18n.locale)] }}</p>
            </div>
        </div>
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
        },
        isMaterialsAvailable(){
            if (!this.materials || !Array.isArray(this.materials) || this.materials.length === 0) {
                return false;
            }
            return true;
        }
    },
    methods: {
        getIcon,
        getRecordName
    }
}
</script>