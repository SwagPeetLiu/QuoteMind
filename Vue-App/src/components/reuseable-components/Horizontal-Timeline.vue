<template>
    <div class="d-flex flex-column justify-content-between align-items-center" :style="`height: ${height}px`">
        <!-- timeline demonstrations on events -->
        <div class="steps-container mt-1 mb-5">
            <div 
                v-for="(item, index) in data" 
                :key="index" 
                class="step-item"
            >
                <div 
                    class="step-icon-wrapper"
                    @mouseenter="updateDescription(false, item.description)"
                    @mouseleave="updateDescription(true, '')"
                >
                    <div :class="`bg-gradient-${item.color}`"
                        class="step-icon border border-white border-radius-lg d-flex justify-content-center align-items-center">
                        <FadeInElement>
                            <i :class="item.icon" class="text-white text-sm"></i>
                        </FadeInElement>
                    </div>
                </div>
                <p class="step-title text-sm font-weight-bold">{{ item.title }}</p>
                <div v-if="index !== data.length - 1" class="hr-line"></div>
            </div>
        </div>

        <SlideUpElement v-if="eventDescription.isDefault">
            <p class="h5">
                <span>
                    {{ title }}
                </span>
                <router-link :class="{'ms-2': isCurrentLanEnglish }" :to="link.path" style="text-decoration: underline;">
                    {{ link.text }}
                </router-link>
            </p>
        </SlideUpElement>

        <!-- Descriptions on the events if clicked -->
        <SlideUpElement v-else>
            <p class="h6">
                {{ eventDescription.descriptions }}
            </p>
        </SlideUpElement>
    </div>
</template>

<script>
import SlideUpElement from '@/components/reuseable-components/SlideUpElement.vue';
import FadeInElement from '@/components/reuseable-components/FadeInElement.vue';
export default {
    components:{
        SlideUpElement,
        FadeInElement
    },
    props: {
        title:{
            type: String,
            required: true
        },
        link:{
            type: Object,
            required: true
        },
        data: {
            type: Array,
            required: true
        },
        height: {
            type: Number,
            default: 100
        }
    },
    data(){
        return {
            eventDescription: { isDefault: true, descriptions: "" }
        }
    },
    computed:{
        isCurrentLanEnglish(){
            return this.$store.getters.getLanguage === "en";
        }
    },
    methods:{
        updateDescription(isDefault, descriptions){
            this.eventDescription = { isDefault: isDefault, descriptions: descriptions }
        }
    }
}
</script>
