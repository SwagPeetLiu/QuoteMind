<template>
    <div class="card" style="min-height: 120px; max-height: 220px">
        <div class="row mx-1 flex-grow-1 my-2">

            <!-- multi search panel -->
            <div class="col-5 py-2">
                <div class="h-50 mb-2 d-flex align-items-center">
                    <div 
                        ref="targetDropdownContainer" class="target-dropdown h-100 w-70" :class="[`bg-gradient-${$store.state.themeColor}`, isSlideOut ? 'toggle-open' : 'toggle-closed']">
                        <div class="target-toggle d-flex align-items-center justify-content-center" @click="toggleDropdown()">
                            <i class="ms-auto me-2" :class="[currentSelection.icon, `text-gradient text-${$store.state.themeColor}`]"></i>
                            <span class="text-gradient text-dark font-weight-bold">{{ t(`columns.${currentSelection.name}`) }}</span>
                            <i class="fa-solid fa-caret-down ms-auto me-2 toggle-arrow"></i>
                        </div>
                        <ul class="target-menu">
                            <li 
                                v-for="item in targets" 
                                :key="item.name" 
                                class="target-item d-flex align-items-center justify-content-center my-2"
                                @click="selectTarget(item.name)"
                            >
                                <i :class="[item.icon, `ms-n3 my-1 text-gradient text-${$store.state.themeColor}`]"></i>
                                <p class="ms-2 my-1">{{ t(`columns.${item.name}`) }}</p>
                            </li>
                        </ul>
                    </div>
                    <button 
                        class="w-30 h-100 btn bg-gradient-dark my-0 ms-2 d-flex align-items-center justify-content-center"
                    >
                        <i class="me-2 my-0" :class="getIcon('add')"></i>
                        <span>{{ t("apiMessage.search.add filter") }}</span>
                    </button>
                </div>

                <!-- mapping different types of inputs for users to control the serach mechanism -->
                <div v-if="currentSearchType === 'text'" class="w-100 h-50 position-relative search-text-input">
                    <input 
                        v-model="searchValue.textValue"
                        class="overfllow-hidden w-100 h-100 px-2" 
                        type="text" 
                        :placeholder="`${t('apiMessage.search.search')}${t(`columns.${currentSelection.name}`)}`"
                    />
                    <i :class="getIcon('search enter')" class="position-absolute ms-n4 mt-3" style="rotate: 90deg;"></i>
                </div>
                <div v-else class="w-100 h-50 px-4">
                    <RangedCalendar />
                </div>
            </div>

            <!-- current searched conditions (where clause) -->
            <div class="col-7 pt-2 px-2">
                <div class="w-100 h-100 border-3 border-secondary position-relative" style="border-style: dotted;">
                    <div class="bg-gradient-dark h-100 w-100 position-absolute z-1" style="opacity: 0.15;"></div>
                    <div v-if="isWhereClausePresents" class="d-flex align-items-start justify-content-start p-3 z-n1">
                        <p class="text-gradient text-dark font-weight-bold ms-2 z-2"></p>
                    </div>
                    <div v-else class="z-n1 bg-transparent w-100 h-100 d-flex align-items-center justify-content-center">
                        <p class="my-0 z-2 h6 font-weight-bold text-gradient text-dark">{{ t("apiMessage.search.add your filter") }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import RangedCalendar from "@/components/statistical-components/RangedCalendar.vue";

export default {
    name: "SearchController",
    props:{
        target: {
            type: String,
            required: true
        }
    },
    components: {
        RangedCalendar
    },
    data(){
        const { t } = useI18n({});
        return {
            t: t,
            currentTarget: "id",
            targets: [],
            inputTerm: { value : "" },
            existingWhereClauses: [],
            isSlideOut: false,
            toggleListener: null,
            searchValue: {textValue: "", dateRange: {start: null, end: null}},
        }
    },
    methods:{
        getIcon: getIcon,
        handleClickOutside(event) {
            if (this.isSlideOut && !this.$refs.targetDropdownContainer.contains(event.target)) {
                this.isSlideOut = false;
                document.removeEventListener('click', this.handleClickOutside, true);
            }
        },
        toggleDropdown(){
            this.isSlideOut = !this.isSlideOut;
            if (this.isSlideOut) {
                document.addEventListener('click', this.handleClickOutside, true);
            } else {
                document.removeEventListener('click', this.handleClickOutside, true);
            }
        },
        selectTarget(target){
            this.currentTarget = target;
            this.toggleDropdown();
        },
        mapSelections(){
            const currentLanguage = this.$store.getters.getLanguage;
            const relatedTargets = 
                Object.values(this.$store.state.dbReferences).map((ref) => ref)
                .filter((ref) => ref.table === this.target && ref.column !== `${currentLanguage == "en" ? "ch" : "en"}_name`);

            // mapping all the searchable attributes
            const unsortedArray = relatedTargets.map(attribute => {
                return {
                    name: attribute.column,
                    type: attribute.type,
                    icon: getIcon(attribute.column)
                }
            });

            // sort arbitrarily by name:
            this.targets = unsortedArray.sort((a, b) => {
                return this.arbitraryOrder.indexOf(a.name) - this.arbitraryOrder.indexOf(b.name);
            });

            // give out an default selection:
            if (this.targets.length > 0) {
                const nameBasedAttributes = this.targets.filter((attribute) => {
                    return attribute.name.includes('name');
                });
                if (nameBasedAttributes.length > 0) {
                    this.currentTarget = nameBasedAttributes[0].name;
                }
                else{
                    this.currentTarget = this.targets[0].name;
                }
            }
        }
    },
    computed:{
        currentSearchType(){
            console.log(this.currentSelection);
            if (this.currentSelection.type == "uuid" || 
                this.currentSelection.type.includes("character") ||
                this.currentSelection.type.includes("USER-DEFINED") ||
                this.currentSelection.type.includes("ARRAY") ||
                this.currentSelection.type.includes("integer") ||
                this.currentSelection.type.includes("numeric")
            ) {
                return "text";
            }
            else if (this.currentSelection.type.includes("timestamp")) {
                return "timestamp";
            }
            else{
                return "text";
            }
        },
        currentSelection(){
            return this.targets.filter(item => item.name === this.currentTarget)[0];
        },
        arbitraryOrder(){
            switch (this.target){
                case "clients":
                    return ["id", "full_name", "phone", "qq_contact", "wechat_contact", "email", "company"];
                case "companies":
                    return ['id', "full_name", "phone", "email"];
                case "employees":
                    return ["id", "name", "phone", "wechat_contact", "qq_contact", "position", "email"];
                case "materials":
                    return ["id", "ch_name", "en_name"];
                case "positions":
                    return ["id", "name"];
                case "pricing_conditions":
                    return ["id", "product", "quantity", "materials", "size", "client", "company", "colour", "size_unit"];
                case "pricing_rules":
                    return ["id", "price_per_unit"];
                case "products":
                    return ["id", "ch_name", "en_name"];
                case "transactions":
                    return ["id", "name", "status", "transaction_date", "product", "materials", "client", "company", "quantity", "price_per_unit", "amount", "colour", "size","size_unit", "length", "width", "height", "employee", "modified_date", "creation_date", "note"];
                default:
                    return [];
            }
        },
        isWhereClausePresents(){
            return this.existingWhereClauses.length > 0;
        }
    },
    beforeMount() {
        this.mapSelections();
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }
};
</script>