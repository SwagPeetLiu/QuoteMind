import { createI18n } from 'vue-i18n';
import store from "../store";

// function used to load the locale strings
function loadLocaleMessages() {
  const locales = require.context('../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  })
  return messages;
};

// function used to load the locale strings
function createCustomisedI18n() {
  const i18n = createI18n({
    legacy: false, // Set to false to use Composition API
    globalInjection: true, // Inject $t and $tc to all components
    locale: store.state.language || 'en',
    fallbackLocale: 'en',
    messages: loadLocaleMessages(),
    silentTranslationWarn: true,
    missingWarn: false,
    fallbackWarn: false
  });
  return i18n
}

export { createCustomisedI18n };