<template>
    <div class="dropdown" ref="language-select">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="languageDropdownButton"
            data-bs-toggle="dropdown" aria-expanded="false" @click="initializeLanguagePopper">
            {{ $store.state.language == "en" ? t("configurator.English") : t("configurator.Chinese") }}
            <span class="arrow-right ms-2"></span>
        </button>
        <ul id="popper" class="dropdown-menu" aria-labelledby="languageDropdownButton">
            <div data-popper-arrow class="dropdown-popper-arrow"></div>
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('en')">{{ t("configurator.English") }}</a>
            </li>
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('ch')">{{ t("configurator.Chinese") }}</a>
            </li>
        </ul>
    </div>
</template>

<script>
import initializePopper from "@/assets/js/dropdown.js";
import { useI18n } from "vue-i18n";
export default {
    name: "languageDropDown",
    data(){
        const { t } = useI18n({});
        return {
            t: t
        }
    },
    methods: {
        initializeLanguagePopper() {
            initializePopper('#languageDropdownButton', '#languageDropdownButton + .dropdown-menu', '[data-popper-arrow]');
        },
        setLanguage(language) {
            if (language === this.$i18n.locale) {
                return;
            }
            this.$i18n.locale = language;
            this.$store.commit("setLanguage", language);
            this.$refs["language-select"].blur(); // remove the focus on the selection:
        }
    }
}
</script>
