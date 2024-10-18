<template>
    <div class="w-100">

        <!-- client details -->
        <p 
            v-if="(!isEditing && client) || isEditing"
            class="text-gradient text-dark"
            style="margin-bottom: 5px;"
        >
            {{ t('columns.client') }}:
        </p>
        <EditableReference
            v-if="(!isEditing && client) || isEditing"
            :icon="getIcon('client')"
            target="client"
            :id="client ? client.id : null"
            :name = "client ? client[getRecordName('client', $i18n.locale)] : null"
            :isDisabled="mapDisabled('client', $i18n.locale)"
            :isRequired="mapMandatory('client')"
            :formStatus="formStatus"
            @update-form="updateIndividualCondition"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />
        
        <!-- company details -->
        <p 
            class="text-gradient text-dark"
            style="margin-bottom: 5px;"
            v-if="(!isEditing && company) || isEditing"
        >
            {{ t('columns.company') }}:
        </p>
        <EditableReference
            v-if="(!isEditing && company) || isEditing"
            :icon="getIcon('company')"
            target="company"
            :id="company ? company.id : null"
            :name = "company ? company[getRecordName('company', $i18n.locale)] : null"
            :isDisabled="mapDisabled('company', $i18n.locale)"
            :isRequired="mapMandatory('company')"
            :formStatus="formStatus"
            @update-form="updateIndividualCondition"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />

        <!-- indicator if no data is provided -->
        <div class="w-100 d-flex justify-content-center my-2" v-if="!isDataAvailable && !isEditing">
            -- {{ t('form.temporarily empty') }} --
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import EditableReference from '@/components/reuseable-components/forms/EditableReference.vue';
import { getIcon } from "@/utils/iconMapper.js";
import { mapMandatory, mapDisabled, getRecordName } from '@/utils/helpers';

export default {
    name: "EditableClientCondition",
    props: {
        client:{
            type: [Object, null],
            required: true
        },
        company:{
            type: [Object, null],
            required: true
        },
        formStatus: {
            type: String,
            required: true
        }
    },
    components:{
        EditableReference
    },
    data(){
        const { t } = useI18n({});
        return {
            t,
            originalClient: null,
            originalCompany: null
        }
    },
    computed:{
        isDataAvailable(){
            if(this.client || this.company){
                return true;
            }
            return false;
        },
        isEditing(){
            return this.formStatus == "editing" || this.formStatus == "saving";
        }
    },
    methods:{
        getIcon,
        mapMandatory,
        mapDisabled,
        getRecordName,
        revertoOriginal(){
            this.$emit("update-form", "company", this.originalCompany, true);
            this.$emit("update-form", "client", this.originalClient, true);
        },
        updateIndividualCondition(target, value, isValid){
            this.$emit("update-form", target, value, isValid);
        }
    },
    watch:{
        formStatus(newValue, oldValue){
            // allow cancelling when the form is in editing mode
            if (newValue === "cancel"){
                this.revertoOriginal();
                return;
            }
            // direct submission if the input is disabled
            if (newValue === "saving" || newValue === "editing"){
                if (this.isDisabled){
                    this.revertoOriginal();
                    return;
                }
            }
            // upon successful udpates, update its original value
            if (newValue === "display" &&  oldValue === "saving"){
                this.originalClient = this.client;
                this.originalCompany = this.company;
            }
        },
    },
    beforeMount(){
        this.originalClient = this.client;
        this.originalCompany = this.company;
    }
}
</script>