<template>
    <div v-if="isDataAvailable" class="d-flex flex-column w-100">
        <AddressFields
            v-for="(address, index) in list"
            :key="index"
            :recordIndex="index"
            :currentRecord="address"
            :isEditing="isEditing"
            :class="['mb-2']"
            @update-address="updateAddress"
        />
    </div>

    <!-- indicator for no data being provided -->
    <div v-if="!isDataAvailable && !isEditing" class="text-gradient text-dark">
        -- {{ t('form.temporarily empty') }} --
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import AddressFields from '@/components/reuseable-components/forms/components/AddressFields.vue';

export default {
    name: "EditableAddresses",
    components: {
        AddressFields
    },
    props:{
        list:{
            type: [Array, null],
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
            originalList: null,
            locations: null,
            validityMap: new Map(),
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
        },
        updateAddress(index, value, isValid){
            if (this.isDataAvailable){
                console.log("received update address", index, value, isValid);
                const newCopy = [...this.list];
                newCopy[index] = value;
                this.validityMap.set(index, isValid);

                // needs to cjheck on the validity of each address here
                const isAnyAddressInvalid = Array.from(this.validityMap.values()).includes(false);
                this.$emit("update-form", "addresses", newCopy, !isAnyAddressInvalid);
            }
        }   
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", "addresses", this.originalList, true);
                return;
            }
            if (newValue === "saving" || newValue === "editing"){
                // direct submission if the input is disabled
                if (this.isDisabled){
                    this.isValid = true;
                    this.$emit("update-form", "addresses", this.originalList, true);
                    return;
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalList = this.list;
            }
        }
    },
    beforeMount(){
        this.originalList = this.list;
        for (let i = 0; i < this.list.length; i++){
            this.validityMap.set(i, true);
        }
    }
}
</script>