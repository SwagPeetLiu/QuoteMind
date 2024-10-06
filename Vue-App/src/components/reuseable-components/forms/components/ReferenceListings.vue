<template>
    <div class="ms-n2 w-100 d-flex flex-wrap align-items-center references-container mb-2">
        <div
            v-for="(reference, index) in currentSelection"
            :key="index"
            class="ms-2 mt-2 d-flex align-items-center"
            :class="[isEditing ? `bg-gradient-${$store.state.themeColor} editing` : '']"
        >
            <i class="me-1 my-0" :class="[getIcon(target), `text-${isEditing ? 'white' : 'dark'}`]"></i>
            <p 
                class="my-0"
                :class="[`text-${isEditing ? 'white' : 'dark'}`]"
            >
                {{ reference[targetName] }}
        
            </p>
            <i
                v-if="isEditing"
                @click.stop.prevent="removeReference(reference.id)" 
                class="ms-2 me-1 my-0" 
                :class="[getIcon('cancel'),`text-${isEditing ? 'white' : 'dark'}`]"
            >
            </i>
        </div>
    </div>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";

export default {
    name: "ReferenceListings",
    props: {
        isEditing: {
            type: Boolean,
            required: true
        },
        target:{
            type: String,
            required: true
        },
        currentSelection: { //assume the Array selection is provided to render this component
            type: Array,
            required: true
        },
        targetName:{
            type: String,
            required: true
        }
    },
    methods:{
        getIcon,
        removeReference(id){
            this.$emit('remove-reference', id);
        }
    }
}
</script>