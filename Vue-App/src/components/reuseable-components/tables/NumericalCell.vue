<template>
    <div v-if="providedValue && valueValidated" class="d-flex align-items-center justify-content-center">
        <span v-if="columnType.includes('monetary')">
            {{ $i18n.locale === "en" ? "$" : "¥" }}
        </span>
        <IncrementNumber :endValue="providedValue" />
        <span v-if="column === 'quantity'">{{ record['quantity_unit'] }}</span>
    </div>
    <div v-else class="d-flex align-items-center justify-content-center text-gradient text-danger font-weight-bold">
        {{  t('validation.missing') }}
    </div>
</template>

<script>
import IncrementNumber from "@/components/statistical-components/IncrementNumber.vue";
import { useValidators } from '@/utils/useValidators'; 
import { useI18n } from "vue-i18n";
const { isNumericalRecordValid } = useValidators();

export default {
    name: "NumericalCell",
    props: {
        record: {
            type: Object,
            required: true
        },
        column:{
            type: String,
            required: true
        },
        columnType:{
            type: String,
            required: true
        },
        target:{ // the belonging table
            type: String,
            required: true
        }
    },
    components:{
        IncrementNumber
    },
    data(){
        const { t } = useI18n({});
        return{
            t
        }
    },
    computed:{
        providedValue(){
            const value = this.record[this.column];
            if (typeof value !== 'number') {
                return null;
            }
            else{
                if (Number.isInteger(value) && !this.columnType.includes('monetary')) {
                    return value;
                }
                else{
                    return value.toFixed(2);
                }
            }
        },
        valueValidated(){
            return isNumericalRecordValid(this.record, this.target, this.column, this.providedValue).valid;
        }
    }
}
</script>