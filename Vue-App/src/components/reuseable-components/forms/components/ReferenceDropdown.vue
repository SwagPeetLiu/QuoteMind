<template>
    <div class="reference-dropdown mb-2" :class="[isSlideOut ? 'toggle-open' : '']">

        <!-- reference toggle -->
        <button 
            class="reference-toggle"
            ref="referenceToggle"
            @click.prevent="toggleDropdown()"
            :disabled="isDisabled"
        >
            <p 
                class="text-gradient text-dark d-flex align-items-center my-0"
                :class="[isSelectionConfirmed ? `font-weight-bolder` : '']"
            >
                <span>
                    {{ isSelectionConfirmed ?
                        `${isTargetCategorical ? t(`multipleOptions.position.${currentSelection.name}`) :
                            currentSelection.name}`
                        : t('form.select')
                    }}
                </span>
                <i v-if="isSelectionConfirmed" :class="getIcon('cancel')"
                    class="clear-button cursor-pointer ms-2 text-sm" @click.stop.prevent="clearReference()">
                </i>
            </p>

            <!-- indicator for required at least one reference -->
            <i v-if="!isSelectionConfirmed && isRequired && !currentSelection" class="ms-auto text-gradient text-danger"
                :class="getIcon('info')"></i>

            <!-- toggle arrow -->
            <i v-else class="ms-auto toggle-arrow" :class="getIcon('down arrow')"></i>
        </button>

        <!-- reference menu -->
        <div 
            class="reference-menu d-flex flex-column"
            ref="referenceMenu"
        >
            <div class="reference-input d-flex align-items-center">
                <i class="ms-2 me-2" :class="[getIcon('search'), `text-${$store.state.themeColor}`]"></i>
                <input @input="onInputSearch" class="flex-grow-1" type="text" v-model="searchValue" />
            </div>

            <ul v-if="!isInitialisedLoading & isReferenceListingsAvailable"
                class="reference-list thin-scrollbar overflow-x-hidden overflow-y-auto mt-2">

                <!-- reference record -->
                <li 
                    v-for="reference in referenceListings" :key="reference.id"
                    class="reference-item my-1 py-1 ms-n2 d-flex align-items-center justify-content-center"
                    @click="selectReference(reference)"
                >
                    <!-- multiple choice style for multiple dropdown styles -->
                    <div
                        v-if="type === 'multiple'"
                        type="checkbox" 
                        class="tick-box shadow-lg"
                        :class="[isReferenceSelected(reference.id)? `checked bg-gradient-${$store.state.themeColor}` : '']"
                    >
                        <i v-if="isReferenceSelected(reference.id)" :class="getIcon('tick')" class="text-white text-sm"></i>
                    </div>
                    <span clas="text-dark text-gradient text-shadow-md">
                        {{ isTargetCategorical ? 
                            t(`multipleOptions.position.${reference[targetName]}`) :
                            reference[targetName] 
                        }}
                    </span>
                </li>
            </ul>

            <!-- indicator for no data matchings -->
            <div v-if="!isInitialisedLoading & !isReferenceListingsAvailable"
                class="w-100 h-100 d-flex justify-content-center align-items-center">
                <span>{{ t('stats.no data available') }}</span>
            </div>

            <!-- loading indicator for initialised loadings -->
            <div v-if="isInitialisedLoading" class="w-100 h-100 d-flex justify-content-center align-items-center">
                <Spinner v-if="isInitialisedLoading" :size="1.1" class="spinner-border" />
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
import { getIcon } from "@/utils/iconMapper.js";
import serach from "@/api/search";
import { generateSearchQueryWhereClause, mapDropdownSearchListingBody } from "@/utils/formatters";
import Spinner from "@/components/reuseable-components/loader/Spinner.vue";
import { config } from "@/config/config";

