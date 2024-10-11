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
                // if this reference is currently in the list, update the message
                const updatedList = [];
                let added = false;
                this.list.forEach((item) => {
                    // if message already exists for the reference, update the message if there is a match
                    if ('message' in item){
                        if (item.id === reference.id){
                            added = true;
                            updatedList.push({...item, message: "add"});
                        }
                        else{
                            updatedList.push(item);
                        }
                    }
                    // if no message exists for the reference, add the message (Initialised list)
                    else{
                        updatedList.push({...item, message: "add"});
                    }
                });
                if (!added){
                    updatedList.push({...reference, message: "add"});
                }
                this.$emit("update-form", this.target, updatedList, true);
            }
            else{
                this.$emit("update-form", this.target, [{...reference, message: "add"}], true);
            }
        },
        removeReference(id){
            if (!this.isDataAvailable) return;
            const currentList = this.list.map((item) => {
                if (item.id === id){
                    return {...item, message: "delete"};
                }
                else{
                    return item;
                }
            });
            this.$emit("update-form", this.target, currentList, true);
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
                    this.$emit(
                        "update-form", 
                        this.target, 
                        this.orignalList,
                        true
                    );
                    return;
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                if (this.isDataAvailable){
                    const ogList = [];
                    this.list.forEach((item) => {
                        if ('message' in item){
                            if (item.message === "add"){
                                ogList.push({id: item.id, [this.targetName]: item[this.targetName]});
                            }
                        }
                        else{
                            ogList.push(item);
                        }
                    });
                    this.orignalList = ogList;
                }
                else{
                    this.orignalList = null;
                }
            }
        }
    },
    beforeMount() {
        // initialise the update message if there is already references provided
        if (this.isDataAvailable){
            this.orignalList = this.list.map((item) => ({...item, message: "add"}));
            this.$emit("update-form", this.target, this.orignalList, true);
        }
    },
}
</script>