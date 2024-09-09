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
        /> 
    </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { generateDateRange } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
import { config } from "@/config/config";

export default {
    name: "RangedCalendar",
    components: {
        Datepicker
    },
    data() {
        const { startDate, endDate } = generateDateRange("year");
        return {
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
            return new Date(); // Default to today if no start date is selected
        },
        maxEndDate() {
            return new Date(); // Today
        }
    },
    methods: {
        getIcon,
    },
    watch: {
        range: {
            handler(newVal) {
                console.log(newVal);
            },
            deep: true
        }
    }
};
</script>