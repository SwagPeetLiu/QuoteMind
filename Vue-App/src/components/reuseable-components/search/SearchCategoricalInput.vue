<template>
    <div class="px-4 h-100 d-flex align-items-center justify-content-center">
        <div 
            v-for="(choice, index) in availableOptions" 
            :key="index"
            class="form-check mx-6"
        >
            <input class="form-check-input" type="checkbox" id="flexCheckDefault" v-model="selectedOptions[choice]">
            <label class="form-check-label text-gradient text-dark h6 my-0" for="flexCheckDefault">
                {{ t(`multipleOptions.${target}.${choice}`) }}
            </label>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();

export default {
    name: "SearchCategoricalInput",
    props:{
        target:{
            type: String,
            required: true
        },
        clearingInput:{
            type: Boolean,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            selectedOptions: {}
        }
    },
    computed:{
        availableOptions(){
            return config.multipleOptions[this.target];
        }
    },
    created(){
        for (const option of this.availableOptions){
            this.selectedOptions[option] = false;
        }
    },
    watch:{
        selectedOptions:{
            handler(newValue){
                const inputValidation = mapValidation(this.target, newValue);
                this.$emit('update-search-value', this.target, {...newValue}, inputValidation.valid);
            },
            deep: true
        },
        clearingInput(newValue){
            if (newValue == true){
                for (const option of this.availableOptions){
                    this.selectedOptions[option] = false;
                }
            }
        }
    }
}
</script>