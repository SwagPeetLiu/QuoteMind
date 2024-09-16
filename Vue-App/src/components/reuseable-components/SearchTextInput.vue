<template>
    <div class="position-relative search-text-input">
        <input 
            v-model="textValue" 
            class="overfllow-hidden w-100 h-100 px-2" 
            type="text"
            :placeholder="`${t('apiMessage.search.search')}${t(`columns.${target}`)}`"
            @keyup.enter="handleEnterKey"
        />
        <i :class="getIcon('search enter')" class="position-absolute ms-n4 mt-3" style="rotate: 90deg;"></i>
    </div>
</template>

<script>
import { getIcon } from '@/utils/iconMapper.js';
import { useI18n } from 'vue-i18n';
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();

export default {
    name: 'SearchTextInput',
    props: {
        searchValue:{
            type: String,
            required: false,
            default: "",
        },
        target:{
            type: String,
            required: true
        },
        clearingInput:{
            type: Boolean,
            required: false,
            default: false
        }
    },
    data(){
        const {t} = useI18n();
        return {
            t,
            textValue: this.searchValue
        }
    },
    methods:{
        getIcon: getIcon,
        handleEnterKey(){
            this.$emit('enter-key-pressed', "emitted");
        }
    },
    watch: {
        textValue(newValue){
            const inputValidation = mapValidation("textInput", newValue);
            this.$emit('update-search-value', this.target, newValue, inputValidation.valid);
        },
        clearingInput(newValue){
            if(newValue == true){
                this.textValue = "";
            }
        }
    }
}
</script>