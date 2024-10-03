<template>
    <div clas="w-100">

        <!-- Current Selected Reference -->
        <IconEntity
            v-if="isDataAvailable && !isEditing"
            :icon="icon"
            :name="isTargetCategorical ? t(`multipleOptions.position.${name}`) : name"
            :id="id"
            :theme="'dark'"
            :target="target"
            :class="['ms-n1', 'mt-n1']"
        />

        <!-- Editable Reference as an dropdown search -->
        <div 
            class="reference-dropdown" 
            :class="[isSlideOut ? 'toggle-open' : 'toggle-closed']" 
            v-if="isEditing"
        >
            <button 
                class="btn reference-toggle" 
                ref="referenceToggle"
                @click.prevent="toggleDropdown()"
                :disabled="isDisabled"
            >
                <span 
                    class="current-selection-indicator text-gradient text-dark"
                    :class="[isDataAvailable ? 'font-weight-bold': '']"
                >
                    {{ isDataAvailable ? 
                        `${isTargetCategorical ? t(`multipleOptions.position.${name}`) : name}` 
                        : t('form.select')
                    }}
                </span>
                <i class="ms-auto toggle-arrow" :class="getIcon('down arrow')"></i>
            </button>

            <div v-if="isSlideOut" class="reference-menu d-flex flex-column" ref="referenceMenu">
                <div class="reference-input d-flex align-items-center"> 
                    <i class="ms-2 me-2" :class="getIcon('search')"></i>
                    <input @input="onInputSearch" class="flex-grow-1" type="text" v-model="searchValue"/>
                </div>
                <ul v-if="!isInitialisedLoading & isReferenceListingsAvailable" class="reference-list thin-scrollbar overflow-x-hidden overflow-y-auto mt-2">
                    <li
                        v-for="reference in referenceListings"
                        :key="reference.id"
                        class="reference-item my-1 py-1 ms-n2 d-flex align-items-center justify-content-center"
                        @click="selectReference(reference)"
                    >
                        <span clas="text-dark"> {{ 
                            isTargetCategorical ? t(`multipleOptions.position.${reference[targetName]}`) : 
                            reference[targetName] }} 
                        </span>
                    </li>
                </ul>

                <!-- indicator for no data matchings -->
                <div v-if="!isInitialisedLoading & !isReferenceListingsAvailable" class="w-100 h-100 d-flex justify-content-center align-items-center">
                    <span>{{ t('stats.no data available') }}</span>
                </div>

                <!-- loading indicator for initialised loadings -->
                <div v-if="isInitialisedLoading" class="w-100 h-100 d-flex justify-content-center align-items-center">
                    <Spinner v-if="isInitialisedLoading" :size="1.1" class="spinner-border"/>
                </div>
            </div>
        </div>

        <!-- indicator or no current selections -->
        <p class="text-dark text-gradient font-weight-bold mt-n2" v-if="!isDataAvailable && !isEditing">
            -- {{ t('form.temporarily empty') }} --
        </p>
    </div>
</template>

<script>
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n';
import serach from "@/api/search";
import { getIcon } from "@/utils/iconMapper.js";
import { getRecordName } from "@/utils/helpers";
import { generateSearchQueryWhereClause, mapDropdownSearchListingBody } from "@/utils/formatters";
import Spinner from "@/components/reuseable-components/loader/Spinner.vue";

export default {
    name: "EditableReference",
    components:{
        IconEntity,
        Spinner
    },
    props:{
        icon: {
            type: String,
            required : true,
            default: "fa-solid fa-user",
        },
        id:{
            type: [String, null],
            required: true
        },
        name: {
            type: [String, null],
            required: true
        },
        target: {
            type: String,
            required: true
        },
        formStatus: {
            type: String,
            required: true
        },
        isRequired:{
            type: Boolean,
            default: false
        },
        isDisabled:{
            type: Boolean,
            default: false
        },
    },
    data(){
        const { t } = useI18n({});
        return{
            t,
            originalID: "",
            originalName: "",
            validationTips: "",
            searchValue: "",
            referenceListings: null,
            isSlideOut: false,
            isInitialisedLoading: true,
            isScrolledLoading: false,
            totalCount: null,
            currentPage: null
        }
    },
    computed:{
        isDataAvailable(){
            return this.id && this.name;
        },
        isReferenceListingsAvailable() {
            if (!this.referenceListings) {
                return false;
            }
            return Array.isArray(this.referenceListings) && this.referenceListings.length > 0;
        },
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        },
        targetName(){
            return getRecordName(this.target, this.$i18n.locale);
        },
        isTargetCategorical(){
            return this.target === "position"; // later expand to an centralised control if needed
        },
        whereClauses(){
            if (this.searchValue === "" || !this.searchValue.trim()){
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
    methods:{
        getIcon,
        getRecordName,
        // function used to obtain the references given the current name searches
        fetchReferences(type){
            if (!this.isDisabled){
                if (type == "initialise") {
                    this.totalCount = null;
                    this.currentPage = null;
                    this.isInitialisedLoading = true;
                    this.isScrolledLoading = false;
                }
                else{
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
                            else{
                                setTimeout(() => {
                                    this.isScrolledLoading = false;
                                    this.referenceListings.push(...response.results);
                                    this.currentPage = this.currentPage + 1;
                                },this.$store.state.loadingDelay);
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
                            },this.$store.state.loadingDelay);
                        }
                    });
            }
        },

        // toggle the dropdown on searches
        toggleDropdown(){
            this.isSlideOut = !this.isSlideOut;
            if (this.isSlideOut) {
                this.fetchReferences("initialise");
            }
            // clear out the current serach mechanisms and records
            else{
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
        onInputSearch: debounce(function(){
            this.fetchReferences("initialise");
        }, 800),

        // function used to select an listing reference:
        selectReference(reference){
            this.isSlideOut = false;
            this.$emit("update-form", this.target, reference, true);
        },

        // function used to handle Clicks outside
        handleClickOutside(event){
            if (this.isSlideOut && 
                this.$refs.referenceMenu &&
                !this.$refs.referenceMenu.contains(event.target) &&
                this.$refs.referenceToggle && 
                !this.$refs.referenceToggle.contains(event.target)
            ) {
                this.isSlideOut = false;
            }
        },

    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.$emit("update-form", this.target, {id: this.originalID, [this.targetName]: this.originalName}, true);
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
        },
        isSlideOut(newValue){
            if (newValue) {
                document.addEventListener('click', this.handleClickOutside, true);
            }
            else{
                document.removeEventListener('click', this.handleClickOutside, true);
            }
        }
    },
    beforeMount() {
        this.originalID = this.id;
        this.originalName = this.name;
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    },
}
</script>