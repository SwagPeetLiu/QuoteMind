<template>
    <div v-if="isDataAvailable" class="d-flex flex-column w-100">
        <div
            v-for="address in list"
            class="mb-2"
            :key="address.id"
        >
            <!-- visualise every new address or address that user is updating -->
            <AddressFields
                v-if="address == null || address.message !== 'delete'"
                :currentRecord="address"
                :isEditing="isEditing"
                :class="['mb-2']"
                @update-address="updateAddress"
                @scroll-down="(distance) => $emit('scroll-down', distance)"
            />
        </div>
    </div>

    <!-- indicator on adding more addresses (regardless how many address there is)-->
    <div v-if="isEditing" class=" mt-n2 w-100 d-flex justify-content-start" @click.stop.prevent="addAddress">
        <button class="px-5 btn bg-gradient-dark d-flex align-items-center justify-content-center">
            <i class="me-2 my-0" :class="getIcon('add')"></i>
            <span>{{ `${t('form.add')}${t('others.space')}${t('routes.address')}` }}</span>
        </button>
    </div>

    <!-- indicator for no data being provided -->
    <div 
        v-if="!isDataAvailable && !isEditing"
        class="text-gradient text-dark w-100 my-2 d-flex justify-content-center"
    >
        -- {{ t('form.temporarily empty') }} --
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import AddressFields from '@/components/reuseable-components/forms/components/AddressFields.vue';
import { getIcon } from '@/utils/iconMapper.js';

export default {
    name: "EditableAddresses",
    components: {
        AddressFields
    },
    emits: ['update-form', 'scroll-down'],
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
        },
        isAnyAddressInvalid(){
            return Array.from(this.validityMap.values()).includes(false);
        }
    },
    methods:{
        getIcon,
        addAddress(){
            let newId = "";
            let newCopy = [];
            if (this.isDataAvailable){
                const existingNewAddresses = this.list.filter((address) => address.id.includes("new"));
                newId = "new" + (existingNewAddresses.length + 1);
                newCopy = [...this.list, {id: newId, message: "add"}];
            }
            else{
                newId = "new1";
                newCopy = [{id: newId, message: "add"}];
            }

            // update the validity map
            this.validityMap.set(newId, false);

            // update the list:
            this.$emit(
                "update-form",
                "addresses", 
                newCopy,
                !this.isAnyAddressInvalid
            );
        },
        updateAddress(id, value, isValid){
            if (this.isDataAvailable){
                const newCopy = [];

                this.list.forEach((address) => {
                    if (address.id === id){
                        if (address.id.includes("new") && value.message=="delete"){
                            this.validityMap.delete(address.id);
                            return; // If it's a new address being deleted, skip it
                        }
                        else{
                            this.validityMap.set(address.id, isValid);
                            newCopy.push(value); // update the records accordingly
                        }
                    }
                    // keeping the record of the other addresses
                    else newCopy.push({...address});
                });

                // needs to check on the validity of each address here
                this.$emit("update-form", "addresses", newCopy, !this.isAnyAddressInvalid);
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
        if(this.isDataAvailable){
            this.originalList = this.list.map((address) => ({...address, message: "update"}));

            // initialise an message
            this.$emit(
                "update-form",
                "addresses", 
                this.originalList, 
                true
            );

            // map a validity map
            this.list.forEach((address) => {
                this.validityMap.set(address.id, true);
            });
        }
    }
}
</script>