<template>
    <SlideUpElement>
        <div class="d-flex flex-wrap w-100" v-if="currentRecord">

            <!-- displaying of the current address record -->
            <div class="w-100" v-if="!isEditing">
                <IconEntity 
                    theme="dark"
                    :icon="getIcon('address')"
                    :name="currentRecord.name"
                    :id="currentRecord.id"
                    :target="'address'" 
                    :class="['ms-n1', 'mt-n1']"
                />
            </div>

            <!-- display of the address details full details when displaying-->
            <p v-if="!isEditing" class="w-100 d-flex flex-wrap text-gradient text-dark mt-1 mb-0">
                <span v-if="currentRecord.address" class="me-1 my-0">{{ currentRecord.address }}</span>
                <span v-if="currentRecord.district" class="me-1 my-0">{{ currentRecord.district }}</span>
                <span v-if="currentRecord.city" class="me-1 my-0">{{ currentRecord.city }}</span>
                <span v-if="currentRecord.state" class="me-1 my-0">{{ currentRecord.state }}</span>
                <span v-if="currentRecord.postal" class="my-0">{{ currentRecord.postal }}</span>
            </p>

            <!-- display of the category of this address -->
            <div v-if="!isEditing && currentRecord.category"
                class="w-100 my-0 me-3 d-flex align-items-center justify-content-end"
            >
                <span 
                    v-for="(type, index) in currentRecord.category"
                    :key="index"
                    class="categorical-badge-sm mx-1 font-weight-bold"
                    :class="`gradient-border-${getCategoricalColour(type)} text-gradient text-${getCategoricalColour(type)}`"
                >
                    {{ type ?
                        t(`multipleOptions.addressCategory.${type}`) :
                        `${t('validation.missing')}${t('columns.category')}`
                    }}
                </span>
            </div>
            <div v-if="!isEditing && !currentRecord.category"
                class="w-100 my-0 d-flex align-items-center justify-content-center text-gradient text-danger">
                <span> {{ `${t('validation.missing')}${t('columns.category')}` }} </span>
            </div>

            <!-- Editing of the address name -->
            <div class="mb-3" style="width: 85%;" v-if="isEditing">
                <EditableInfo
                    :icon="getIcon('name')"
                    :isDisabled="false" 
                    :isRequired="true" 
                    :name="'name'"
                    :value="currentRecord.name ? currentRecord.name : ''" 
                    type="text" 
                    :formStatus="'editing'"
                    @update-form="updateAddressRecord"
                />
            </div>
            <div 
                class="mb-3 d-flex align-items-center justify-content-center"
                v-if="isEditing"
                style="width: 15%;"
            >
                <i
                    class="delete-button text-gradient text-danger text-3xl text-shadow-md"
                    :class="getIcon('delete')"
                    @click="removeAddress"
                >
                </i>
            </div>

            <!-- Editing of the address detail -->
            <div class="w-100 h-100 mb-3" v-if="isEditing">
                <EditableInfo
                    :name="'address'"
                    :icon="getIcon('address')" 
                    :isDisabled="false"
                    :isRequired="true"
                    :value="currentRecord.address ? currentRecord.address : ''"
                    type="text"
                    :formStatus="'editing'"
                    @update-form="updateAddressRecord"
                />
            </div>

            <!-- Editing of the district selections -->
            <div class="h-100 mb-3 pe-1" style="width: 50%;" v-if="isEditing">
                <GeneralDropdown
                    target="district"
                    :currentSelection="currentDistrict ? currentDistrict.name : null"
                    :selectableOptions="selectableDistricts.map((district) => district.name) || null"
                    :isRequired="true"
                    :isDisabled="false"
                    @update-selection="updateAddressRecord"
                />
            </div>

            <!-- Editing of the city selections -->
            <div class="h-100 mb-3" style="width: 50%;" v-if="isEditing && !isCurrentProvinceEqualToCity">
                <GeneralDropdown
                    target="city"
                    :currentSelection="currentCity ? currentCity.name : null"
                    :selectableOptions="selectableCities.map((city) => city.name) || null"
                    :isRequired="true"
                    :isDisabled="false"
                    @update-selection="updateAddressRecord"
                />
            </div>

            <!-- Editing of the state/province selections -->
            <div class="h-100 mb-2" :class="{'pe-1': !isCurrentProvinceEqualToCity}" style="width: 50%;" v-if="isEditing">
                <GeneralDropdown
                    target="state"
                    :currentSelection="currentProvince ? currentProvince.name : null"
                    :selectableOptions="selectableProvinces.map((province) => province.name) || null"
                    :isRequired="true"
                    :isDisabled="false"
                    @update-selection="updateAddressRecord"
                />
            </div>

            <!-- Editing of the postal code selections -->
            <div class="h-100 mb-2" :style="{width: `${isCurrentProvinceEqualToCity ? '100%' : '50%'}`}" v-if="isEditing">
                <EditableInfo
                    :name="'postal'"
                    :icon="getIcon('postal')"
                    :isDisabled="false"
                    :isRequired="true"
                    :value="currentRecord.postal ? currentRecord.postal : '100020'"
                    type="text"
                    :formStatus="'editing'"
                    @update-form="updateAddressRecord"
                />
            </div>

            <!-- display of the category of this address -->
            <div class="w-100 h-100 p-1 d-flex align-items-center justify-content-between" v-if="isEditing">
                <CheckBox
                    v-for="type in categories.keys()"
                    :key="type"
                    :isSelected="categories.get(type)"
                    :target="type"
                    :text="t(`multipleOptions.addressCategory.${type}`)"
                    @update-selection="updateAddressCategory"
                />
            </div>
            <hr v-if="isEditing" class="horizontal dark my-3 w-100" />
        </div>
    </SlideUpElement>
