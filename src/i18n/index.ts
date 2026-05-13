import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json'
import ar from './locales/ar.json'

const supportedLanguages = ['en', 'ar'];
const normalizeLanguage = (language?: string | null) =>
    language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
const storedLanguage =
    typeof window !== 'undefined'
        ? normalizeLanguage(window.localStorage.getItem('i18nextLng'))
        : 'en';

if (typeof window !== 'undefined') {
    window.localStorage.setItem('i18nextLng', storedLanguage);
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { en: { translation: en }, ar: { translation: ar } },
        lng: storedLanguage,
        fallbackLng: 'en',
        supportedLngs: supportedLanguages,
        cleanCode: true,
        nonExplicitSupportedLngs: true,
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage','cookie', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: [ 'localStorage','cookie' ]// this enables writing cookie automatically
        },
    })

export default i18n
