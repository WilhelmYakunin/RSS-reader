import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import _ from 'lodash';
import ru from './languages/ru';
import en from './languages/en';
import de from './languages/de';

export default class {
  constructor(pageMask, message) {
    this.mask = pageMask;
    this.message = message;
  }

  createMaskContent() {
    i18next
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
        fallbackLng: 'en',
        debug: true,
        resources: {
          ru,
          en,
          de,
        },
      }, () => {
        _.entries(this.mask).map(([elemName, elem]) => {
          elemName === 'input' ? elem.placeholder = i18next.t(`${elemName}`) : elem.textContent = i18next.t(`${elemName}`);
        });
      }, (err, t) => {
        if (err) return console.log('something went wrong loading language settings', err);
        t('languageError');
      });
  }

  renderFeedbackMessage() {
    i18next
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
        fallbackLng: 'en',
        debug: true,
        resources: {
          ru,
          en,
          de,
        },
      }, () => this.mask.textContent = i18next.t(this.message), (err, t) => {
        if (err) return console.log('something went wrong loading language settings', err);
        t('languageError');
      });
  }
}
