<template>
    <p>sdaljk</p>
    <div class="dropdown mt-3" ref="language-select">
        <h6 class="mb-1">{{ t("configurator.Language") }}</h6>
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
            data-bs-toggle="dropdown" aria-expanded="false">
            {{ this.$store.state.language == "en" ?
                t("configurator.English") : t("configurator.Chinese")
            }}
            <span class="arrow-right ms-2"></span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('en')">{{ t("configurator.English") }}</a>
            </li>
            <li><a class="dropdown-item" href="#" @click.prevent="setLanguage('ch')">{{ t("configurator.Chinese") }}</a>
            </li>
        </ul>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
    name: "test",
    setup() {
        const { t } = useI18n();
        return { t };
    },
    methods: {
        setLanguage(language) {
            if (language === this.$i18n.locale) {
                return;
            }
            this.$i18n.locale = language;
            this.$store.commit("setLanguage", language);
            this.$refs["language-select"].blur(); // remove the focus on the selection:
        },
    }
}
</script>
