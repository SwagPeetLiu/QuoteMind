<template>
    <div 
        class="d-flex align-items-center mx-2 cursor-pointer"
        @click="toggleSelection"
    >
        <div 
            class="tick-box shadow-lg"
            :class="[isSelected ? `checked bg-gradient-${$store.state.themeColor}` : '']"
        >
            <i 
                v-if="isSelected" 
                :class="getIcon('tick')"
                class="text-white text-sm"
            >
            </i>
        </div>
        <span clas="text-dark text-gradient text-shadow-md">
            {{ text }}
        </span>
    </div>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";
export default {
    name: "CheckBox",
    props: {
        isSelected: {
            type: Boolean,
            Required: true
        },
        text:{
            type: String,
            required: true
        },
        target:{
            type: String,
            required: true
        }
    },
    methods:{
        getIcon,
        toggleSelection(){
            this.$emit("update-selection", this.target, !this.isSelected);
        }
    }
}
</script>