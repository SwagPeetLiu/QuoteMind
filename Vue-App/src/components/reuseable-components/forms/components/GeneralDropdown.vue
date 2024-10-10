<template>
    <div class="reference-dropdown w-100" :class="[isSlideOut ? 'toggle-open' : '']">
        
        <!-- Categorical toggle -->
        <button 
            class="reference-toggle"
            ref="generalToggle"
            @click.prevent="toggleDropdown()"
            :disabled="isDisabled"
        >
            <p 
                class="text-gradient text-dark d-flex align-items-center my-0 text-sm"
                :class="[currentSelection ? `font-weight-bolder` : '']"
            >
                <span>
                    {{ currentSelection ?
                        currentSelection
                        : t('form.select')
                    }}
                </span>
                <!-- <i v-if="currentSelection" :class="getIcon('cancel')"
                    class="clear-button cursor-pointer ms-2 text-sm" @click.stop.prevent="clearReference()">
                </i> -->
            </p>

            <!-- indicator for required at least one reference -->
            <i v-if="!currentSelection && isRequired" class="ms-auto text-gradient text-danger"
                :class="getIcon('info')"></i>

            <!-- toggle arrow -->
            <i v-else class="ms-auto toggle-arrow" :class="getIcon('down arrow')"></i>
        </button>

        <!-- categorical list -->
        <div 
            class="reference-menu d-flex flex-column"
            ref="generalMenu"
        >
            <div class="reference-input d-flex align-items-center">
                <i class="ms-2 me-2" :class="[getIcon('search'), `text-${$store.state.themeColor}`]"></i>
                <input @input="onInputSearch" class="flex-grow-1" type="text" v-model="searchValue" />
            </div>

            <ul v-if="filteredOptions"
                class="reference-list thin-scrollbar overflow-x-hidden overflow-y-auto mt-2">

                <!-- categorical record -->
                <li 
                    v-for="option in filteredOptions" :key="option"
                    class="reference-item my-1 py-1 ms-n3 d-flex align-items-center justify-content-center"
                    @click="selectReference(option)"
                >
                    <span clas="text-dark text-gradient text-shadow-sm text-sm">
                        {{ option }}
                    </span>
                </li>
            </ul>

            <!-- indicator for no data matchings -->
            <div v-if="!filteredOptions" class="w-100 h-100 d-flex justify-content-center align-items-center">
                <span>{{ t('stats.no data available') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { getIcon } from "@/utils/iconMapper.js";

export default {
    name: "GeneralDropdown",
    props: {
        target:{
            type: String,
            required: true
        },
        currentSelection: {
            type: [String, null],
            required: true
        },
        selectableOptions: {
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
        }
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            isSlideOut: false,
            originalSelection: null,
            searchValue: "",
        }
    },
    methods:{
        getIcon,

        // toggle the dropdown on searches
        toggleDropdown() {
            this.isSlideOut = !this.isSlideOut;
        },

        // update the selection to the parent:
        selectReference(option) {
            this.$emit("update-selection", this.target, option, true);
            this.isSlideOut = false;
        },
    },
    computed: {
        filteredOptions() {
            console.log(this.searchValue) ;
            if (this.searchValue == "" || !this.searchValue.trim()) {
                return this.selectableOptions;
            }
            else{
                return this.selectableOptions.filter(option => {
                    return option.toLowerCase().includes(this.searchValue.toLowerCase());
                });
            }
        }    
    },
    mounted() {
        if (!this.currentSelection && this.selectableOptions) {
            // update the current selection
            console.log("needs to update")
        }
    }
}
</script>