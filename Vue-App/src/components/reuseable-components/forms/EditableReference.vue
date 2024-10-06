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

        <!-- reference dropdown -->
        <ReferenceDropdown
            v-if="isEditing"
            type="single"
            :currentSelection="{name: name, id: id}"
            :target="target"
            :isDisabled="isDisabled"
            :isRequired="isRequired"
            :targetName="targetName"
            :isTargetCategorical="isTargetCategorical"
            @select-reference="selectReference"
            @clear-reference="clearReference"
            @scroll-down="(distance) => $emit('scroll-down', distance)"
        />

        <!-- indicator or no current selections -->
        <p class="text-dark text-gradient font-weight-bold mt-n2" v-if="!isDataAvailable && !isEditing">
            -- {{ t('form.temporarily empty') }} --
        </p>
    </div>
</template>

<script>
import IconEntity from "@/components/reuseable-components/tables/IconEntity.vue";
import { useI18n } from 'vue-i18n';
import { getRecordName } from "@/utils/helpers";
import ReferenceDropdown from "@/components/reuseable-components/forms/components/ReferenceDropdown.vue";

export default {
    name: "EditableReference",
    components:{
        IconEntity,
        ReferenceDropdown
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
        }
    },
    computed:{
        isDataAvailable(){
            return this.id && this.name;
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
    },
    methods:{
        // function used to select an listing reference:
        selectReference(reference){
            this.$emit("update-form", this.target, reference, true);
        },
        clearReference(){
            this.$emit("update-form", this.target, null, this.isRequired ? false : true);
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
        }
    },
    beforeMount() {
        this.originalID = this.id;
        this.originalName = this.name;
    },
}
</script>