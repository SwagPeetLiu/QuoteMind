<template>
  <footer class="py-5 footer">
    <div class="container">
      <div class="row">
        <div class="mx-auto mb-4 text-center col-lg-8">
          <a
            href="https://map.baidu.com/search/%E7%87%95%E5%9C%B0%E9%B9%8F%E6%89%AC/@12968328.16720159,4834607.196204171,20z?querytype=s&da_src=shareurl&wd=%E7%87%95%E5%9C%B0%E9%B9%8F%E6%89%AC&c=131&src=0&pn=0&sug=0&l=19&b=(12967872.99059,4834658.13629;12968692.25506,4835056.67431)&from=webmap&biz_forward=%7B%22scaler%22:1,%22styles%22:%22pl%22%7D&device_ratio=1"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
            {{ t('footer.About Us') }}
          </a>
          <a
            href="https://535051192liu.atlassian.net/jira/software/projects/KAN/pages"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
          {{ t('footer.Docs') }}
          </a>
          <a
            href="https://www.linkedin.com/in/peter-liu-578438190/"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
          {{ t('footer.Author') }}
          </a>
          <a
            href="mailto:535051192liu@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
          {{ t('footer.Contact Us') }}
          </a>
          <a
            href="https://www.creative-tim.com/knowledge-center/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
          {{ t('footer.Privacy') }}
          </a>
          <a
            href="https://www.creative-tim.com/learning-lab/vue/overview/soft-ui-dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0"
          >
          {{ t('footer.license') }}
          </a>
        </div>

        <!--Social svgs-->
        <div class="mx-auto mt-2 mb-4 text-center col-lg-8">
          <a
            href="https://baike.baidu.com/item/%E6%8A%A5%E4%BB%B7%E7%B3%BB%E7%BB%9F/2305304?fr=ge_ala"
            target="_blank"
            rel="noopener noreferrer"
            class="text-secondary me-xl-4 me-4"
          >
            <span class="text-lg fab fa-dribbble"></span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100004499836059&mibextid=LQQJ4d"
            target="_blank"
            rel="noopener noreferrer"
            class="text-secondary me-xl-4 me-4"
          >
            <span class="text-lg fab fa-facebook"></span>
          </a>
          <a
            href="https://www.instagram.com/swagpeetliu/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            class="text-secondary me-xl-4 me-4"
          >
            <span class="text-lg fab fa-instagram"></span>
          </a>
          <a
            href="https://baike.baidu.com/item/%E6%8A%A5%E4%BB%B7%E7%B3%BB%E7%BB%9F/2305304?fr=ge_ala"
            target="_blank"
            rel="noopener noreferrer"
            class="text-secondary me-xl-4 me-4"
          >
            <span class="text-lg fa fa-book"></span>
          </a>
          <a
            href="https://github.com/SwagPeetLiu/QuoteMind"
            target="_blank"
            rel="noopener noreferrer"
            class="text-secondary me-xl-4 me-4"
          >
            <span class="text-lg fab fa-github"></span>
          </a>
        </div>
      </div>
      <div class="row">
        <div class="mx-auto mt-1 text-center col-8">
          <p class="mb-0 text-secondary">
            {{ t('footer.Copyright') }} © {{ new Date().getFullYear() }} {{ t('footer.Created By') }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "app-footer",
  setup(){
    const { t } = useI18n();
    return { t };
  }
};
</script>
