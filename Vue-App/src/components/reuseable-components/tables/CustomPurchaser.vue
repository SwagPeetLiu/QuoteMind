<template>
    <div 
        v-if="doesPurchaserExist"
        class="d-flex flex-column custom-purchaser"
    >
        <!-- client purchaser (individual) shows first -->
        <IconEntity
            v-if="isIndividualPurchaser"
            :theme="themeColour"
            :icon="getIcon('client')"
            :name="client[getRecordName('client', $i18n.locale)]"
            :id="client.id"
            target="client"
        />

        <!-- company purchaser (company) if not client is showing-->
        <IconEntity
            v-if="isCompanyPurchaser"
            :theme="themeColour"
            :icon="getIcon('company')"
            :name="company[getRecordName('company', $i18n.locale)]"
            :id="company.id"
            target="company"
        />

        <!-- if both exists, companies will shows as the related tag -->
        <div v-if="client && company" class="ms-6 py-0 my-1 d-flex align-items-center text-gradient text-dark font-weight-bold related-company">
            <i class="me-1" :class="getIcon('company')"></i>
            <span>
                {{ company[getRecordName('company', $i18n.locale)] }}
            </span>
        </div>
    </div>

    <p v-else class="text-gradient text-danger font-weight-bolder">
        {{ `${t('validation.missing')}${t('validation.purchaser')}` }}
    </p>
</template>

<script>
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { useI18n } from "vue-i18n";
import { getRecordName } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
export default{
    name: "CustomPurchaser",
    props:{
        client:{
            type : [Object, null],
            required: true
        },
        company:{
            type : [Object, null],
            required: true
        },
        themeColour:{
            type: String,
            required: true
        }
    },
    components:{
        IconEntity
    },
    data(){
        const { t } = useI18n({});
        return {
            t
        }
    },
    computed:{
        doesPurchaserExist(){
            return this.client || this.company;
        },
        isIndividualPurchaser(){
            return this.client;
        },
        isCompanyPurchaser(){
            return this.company && !this.client;
        }
    },
    methods:{
        getRecordName,
        getIcon
    }
}
</script>

<style scoped>
.custom-purchaser{
    .related-company{
        font-size: 0.8rem;
        transition: transform 0.2s ease-in-out;

        &:hover{
            span{
                cursor: pointer;
                transform: scale(1.05);
                border-bottom: 2px solid rgba(0,0,0,0.2);
            }
        }
    }
}
</style>