<template>
    <div class='h-100 w-100 d-flex justify-content-center align-items-center'>
        <span class="categorical-badge font-weight-bold ms-3"
            :class="`gradient-border-${categoricalColour} text-gradient text-${categoricalColour}`"
        >
            <i class="me-2" :class="getIcon('conditions')"></i>
            {{ t(`multipleOptions.conditions.${conditionCategory}`)}}
        </span>
    </div>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";
import { useI18n } from "vue-i18n";
import { config } from '@/config/config';

export default {
    name: "ConditionCategoryTag",
    props: {
        client: {
            type: [Object, null],
            required: true
        },
        company: {
            type: [Object, null],
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
        conditionCategory(){
            if (this.client || this.company) {
                return "individual";
            }
            else{
                return "general";
            }
        },
        categoricalColour(){
            return config.optionsColouring['conditions'][this.conditionCategory];
        }
    },
    methods:{
        getIcon
    }
}
</script>