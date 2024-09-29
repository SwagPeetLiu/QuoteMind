<template>
    <form 
        class="w-100 was-validated overflow-x-hidden overflow-y-auto thin-scrollbar"
        :class="{'needs-validation': formStatus === 'editing'}"
        name="form"
        novalidate
    >
        <!-- display by sections -->
        <div class="my-2 w-100 d-flex flex-wrap" v-for="(section, index) in sections" :key="index">
            
            <!-- Section title -->
            <p class="w-100 text-gradient text-dark font-weight-bolder text-shadow-md h5 mt-0 mb-2">
                {{ t(`detailedListings.${section}`) }}
            </p>

            <!-- display by attributes -->
            <div 
                v-for="(attribute, index) in detailedListings[section]" 
                :key="index"
                class="w-100 px-2"
            >
                {{ attribute }}
            </div>
            <!-- <hr v-if="sections.length !== 1 && index" class="mt-2 mb-0 horizontal dark" /> -->
            {{ formData }}
        </div>
    </form>
</template>

<script>
import { getIcon } from "@/utils/iconMapper.js";
import { useI18n } from "vue-i18n";
import { config } from "@/config/config";
import instance from "@/api/instance";

export default {
    name: "InfoForm",
    data(){
        const { t } = useI18n({});
        return{
            t,
            isLoading: true,
            formStatus: "display",
            formData: null
        }
    },
    props:{
        target:{
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    },
    computed:{
        detailedListings(){
            return config.detailedListings[this.target];
        },
        sections(){
            return Object.keys(this.detailedListings);
        },
        isDataAvaialble(){
            return this.formData !== null;
        }
    },
    methods:{
        getIcon,
        
        // fetching data based on the provided ID:
        fetchData(){
            this.formData = null;
            this.isLoading = true;
            instance
                .getSpecificEntity({target: this.target, id: this.id})
                .then((response) => {
                    if (response.isCompleted) {
                        this.formData = response.data;
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    this.isLoading= false;
                    this.formStatus = "display";
                });
        }
    },
    mounted(){
        this.fetchData();
    }
}
</script>