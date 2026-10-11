import en from "@/dictionaries/en";
import ru from "@/dictionaries/ru";
import uz from "@/dictionaries/uz";

// Словари и форматирование без серверных зависимостей: подключаются и в браузере (каталог).
const DICTIONARIES = { ru, uz, en };
const INTL_LOCALE = { ru: "ru-RU", uz: "uz-Latn-UZ", en: "en-US" };

function createI18n(locale) {
  const d = DICTIONARIES[locale];
  const intl = INTL_LOCALE[locale];
  const nf0 = new Intl.NumberFormat(intl);
  const nf1 = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 });
  const rules = new Intl.PluralRules(intl);
  const word = (n, forms) => forms[rules.select(n)] ?? forms.other;

  const t = {
    lang: locale,
    intl,
    d,
    href: (path = "/") => (path === "/" ? `/${locale}` : `/${locale}${path}`),
    num: (n) => (n == null ? null : nf0.format(n)),
    dec: (n) => (n == null ? null : nf1.format(n)),
    word,
    count: (n, forms) => `${nf0.format(n)} ${word(n, forms)}`,
    money: (uzs) =>
      uzs == null ? null : uzs >= 1e9 ? `${nf1.format(uzs / 1e9)} ${d.units.bln}` : `${nf1.format(uzs / 1e6)} ${d.units.mln}`,
    mln: (uzs) => (uzs == null ? null : `${nf1.format(uzs / 1e6)} ${d.units.mlnShort}`),
    from: (value) => d.fromValue(value),
    area: (a) => `${nf1.format(a)} ${d.units.m2}`,
    usd: (n) => (n == null ? null : n >= 1e6 ? `$${nf0.format(Math.round(n / 1e6))} ${d.units.mlnShort}` : `$${nf0.format(n)}`),
    completion: (year, quarter) => (!year ? d.completion.none : quarter ? d.completion.quarter(quarter, year) : String(year)),
    priceRange(from, to) {
      if (from == null) return null;
      if (to == null || Math.round(to / 1e5) === Math.round(from / 1e5)) return d.fromValue(`${nf1.format(from / 1e6)} ${d.units.mln}/${d.units.m2}`);
      return `${nf1.format(from / 1e6)}–${nf1.format(to / 1e6)} ${d.units.mln}/${d.units.m2}`;
    },
    place: (item) => (item ? item[locale] ?? item.ru : null),
    // Название и заметка проекта на языке страницы; без перевода — русский оригинал.
    name: (p) => p.names?.[locale] ?? p.name,
    notes(p) {
      const own = p.notesI18n?.[locale];
      if (own) return { text: own, lang: locale, translated: true };
      return p.notes ? { text: p.notes, lang: "ru", translated: locale === "ru" } : null;
    },
  };
  return t;
}

const cache = new Map();

export function i18nFor(locale) {
  if (!cache.has(locale)) cache.set(locale, createI18n(locale));
  return cache.get(locale);
}
