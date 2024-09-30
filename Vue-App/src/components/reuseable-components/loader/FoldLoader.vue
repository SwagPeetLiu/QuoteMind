<template>
    <div class="fold-wrapper">
        <div class="cube-folding">
            <span class="leaf1"></span>
            <span class="leaf2"></span>
            <span class="leaf3"></span>
            <span class="leaf4"></span>
        </div>
        <span class="loading text-shadow-lg" data-name="Loading">
            {{ t('others.loading') }}
        </span>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
export default {
    name: "FoldLoader",
    data(){
        const { t } = useI18n({});
        return {
            t
        }
    }
}
</script>