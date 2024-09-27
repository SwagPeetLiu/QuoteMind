<template>
    <div class="d-flex align-items-center justify-content-center">
        <span v-if="date && mappedDate" class="text-gradient text-dark info-span font-weight-bold">
            {{ mappedDate }}
        </span>
        <span v-else class="text-gradient text-danger font-weight-bolder">
            {{ t('validation.missing') }}
        </span>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { formatDate } from '@/utils/helpers';

export default{
    name: "FormattedDate",
    data(){
        const { t } = useI18n();
        return {
            t
        }
    },
    props:{
        date: {
            type: [Object, String, null],
            required: true
        }
    },
    computed:{
        mappedDate(){
            try{
                return formatDate(this.date, this.$store.getters.getLanguage);
            }
            catch(err){
                console.log(err);
                return null;
            }
        }
    }
}
</script>
