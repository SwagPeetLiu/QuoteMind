<template>
    <!-- Modal to display Error Messages-->
    <div class="modal fade zindex-1" id="errorDialog" ref="errorDialog" tabindex="-1" aria-labelledby="errorDialogLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="errorDialogLabel">{{ t("dialog.error title") }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    {{ $store.state.errorMessage }}
                </div>
                <div class="modal-footer">
                    <button 
                        type="button" 
                        class="btn btn-secondary" 
                        data-bs-dismiss="modal" 
                        @click.prevent="$store.commit('setErrorMessage', '')"
                    >
                        {{ t("dialog.close") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import { useI18n } from "vue-i18n";

export default {
    name: "error-dialog",
    setup(){
        const { t } = useI18n();
        return { t };
    },
    methods: {
        showModal() {
            var myModal = new bootstrap.Modal(document.getElementById('errorDialog'), {
                keyboard: false
            });
            myModal.show();
        }
    },
    watch:{
        '$store.state.errorMessage': {
            handler(newValue) {
                if (newValue !== "") {
                    this.showModal();
                }
            }
        }
    }
}
</script>
