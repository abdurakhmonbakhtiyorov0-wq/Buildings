// Общие константы языков: подключаются и в proxy.js, и в клиентских компонентах.
export const LOCALES = ["ru", "uz", "en"];
export const DEFAULT_LOCALE = "ru";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_LABELS = { ru: "Рус", uz: "Oʻzb", en: "Eng" };

export const hasLocale = (value) => LOCALES.includes(value);
