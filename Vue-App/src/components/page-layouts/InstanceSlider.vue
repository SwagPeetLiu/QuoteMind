<template>
    <div
        class="fixed-plugin"
        ref="InstanceSliderContainer"
        :class="{ 'show': this.$store.state.showInstanceSlider.display }"
    >

        <!-- Instance display Card -->
        <div class="shadow-lg card blur">
            <div class="pt-3 pb-0 bg-transparent card-header">
                Header
            </div>
            <div class="pt-0 card-body pt-sm-3">
                {{ this.$store.state.showInstanceSlider.id }}
                {{ this.$store.state.showInstanceSlider.target }}
            </div>
            
        </div>
    </div>
</template>

<script>
export default {
    name: "InstanceSlider",
    methods:{
        // function used to close the instance slider:
        closeInstanceSlider() {
            this.$store.commit("toggleInstanceSlider", { display: false, id: null, target: null });
            document.removeEventListener('click', this.handleClickOutside, true);
        },
        // function used to handle clicks outside
        handleClickOutside(event) {
            if (this.$store.state.showInstanceSlider.display === true &&
                this.$refs.InstanceSliderContainer &&
                !this.$refs.InstanceSliderContainer.contains(event.target) &&
                this.$store.getters.haveNoDialogs === true
            ) {
                this.closeInstanceSlider();
            }
        },
        addOutsideClickListener() {
            setTimeout(() => {
                document.addEventListener('click', this.handleClickOutside, true);
            }, 100);
        },
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    },
    watch: {
        '$store.state.showInstanceSlider': {
            handler(newValue) {
                if (newValue.display) {
                    this.$nextTick(() => {
                        this.addOutsideClickListener();
                    });
                }
            },
            deep: true
        }
    },
}
</script>