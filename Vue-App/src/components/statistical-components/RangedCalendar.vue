<template>
    <div class="d-flex align-items-center justify-content-between position-relative">
        <Datepicker v-model="range.start" :enable-time-picker="false" auto-apply
            :format="isCurrentLanEnglish ? dateFormat.en : dateFormat.ch"
            :locale="isCurrentLanEnglish ? locales.en : locales.ch" 
            :year-range="yearRange"
            :min-date="minStartDate"
            :max-date="maxStartDate" 
            :key="$i18n.locale"
            :class="[$store.state.themeColor]"
            :placeholder="`${t('apiMessage.search.select')}${t('stats.time.start')}${t(`columns.${target}`)}`"
        />
        <i class="mx-4 d-flex h5 my-0" :class="getIcon('between')"></i>
        <Datepicker 
            v-model="range.end" 
            :enable-time-picker="false" 
            auto-apply
            :format="isCurrentLanEnglish ? dateFormat.en : dateFormat.ch"
            :locale="isCurrentLanEnglish ? locales.en : locales.ch" 
            :year-range="yearRange" 
            :key="$i18n.locale" 
            :min-date="minEndDate"
            :max-date="maxEndDate"
            :class="[$store.state.themeColor]"
            :placeholder="`${t('apiMessage.search.select')}${t('stats.time.end')}${t(`columns.${target}`)}`"
        /> 
    </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { generateDateRange } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
import { config } from "@/config/config";
import { useI18n } from 'vue-i18n';
import { useValidators } from '@/utils/useValidators';
const { mapValidation } = useValidators();

export default {
    name: "RangedCalendar",
    props:{
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
    components: {
        Datepicker
    },
    data() {
        const {t} = useI18n({});
        // mapp for the last 3 month by default
        const { startDate, endDate } = generateDateRange("quarter");
        this.$emit('update-search-value', this.target, { start: startDate, end: endDate }, true);
        return {
            t,
            range: {
                start: startDate,
                end: endDate
            },
            dateFormat: { en: 'yyyy-MM-dd', ch: 'yyyy年MM月dd日' },
            locales: {
                en: "en-US",
                ch: "zh-CN"
            }
        };
    },
    computed: {
        isCurrentLanEnglish() {
            return this.$store.getters.getLanguage === "en";
        },
        yearRange() {
            const currentYear = new Date().getFullYear();
            return [currentYear - config.limitations.MAX_YEAR_RELEVANCY, currentYear];
        },
        minStartDate() {
            const date = new Date();
            date.setFullYear(date.getFullYear() - config.limitations.MAX_YEAR_RELEVANCY);
            return date;
        },
        maxStartDate() {
            if (this.range.end) {
                const date = new Date(this.range.end);
                date.setDate(date.getDate() - 1);
                return date;
            }
            return new Date(); // default to today
        },
        minEndDate() {
            if (this.range.start) {
                const date = new Date(this.range.start);
                date.setDate(date.getDate() + 1);
                return date;
            }
            else{ // if no start date it can end by any date
                const date = new Date();
                date.setFullYear(date.getFullYear() - config.limitations.MAX_YEAR_RELEVANCY);
                return date;
            }
        },
        maxEndDate() {
            return new Date(); // Today at maximum
        }
    },
    methods: {
        getIcon,
    },
    watch: {
        range: {
            handler(newValue) {
                const inputValidation = mapValidation("rangedDateInput", newValue);
                this.$emit('update-search-value', this.target, newValue, inputValidation.valid);
            },
            deep: true
        },
        target(newValue) {
            const inputValidation = mapValidation("rangedDateInput", this.range);
            this.$emit('update-search-value', newValue, this.range, inputValidation.valid);
        },
        clearingInput(newValue) {
            if (newValue) {
                this.range = {
                    start: null,
                    end: null
                }
            }
        }
    }
}
</script>