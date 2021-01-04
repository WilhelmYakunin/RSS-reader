import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './languages/ru';
import en from './languages/en';
import de from './languages/de';

export default () => i18next
  .use(LanguageDetector)
  .init({
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'],
    },
    fallbackLng: ['en', 'de', 'ru'],
    debug: true,
    resources: {
      ru,
      en,
      de,
    },
  }, (err, t) => {
    if (err) console.log('something went wrong loading language settings', err);
    t('languageError');
  });
