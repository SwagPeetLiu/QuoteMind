<template>
    <div class="d-flex flex-column w-100">
        
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
    name: "EditableAddresses",
    props:{
        list:{
            type: [Array, null],
            required: true
        },
        isDisabled: {
            type: Boolean,
            required: true
        },
        isRequired: {
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
            originalList: null
        }
    },
    computed:{
        isDataAvailable(){
            if (!this.list) return false;
            if (Array.isArray(this.list) && this.list.length === 0) return false;
            return true;
        },
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        }
    },
    methods:{
        addAddress(){
            console.log("add address");
        },
        removeAddress(){
            console.log("remove address");
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", this.target, this.originalList, true);
                return;
            }
            if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    this.isValid = true;
                    this.$emit("update-form", this.target, {id: this.originalID, [this.targetName]: this.originalName}, true);
                    return;
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalID = this.id;
                this.originalName = this.name;
            }
        }
    },
    beforeMount(){
        this.originalList = this.list;
    }
}
</script>