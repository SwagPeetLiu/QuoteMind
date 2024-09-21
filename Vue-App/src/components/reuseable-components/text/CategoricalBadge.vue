<template>
    <div 
        class="categorical-badge"
        :class="`gradient-border-${categoricalColour}`"
    >   
        <span 
            class="text-gradient h6 my-0"
            :class="`text-${categoricalColour}`"
        >
            {{ t(`multipleOptions.${target}.${mappedCategory}`) }}
        </span>
    </div>
</template>

<script>
import { getRecordName } from '@/utils/helpers';
import { config } from '@/config/config';
import { useI18n } from 'vue-i18n';
export default {
    name: "CategoricalBadge",
    props: {
        target:{
            type: String, // attribute name
            required: true
        },
        category: {
            type: [String, Object],
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
        mappedCategory(){
            try{
                if(typeof this.category === "string"){
                    return this.category
                }
                else{
                    return this.category[getRecordName(this.target, this.$i18n.locale)];                //return this.category[getRecordName(this.target, this.$i18n.locale)]
                }
            }
            catch(err){
                console.log(err);
                return "ERROR";
            }
        },
        categoricalColour(){
            if (this.mappedCategory === "ERROR") {
                return 'danger';
            }
            else{
                return config.optionsColouring[this.target][this.mappedCategory];
            }
        }
    }
}
</script>
