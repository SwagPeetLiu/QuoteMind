<template>
    <div class="d-flex align-items-center justify-content-between calendar-container">

        <VCalendar 
            v-model="range.start" 
            mode="date" 
            :masks="masks" 
            :color="mapCalendarColor($store.state.themeColor)"
            title-position="left"
            expanded
        >
            <template v-slot="{ inputValue, inputEvents, isDragging }">
                <div class="d-flex align-items-center justify-content-center flex-grow-1 bg-gray-100 border rounded">
                    <i class="me-3 text-secondary h6 my-0" :class="getIcon('calendar')"></i>
                    <input :class="isDragging ? 'text-gray-600' : 'text-dark'" :value="inputValue"
                        v-on="inputEvents" />
                </div>
            </template>
        </VCalendar>

        <i class="mx-4 d-flex h5 my-0" :class="getIcon('between')"></i>
        
        <VCalendar 
            v-model="range.end"
            mode="date"
            :masks="masks"
            :color="mapCalendarColor($store.state.themeColor)"
            title-position="left"
            expanded
        >
            <template v-slot="{ inputValue, inputEvents, isDragging }">
                <div class="d-flex align-items-center justify-content-center flex-grow-1 bg-gray-100 border rounded">
                    <i class="me-3 text-secondary h6 my-0" :class="getIcon('calendar')"></i>
                    <input :class="isDragging ? 'text-gray-600' : 'text-dark'" :value="inputValue"
                        v-on="inputEvents" />
                </div>
            </template>
        </VCalendar>
    </div>
</template>

<script>
import VCalendar  from 'v-calendar';
import 'v-calendar/dist/style.css';
import { generateDateRange } from "@/utils/helpers";
import { getIcon } from "@/utils/iconMapper.js";
import { useI18n } from 'vue-i18n';
import { mapThemedCalendarColor } from "@/utils/helpers";

export default {
    name: "RangedCalendar",
    components: {
        VCalendar 
    },
    data() {
        const { startDate, endDate } = generateDateRange("year");
        const { t } = useI18n({});
        return {
            masks: {
                input: 'YYYY-MM-DD'
            },
            range: {
                start: startDate,
                end: endDate
            },
            t: t
        }
    },
    methods: {
        getIcon: getIcon,
        mapCalendarColor: (color) => {
            return mapThemedCalendarColor(color);
        }
    }
}
</script>