<template>
    <div
        v-if="transaction"
        class="d-flex flex-column align-items-start my-2"
    >
        <!-- Transaction ID -->
        <IconEntity
            :theme="'dark'"
            :icon="getIcon('transaction')"
            :name="transaction[getRecordName('transaction', $i18n.locale)]"
            :id="transaction.id"
            target="transaction"
        />
        
        <div class="d-flex align-items-center font-weight-bold my-2 ms-4">

            <!-- Transaction Status -->
            <span 
                class="categorical-badge-sm"
                :class="`gradient-border-${categoricalColour} text-gradient text-${categoricalColour}`"
            >
                <i class="me-1" :class="getIcon('status')"></i>
                {{ status ? 
                    t(`multipleOptions.status.${status}`) : 
                    `${t('validation.missing')}${t('columns.status')}` 
                }}
            </span>

             <!-- client relations -->
             <p v-if="client" class="my-1 ms-3 d-flex align-items-center text-gradient text-dark font-weight-bold related-entity">
                <i class="me-2" :class="getIcon('client')"></i>
                <span>
                    {{ client[getRecordName('client', $i18n.locale)] }}
                </span>
            </p>

            <!-- missing client AND company -->
            <span v-if="!client && !company" class="ms-3 my-0 text-gradient text-danger font-weight-bold">
                {{ `${t('validation.missing')}${t('routes.clients')}` }}
            </span>
        </div>
        <!-- company relations -->
        <p v-if="company" class="ms-4 mb-2 d-flex align-items-center text-gradient text-dark font-weight-bold related-entity">
            <i class="me-2" :class="getIcon('company')"></i>
            <span>
                {{ company[getRecordName('company', $i18n.locale)] }}
            </span>
        </p>
    </div>

    <p v-else class="text-gradient text-danger font-weight-bolder">
        {{ `${t('validation.missing')}${t('routes.transactions')}` }}
    </p> 
</template>

<script>
import { useI18n } from 'vue-i18n';
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { getRecordName } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
import { config } from "@/config/config";

export default {
    name: "TransactionDetails",
    props:{
        transaction: {
            type: [Object, null],
            required: true
        },
        client:{
            type : [Object, null],
            required: true
        },
        company:{
            type : [Object, null],
            required: true
        },
        status:{
            type: String,
            required: true
        }
    },
    data() {
        const {t} = useI18n({});
        return {
            t
        }
    },
    components:{
        IconEntity
    },
    methods:{
        getIcon,
        getRecordName
    },
    computed:{
        categoricalColour(){
            if (this.status){
                return config.optionsColouring['status'][this.status];
            }
            else{
                return 'danger';
            }
        }
    }
}
</script>