export default {
    name: "ReferenceDropdown",
    data() {
        const { t } = useI18n();
        return {
            t,
            searchValue: "",
            referenceListings: null,
            isSlideOut: false,
            isInitialisedLoading: true,
            isScrolledLoading: false,
            totalCount: null,
            currentPage: null
        }
    },
    components: {
        Spinner,
    },
    props: {
        type: { // single or multiple references
            type: String,
            required: true
        },
        currentSelection: {
            type: [Object, Array, null],
            required: true
        },
        target: {
            type: String,
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
        targetName: {
            type: String,
            required: true
        },
        isTargetCategorical: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        isReferenceListingsAvailable() {
            if (!this.referenceListings) {
                return false;
            }
            return Array.isArray(this.referenceListings) && this.referenceListings.length > 0;
        },
        isSelectionConfirmed() {
            if (!this.currentSelection) { // if no selection is provided
                return false;
            }
            // if selection is provideed for single type, then it is true
            if (this.currentSelection.id && this.currentSelection.name && this.type === "single") {
                return true;
            }
            // if the dropdown type is multiple, users can always select more
            if (this.type === "multiple") {
                return false;
            }
            return false;
        },
        whereClauses() {
            if (this.searchValue === "" || !this.searchValue.trim()) {
                return null;
            }
            const conditions = {
                [this.targetName]: {
                    type: "characters",
                    values: [this.searchValue]
                }
            };
            const connectors = new Map();
            connectors.set(this.targetName, "or");
            return generateSearchQueryWhereClause(conditions, connectors);
        }
    },
    methods: {
        getIcon,
        // function used to obtain the references given the current name searches
        fetchReferences(type) {
            if (!this.isDisabled) {
                if (type == "initialise") {
                    this.totalCount = null;
                    this.currentPage = null;
                    this.isInitialisedLoading = true;
                    this.isScrolledLoading = false;
                }
                else {
                    this.isScrolledLoading = true;
                }

                const searchBody = mapDropdownSearchListingBody(
                    this.whereClauses,
                    this.targetName,
                    this.currentPage === null ? null : this.currentPage + 1,
                    this.target);

                serach.getSearchResults(searchBody)
                    .then(res => {
                        if (res.isCompleted) {
                            const response = res.data;

                            // upon initialisations
                            if (type == "initialise") {
                                this.currentPage = 1;
                                this.totalCount = response.count;
                                this.referenceListings = response.results;
                            }
                            // upon scrols loadin successfully
                            else {
                                setTimeout(() => {
                                    this.isScrolledLoading = false;
                                    this.referenceListings.push(...response.results);
                                    this.currentPage = this.currentPage + 1;
                                }, config.UI.loadingDelay);
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        if (type == "initialise") {
                            setTimeout(() => {
                                this.isInitialisedLoading = false;
                            }, config.UI.loadingDelay);
                        }
                    });
            }
        },

        // toggle the dropdown on searches
        toggleDropdown() {
            this.isSlideOut = !this.isSlideOut;
            if (this.isSlideOut) {
                this.fetchReferences("initialise");

                // calculate the need to scroll to such position:
                const sliderForm = document.querySelector(".slider-form");
                if (sliderForm && this.$refs.referenceMenu) {

                    setTimeout(() => {
                        const menuRect = this.$refs.referenceMenu.getBoundingClientRect();
                        const toggleRect = this.$refs.referenceToggle.getBoundingClientRect();
                        const wavyHeaderHeight = 140;
                        const ExtraSpace = 60;

                        // removing the header height, current scroll relative to the view port
                        const scrollingAmount = menuRect.y - sliderForm.scrollTop - toggleRect.height - wavyHeaderHeight - ExtraSpace;
                        this.$emit("scroll-down", scrollingAmount);
                    }, config.UI.scrollDebounce);
                }
            }
            // clear out the current serach mechanisms and records
            else {
                this.searchValue = "",
                    this.referenceListings = null,
                    this.isSlideOut = false,
                    this.isInitialisedLoading = true,
                    this.isScrolledLoading = false,
                    this.totalCount = null,
                    this.currentPage = null;
            }
        },

        // function used to manage when the user input a new search value:
        onInputSearch: debounce(function () {
            this.fetchReferences("initialise");
        }, config.UI.textDebouce),

        // function used to select an listing reference:
        selectReference(reference) {
            // only close if user can select only one reference
            if (this.type === "single") {
                this.isSlideOut = false;
                this.$emit("select-reference", reference);
            }
            // toggling style for multiple choice dropdowns
            else{
                if (this.isReferenceSelected(reference.id)) {
                    this.$emit("remove-reference", reference.id);
                }
                else{
                    this.$emit("select-reference", reference);
                }
            }
        },
        clearReference() {
            this.$emit("clear-reference");
        },

        // function used to handle Clicks outside
        handleClickOutside(event) {
            if (this.isSlideOut &&
                this.$refs.referenceMenu &&
                !this.$refs.referenceMenu.contains(event.target) &&
                this.$refs.referenceToggle &&
                !this.$refs.referenceToggle.contains(event.target)
            ) {
                this.isSlideOut = false;
            }
        },

        // function used to determine whether an id has been selected under multiple type:
        isReferenceSelected(referenceId) {
            if (this.currentSelection && this.type === "multiple") {
                if (this.currentSelection.length > 0) {
                    for (let i = 0; i < this.currentSelection.length; i++) {
                        if (this.currentSelection[i].id === referenceId) {
                            if ('message' in this.currentSelection[i]) {
                                return this.currentSelection[i].message === "add";
                            }
                            else{
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            return false;
        }
    },
    watch: {
        isSlideOut(newValue) {
            if (newValue) {
                document.addEventListener('click', this.handleClickOutside, true);
            }
            else {
                document.removeEventListener('click', this.handleClickOutside, true);
            }
        }
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    },
}
</script>