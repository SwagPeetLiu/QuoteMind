<template>
    <div class="d-flex flex-wrap w-100" v-if="currentRecord">
        <!-- displaying of the ID & category -->
        <div class="w-100">
            <IconEntity
                v-if="!isEditing"
                theme="dark"
                :icon="getIcon('address')"
                :name="'newaddress'"
                :id="currentRecord.id"
                :target="'address'"
            />

            <EditableInfo
                v-else
                :icon="getIcon('name')"
                :isDisabled="false"
                :isRequired="true"
                :value="'newaddress'"
                type="text"
                :formStatus="'editing'"
                @update-form="updateAddressRecord"
            />
        </div>

        <!-- display of the address details -->
        <div class="d-flex align-items-center justify-content-between w-100 my-1">
            
            <!-- street and number details -->
            <div class="w-80 h-100 my-0 text-wrap text-dark text-gradient text-shadow-sm">
                <p v-if="!isEditing">{{ currentRecord.address ? currentRecord.address : "" }}</p>
                <EditableInfo
                    v-else
                    :icon="getIcon('address')"
                    :isDisabled="false"
                    :isRequired="true"
                    :value="currentRecord.address"
                    type="text"
                    :formStatus="'editing'"
                    @update-form="updateAddressRecord"
                />
            </div>
            
            <div class="w-20 h-100 my-0 bg-dark">
                sss
            </div>
        </div>
        <!-- displays of the district -->

        <!-- display of the city -->

        <!-- display of the state/province -->

        <!-- display of the postcode -->
        
        <!-- display of the category of this address -->
        
    </div>
</template>

<script>
import list from 'china-location/dist/location.json';
import ChinaLocation from 'china-location';
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { getIcon } from "@/utiles/iconMapper.js";
import { useI18n } from 'vue-i18n';
import EditableInfo from '@/components/reuseable-components/forms/EditableInfo.vue';

export default{
    name: "AddressFields",
    components: {
        IconEntity,
        EditableInfo
    },
    props:{
        currentRecord:{
            type: [Object, null],
            required: true
        },
        isEditing:{
            type: Boolean,
            required: true
        },
        isRequired: {
            type: Boolean,
            required: true
        },
        currentRecord:{
            type: [Object, null],
            required: true
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            list,
            location: new ChinaLocation(list),
            fullAddress: null,
        }
    },
    computed:{
        selectableProvinces(){
            return this.location.getProvinces();
        },
        selectableCities(){
            return this.location.getCities(this.currentProvince);
        },
        selectableDistricts(){
            return this.location.getDistricts(this.currentCity, this.currentProvince);
        },
        currentProvince(){
            return this.location.getCurrentAddress()["province"];
        },
        currentCity(){
            return this.location.getCurrentAddress()["city"];
        },
        currentDistrict(){
            return this.location.getCurrentAddress()["district"];
        }
    },
    methods:{
        getIcon,

        // function used to update the curretn selected address info
        updateAddressRecord(attribute, value, isValid){
            if (isValid){
                this.fullAddress[attribute] = value;
                //this.$emit("update-form", attribute, this.fullAddress, isValid);
            }
        }
    },
    beforeMount(){
        // used to set up the current addresses
        this.fullAddress = {
            name: "北京市公安局朝阳分居酒仙桥派出所",
            address: "酒仙桥路30号",
            district: "朝阳区",
            city: "北京市",
            province: "北京市",
            postcode: "100123",
        };
    }
}
</script>