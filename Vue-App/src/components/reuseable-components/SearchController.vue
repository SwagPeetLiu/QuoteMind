<template>
    <div class="card" style="height: fit-content;">
        <div class="row mx-1 flex-grow-1 my-2">

            <!-- multi search panel -->
            <div class="col-12 col-xl-6 col-xxl-5 py-2">
                <div class="h-50 mb-2 d-flex align-items-center" style="max-height: 45px">
                    <div 
                        ref="targetDropdownContainer" class="target-dropdown h-100 w-80" :class="[`bg-gradient-${$store.state.themeColor}`, isSlideOut ? 'toggle-open' : 'toggle-closed']">
                        <div class="target-toggle d-flex align-items-center justify-content-center" @click="toggleDropdown()">
                            <i class="ms-auto me-2" :class="[currentSelection.icon, `text-gradient text-${$store.state.themeColor}`]"></i>
                            <span class="text-gradient text-dark font-weight-bold">{{ t(`columns.${currentSelection.name}`) }}</span>
                            <i class="fa-solid fa-caret-down ms-auto me-2 toggle-arrow"></i>
                        </div>
                        <ul v-if="isSlideOut" class="target-menu thin-scrollbar">
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

                    <!-- button to add on a new filter -->
                    <button 
                        class="w-20 h-100 btn bg-gradient-dark my-0 ms-2 d-flex align-items-center justify-content-center"
                        :disabled="!isSearchInputValid"
                        @click="addFilter()"
                    >
                        <i class="me-sm-2 my-0" :class="getIcon('add')"></i>
                        <span class="d-none d-sm-block">{{ t("apiMessage.search.add filter") }}</span>
                    </button>
                </div>

                <!-- mapping different types of inputs for users to control the serach mechanism -->
                <SearchTextInput 
                    class="w-100 h-50"
                    v-if="currentSearchType !== 'timestamp'" 
                    :target="currentSelection.name"
                    @update-search-value="setSearchValue"
                    @enter-key-pressed="addFilter()"
                    :clearingInput="clearInput"
                />

                <div v-else class="w-100 h-50 px-sm-4">
                    <RangedCalendar 
                        :target="currentSelection.name"
                        @update-search-value="setSearchValue"
                        :clearingInput="clearInput"
                    />
                </div>
            </div>

            <!-- current searched conditions (where clause) -->
            <div class="col-12 col-xl-6 col-xxl-7 pt-2 px-2 h-100">
                <FilterArea 
                    :inputClauses="existingInputs"
                    @update-clauses="filterClauses"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { getIcon } from "@/utils/iconMapper.js";
import SearchTextInput from "@/components/reuseable-components/SearchTextInput.vue";
import RangedCalendar from "@/components/statistical-components/RangedCalendar.vue";
import FilterArea from "@/components/statistical-components/FilterArea.vue";
import { config } from "@/config/config";

export default {
    name: "SearchController",
    props:{
        target: { // table name
            type: String,
            required: true
        }
    },
    components: {
        RangedCalendar,
        SearchTextInput,
        FilterArea
    },
    data(){
        const { t } = useI18n({});
        let parsedInputs = [];
        const queryString = this.$route.query.filters;
        if (queryString) {
            try {
                parsedInputs = JSON.parse(decodeURIComponent(queryString));
            } catch (error) {
                console.error("Error parsing URL parameters:", error);
            }
        }
        return {
            t: t,
            currentTarget: "id",
            targets: [],
            existingInputs: parsedInputs,
            isSlideOut: false,
            toggleListener: null, // handling clicks outside
            searchValue: {value: null, type: null, isValid: false},
            clearInput: false
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
            this.clearInput = this.currentSelection.type.includes("timestamp") ? false : true; // no need to clear it if it's a time based switch
            this.searchValue = {value: null, type: null, isValid: false};
            this.toggleDropdown();
            setTimeout(() => {
                this.clearInput = false;
            }, 100);
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
        },
        // manages the current search value upon input changes
        setSearchValue(target, value, isValid){
            if (target === this.currentSelection.name) {
                this.searchValue = {value: value, type: this.currentSelection.type, isValid: isValid};
            }
        },
        // pushing in the value of a new filter for filtration Area to deal with
        addFilter(){
            // only adding the filter if the input is valid (handles children's enter signals)
            if (this.searchValue.isValid){
                this.clearInput = true;
                this.existingInputs.push({...this.searchValue, target: this.currentSelection.name});
                this.searchValue = {value: null, type: null, isValid: false};
                setTimeout(() => {
                    this.clearInput = false;
                }, 100);
            }
        },
        // manages the input updates from children component (filter calibrations)
        filterClauses(modifiedInputs){
            this.existingInputs = modifiedInputs;
        },

        //URL management upon filtration changes
        parseUrlParams() {
            const queryString = this.$route.query.filters;
            if (queryString) {
                try {
                    this.existingInputs = JSON.parse(decodeURIComponent(queryString));
                } catch (error) {
                    console.error("Error parsing URL parameters:", error);
                    this.existingInputs = [];
                }
            } else {
                this.existingInputs = [];
            }
        },
        updateUrlParams() {
            if (this.existingInputs.length > 0) {
                const queryString = encodeURIComponent(JSON.stringify(this.existingInputs));
                this.$router.push({ query: { filters: queryString } }).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            } 
            else {
                this.$router.replace({ query: {} }).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            }
        }
    },
    computed:{
        currentSearchType(){
            if (this.currentSelection.type == "uuid" || 
                this.currentSelection.type.includes("character") ||
                this.currentSelection.type.includes("ARRAY")
            ) {
                return "text";
            }
            else if (this.currentSelection.name=="status"){
                return "categorical";
            }
            else if (this.currentSelection.type.includes("integer") ||
                    this.currentSelection.type.includes("numeric")
            ) {
                return "number"; 
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
            return config.arbitraryAttributeOrder[this.target];
        },
        isSearchInputValid(){
            if (this.searchValue.isValid) {
                return true;
            }
            else{
                return false;
            }
        }
    },
    created(){
        this.mapSelections();
        this.parseUrlParams();
        window.addEventListener('popstate', this.parseUrlParams); // on back & forward re-parse the query
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
        window.removeEventListener('popstate', this.parseUrlParams);
    },
    watch:{
        existingInputs:{
            handler(){
                this.updateUrlParams();
            },
            deep: true
        }
    }
};
</script>