<template>
    <div class="card" style="min-height: 120px; max-height: 220px">
        <div class="row mx-2 flex-grow-1 my-2">

            <!-- multi search panel -->
            <div class="col-4 py-2">
                <div class="h-50 mb-2 d-flex align-items-center">
                    <div 
                        ref="targetDropdownContainer" class="target-dropdown h-100 w-70" :class="[`bg-gradient-${$store.state.themeColor}`, isSlideOut ? 'toggle-open' : 'toggle-closed']">
                        <div class="target-toggle d-flex align-items-center justify-content-center" @click="toggleDropdown()">
                            <i class="ms-auto me-2" :class="[currentSelection.icon, `text-gradient text-${$store.state.themeColor}`]"></i>
                            <span class="text-gradient text-dark font-weight-bold">{{ currentSelection.name }}</span>
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
                                <p class="ms-2 my-1">{{ item.name }}</p>
                            </li>
                        </ul>
                    </div>
                    <button class="w-30 h-100 btn bg-gradient-dark my-0 ms-2">Add Serach Term</button>
                </div>
                <input class="w-100 h-50 border border-secondary border-2 rounded px-2 overfllow-hidden" />

            </div>

            <!-- current searched conditions (where clause) -->
            <div class="col-8 pt-2 px-2">
                <div class="border border-2 border-dark rounded h-100">border border-2 border-darkrounded</div>
            </div>
        </div>
    </div>

</template>

<script>
import { useI18n } from "vue-i18n";
export default {
    name: "SearchController",
    data(){
        const { t } = useI18n({});
        return {
            t: t,
            currentTarget: "name",
            targets: [
                {name: "name", type: "string", icon: "fa-solid fa-user"},
                {name: "email", type: "string", icon: "fa-solid fa-envelope"},
                {name: "phone", type: "string", icon: "fa-solid fa-phone"},
            ],
            inputTerm: { value : "" },
            existingWhereClauses: [],
            isSlideOut: false,
            toggleListener: null
        }
    },
    methods:{
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
        }
    },
    computed:{
        currentSelection(){
            return this.targets.filter(item => item.name === this.currentTarget)[0];
        }
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }
};
</script>