<template>
    <div class="w-100">
        <!-- Displaying mode -->
        <div class="w-100 d-flex justify-content-start align-items-center">
            <!-- label -->
            <div class="d-flex align-items-center my-0">
                <i class="me-2 text-gradient text-dark" :class="getIcon(target)"></i>
                <p 
                    class="me-2 my-0 font-weight-bold text-dark input-label text-lg"
                    :style="{marginLeft : `${target === 'transaction_date' ? '2px' : '0px'}`}"
                >
                    {{ t(`columns.${target}`) }}
                    <span v-if="isEditing && isRequired && !isDisabled" class="text-danger ms-n1">*</span>
                    <span v-if="!isEditing" class="ms-n1">:</span>
                </p>
            </div>

            <!-- current value -->
            <LoadInText
                v-if="!isEditing"
                :inputClass="`${isDateAvailable ? 'text-dark' : 'text-danger'} my-0`"
                :style="{paddingTop: 0}"
                :text="`${isDateAvailable ? currentDateString : t('validation.missing')}`"
                :spaceWidth="7"
            />
        </div>

        <!-- Editing mode -->
        <div class="w-100" v-if="isEditing">
            <Datepicker 
                v-model="inputDate" 
                :enable-time-picker="false"
                auto-apply
                :format="isCurrentLanEnglish ? dateFormat.en : dateFormat.ch"
                :locale="isCurrentLanEnglish ? locales.en : locales.ch"
                :max-date="maxDate" 
                :year-range="yearRange"
                :key="$i18n.locale"
                :class="[$store.state.themeColor]"
                :placeholder="`${t('apiMessage.search.select')}${t(`columns.${target}`)}`"
                :disabled="isDisabled"
            />
        </div>
    </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import { formatDate } from '@/utils/helpers';
import LoadInText from '@/components/reuseable-components/text/LoadInText.vue';
import { getIcon } from "@/utils/iconMapper.js";

export default {
    name: "EditableDate",
    props: {
        target:{
            type: String,
            required: true
        },
        date:{
            type: [String, null],
            required: true
        },
        formStatus: {
            type: String,
            required: true
        },
        isRequired: {
            type: Boolean,
            required: true,
        },
        isDisabled:{
            type: Boolean,
            required: true
        }
    },
    components: {
        Datepicker,
        LoadInText
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            originalDate: null,
            inputDate: this.date ? new Date(this.date) : null,
            dateFormat: config.date.format, // display format
            locales: config.date.locales // locale on date calender pickers
        }
    },
    computed:{
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        isCurrentLanEnglish(){
            return this.$store.getters.getLanguage === "en";
        },
        isDateAvailable(){
            return this.date !== null;
        },
        maxDate(){
            return new Date();
        },
        yearRange() {
            const currentYear = new Date().getFullYear();
            return [currentYear - config.limitations.MAX_YEAR_RELEVANCY, currentYear];
        },
        currentDateString(){
            if (this.isDateAvailable){
                return formatDate(new Date(this.date), this.$i18n.locale);
            }
            else{
                return null;
            }
        }
    },
    methods:{
        getIcon
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.inputDate = this.originalDate ? new Date(this.originalDate) : null;
                return this.$emit("update-form", this.target, this.originalDate, true);
            }
            if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    return this.$emit("update-form", this.target, this.originalDate, true);
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalDate = this.date;
            }
        },
        inputDate:{
            handler(newValue){
                if (newValue === null && this.isRequired){
                    return this.$emit('update-form', this.target, null, false);
                }
                else{
                    return this.$emit('update-form', this.target, newValue ? newValue.toISOString() : null, true);
                }
            },
            deep: true
        }
    },
    beforeMount(){
        this.originalDate = this.date;
    }
}
</script>