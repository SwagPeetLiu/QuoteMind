<template>
  <footer class="py-3 footer">
    <div class="container-fluid">
      <div class="row align-items-center justify-content-lg-between">
        <div class="mb-4 col-lg-6 mb-lg-0">
          <div
            class="text-sm text-center copyright text-muted text-lg-start"
          >
            ©
            {{ new Date().getFullYear() }}{{ t('footer.made with') }}
            <i class="fa fa-heart"></i> {{ t('footer.by') }}
            <a
              href="https://www.linkedin.com/in/peter-liu-578438190/"
              class="font-weight-bold"
              target="_blank"
              norel="noopener noreferrer"
              >Peter Liu</a
            >
            {{ t('footer.for hard working mothers') }}
          </div>
        </div>
        <div class="col-lg-6">
          <ul
            class="nav nav-footer justify-content-center justify-content-lg-end"
          >
            <li class="nav-item">
              <a
                href="https://www.linkedin.com/in/peter-liu-578438190/"
                class="nav-link text-muted"
                target="_blank"
                norel="noopener noreferrer"
                >{{ t('footer.Author') }}</a
              >
            </li>
            <li class="nav-item">
              <a
                href="https://github.com/SwagPeetLiu/QuoteMind/tree/master"
                class="nav-link text-muted"
                target="_blank"
                norel="noopener noreferrer"
                >{{ t('footer.github') }}</a
              >
            </li>
            <li class="nav-item">
              <a
                href="https://www.creative-tim.com/license"
                class="nav-link pe-0 text-muted"
                target="_blank"
                norel="noopener noreferrer"
              >
                {{ t('footer.license') }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: "app-footer",
  setup(){
    const { t } = useI18n();
    return { t }
  }
};
</script>