</template>

<script>
import list from 'china-location/dist/location.json';
import ChinaLocation from 'china-location';
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { getIcon } from "@/utils/iconMapper.js";
import { useI18n } from 'vue-i18n';
import EditableInfo from '@/components/reuseable-components/forms/EditableInfo.vue';
import { config } from '@/config/config';
import GeneralDropdown from '@/components/reuseable-components/forms/components/GeneralDropdown.vue';
import SlideUpElement from '@/components/reuseable-components/styler/SlideUpElement.vue';
import CheckBox from '@/components/reuseable-components/forms/components/CheckBox.vue';

export default {
    name: "AddressFields",
    components: {
        IconEntity,
        EditableInfo,
        GeneralDropdown,
        SlideUpElement,
        CheckBox
    },
    props: {
        currentRecord: {
            type: Object,
            required: true
        },
        isEditing: {
            type: Boolean,
            required: true
        }
    },
    data() {
        const { t } = useI18n({});
        const categoriesMap = new Map();
        config.multipleOptions.addressCategory.forEach((category) => {
            categoriesMap.set(category, false);
        })
        return {
            t,
            list,
            location: new ChinaLocation(list),
            validityMap: null,
            categories: categoriesMap,
        }
    },
    computed: {
        selectableProvinces() {
            return this.location.getProvinces();
        },
        selectableCities() {
            return this.location.getCities(this.currentProvince);
        },
        selectableDistricts() {
            return this.location.getDistricts(this.currentCity, this.currentProvince);
        },
        currentProvince() {
            return this.location.getCurrentAddress()["province"];
        },
        currentCity() {
            return this.location.getCurrentAddress()["city"];
        },
        currentDistrict() {
            return this.location.getCurrentAddress()["district"];
        },
        isCurrentProvinceEqualToCity() {
            return this.currentProvince.name == this.currentCity.name;
        },
        currentSelectedCategory() {
            const selectedCategory = [];
            for(const [key, value] of this.categories){
                if (value){
                    selectedCategory.push(key);
                }
            }
            return selectedCategory;
        },
        isAnyFieldInvalid() {
            return Array.from(this.validityMap.values()).includes(false);
        }
    },
    methods: {
        getIcon,
        
        // function used to update the curretn selected address info
        updateAddressRecord(attribute, value, isValid) {
            // if the input is in valid in this case
            this.validityMap.set(attribute, isValid);
            if (!isValid){
                this.$emit(
                    "update-address", 
                    this.currentRecord.id, 
                    { ...this.currentRecord, [attribute]: value }, 
                    isValid
                );
            }
            // if this update of this specific address is valid, 
            // check on all other fields to update the overall validity of this address
            else{
                this.$emit(
                    "update-address", 
                    this.currentRecord.id, 
                    { ...this.currentRecord, [attribute]: value }, 
                    !this.isAnyFieldInvalid
                );
            }

            // systematic updates on the sectors if their superior level is updateed:
            if (attribute === "state") {
                setTimeout(() => {
                    this.updateCity();
                }, 100);
            }
            if (attribute === "city") {
                setTimeout(() => {
                    this.updateDistrict();
                }, 100);
            }
        },
        getCategoricalColour(category) {
            if (category) {
                return config.optionsColouring['addressCategory'][category];
            }
            else {
                return 'danger';
            }
        },

        updateAddressCategory(category, isSelected) {
            this.categories.set(category, isSelected);
            this.updateAddressRecord(
                "category", 
                this.currentSelectedCategory, 
                this.currentSelectedCategory.length > 0);
        },
        updateCity() {
            this.updateAddressRecord(
                "city",
                this.currentCity.name,
                !this.isAnyFieldInvalid
            )
        },
        updateDistrict() {
            this.updateAddressRecord(
                "district",
                this.currentDistrict.name,
                !this.isAnyFieldInvalid
            )
        },

        // function used to remove this specific address:
        removeAddress() {
            this.$emit(
                "update-address", 
                this.currentRecord.id, 
                { ...this.currentRecord, message: "delete" }, 
                true
            );
        },

        // functions to used to set up selections in the Location instance
        setUpProvince() {
            const currentProvince = this.currentRecord.state;
            if (currentProvince) {
                for (let i = 0; i < this.selectableProvinces.length; i++) {
                    if (this.selectableProvinces[i].name == currentProvince) {
                        this.location.changeProvince(this.selectableProvinces[i].code);
                    }
                }
            }
        },
        setUpCities() {
            const currentCity = this.currentRecord.city;
            if (currentCity) {
                for (let i = 0; i < this.selectableCities.length; i++) {
                    if (this.selectableCities[i].name == currentCity) {
                        this.location.changeCity(this.selectableCities[i].code);
                    }
                }
            }
        },
        setUpDistricts() {
            const currentDistrict = this.currentRecord.district;
            if (currentDistrict) {
                for (let i = 0; i < this.selectableDistricts.length; i++) {
                    if (this.selectableDistricts[i].name == currentDistrict) {
                        this.location.changeDistrict(this.selectableDistricts[i].code);
                    }
                }
            }
        },

    },
    mounted() {
        this.setUpProvince();
        this.setUpCities();
        this.setUpDistricts();

        // if an existing record of address is provided, set up the validity map as all true
        if (this.currentRecord.id && this.currentRecord.name) {
            this.validityMap = new Map();
            Object.keys(this.currentRecord).forEach((key) => {
                this.validityMap.set(key, true);
            });
            
            // udpate the categories:
            if (Array.isArray(this.currentRecord.category)) {
                this.currentRecord.category.forEach((category) => {
                    this.categories.set(category, true);
                });
            }
        }
        // if a new record is being attached, merely set up a skeleton
        else{
            this.validityMap = new Map();
            const newRecord = {...this.currentRecord, country: "中国"};

            config.detailedListings.address.general.forEach((attribute) => {
                this.validityMap.set(attribute, true);
                if (attribute === "district") {
                    newRecord[attribute] = this.currentDistrict.name;
                }
                else if (attribute === "city") {
                    newRecord[attribute] = this.currentCity.name;
                }
                else if (attribute === "state") {
                    newRecord[attribute] = this.currentProvince.name;
                }
                else if (attribute === "category") {
                    newRecord[attribute] = config.multipleOptions.addressCategory[0];
                    this.categories.set(config.multipleOptions.addressCategory[0], true);
                }
                else if (attribute === "postal") {
                    newRecord[attribute] = "100020"; // default postcode in Beijing Chaoyang
                }
                // else it requires an user input
                else{
                    newRecord[attribute] = "";
                    this.validityMap.set(attribute, false);
                }
            });
            this.$emit("update-address", this.currentRecord.id, newRecord, false);
        }
    },
    watch: {
        currentRecord: {
            handler() {
                this.setUpProvince();
                this.setUpCities();
                this.setUpDistricts();
            },
            deep: true
        }
    }
}
</script>