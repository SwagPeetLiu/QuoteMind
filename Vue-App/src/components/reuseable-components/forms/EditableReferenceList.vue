<template>
    <div class="w-100 mt-n2">
        <!-- displaying mode of currently selected references -->
        <ReferenceListings
            v-if="isDataAvailable"
            :isEditing="isEditing"
            :target="target"
            :currentSelection="list"
            :targetName="targetName"
            @remove-reference="removeReference"
        />

        <!-- editing mode of reference listings -->
        <ReferenceDropdown
            v-if="isEditing"
            type="multiple"
            :currentSelection="list"
            :target="target"
            :isDisabled="isDisabled"
            :isRequired="isRequired"
            :targetName="targetName"
            @select-reference="selectReference"
            @remove-reference="removeReference"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />

        <!-- indicator or no current selections -->
        <p class="text-dark text-gradient font-weight-bold mt-n2" v-if="!isDataAvailable && !isEditing">
            -- {{ t('form.temporarily empty') }} --
        </p>
    </div>
</template>

<script>
import { getRecordName } from "@/utils/helpers";
import { useI18n } from "vue-i18n";
import ReferenceListings from "@/components/reuseable-components/forms/components/ReferenceListings.vue";
import ReferenceDropdown from "@/components/reuseable-components/forms/components/ReferenceDropdown.vue";

export default {
    name: "EditableReferenceList",
    components:{
        ReferenceListings,
        ReferenceDropdown
    },
    props:{
        list:{
            type: [Array, null],
            required: true
        },
        target:{ // reference table name
            type: String,
            required: true
        },
        isRequired: {
            type: Boolean,
            required: true
        },
        isDisabled: {
            type: Boolean,
            required: true
        },
        formStatus: {
            type: String,
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            orignalList: null,
        }
    },
    methods:{
        // function used to select an listing reference:
        selectReference(reference){
            if (this.isDataAvailable){
                this.$emit("update-form", this.target, [...this.list, reference], true);
            }
            else{
                this.$emit("update-form", this.target, [reference], true);
            }
        },
        removeReference(id){
            const currentList = this.list.filter(item => item.id !== id);

            // if no items are provided, then return null accordingly
            if (currentList.length === 0){
                this.$emit("update-form", this.target, null, this.isRequired ? false : true);
            }
            else{
                this.$emit("update-form", this.target, currentList, true);
            }
        }
    },
    computed: {
        isDataAvailable() {
            if (!this.list) return false;
            if (Array.isArray(this.list) && this.list.length === 0) return false;
            return true;
        },
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        targetName(){
            return getRecordName(this.target, this.$i18n.locale);
        },
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", this.target, this.orignalList, true);
                return;
            }
            if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    this.isValid = true;
                    this.$emit("update-form", this.target, this.orignalList, true);
                    return;
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.orignalList = this.list;
            }
        }
    },
    beforeMount() {
        this.orignalList = this.list;
    },
}
</script>