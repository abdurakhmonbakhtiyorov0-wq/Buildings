export const PAGE_SIZE = 24;

export const SORT_KEYS = ["recommended", "date", "price_asc", "price_desc", "name"];
export const DEFAULT_SORT = "recommended";

const SORTS = new Set(SORT_KEYS);
const STATUSES = new Set(["planned", "building", "completed"]);
const FLAGS = ["installment", "mortgage", "offer"];

const first = (v) => (Array.isArray(v) ? v[0] : v) ?? "";
const positive = (v) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function parseFilters(sp) {
  const sort = first(sp.sort);
  return {
    q: first(sp.q).trim().slice(0, 80),
    status: STATUSES.has(first(sp.status)) ? first(sp.status) : "",
    region: first(sp.region),
    district: first(sp.district),
    cls: first(sp.cls),
    rooms: first(sp.rooms),
    year: positive(first(sp.year)),
    pmin: positive(first(sp.pmin)),
    pmax: positive(first(sp.pmax)),
    installment: first(sp.installment) === "1",
    mortgage: first(sp.mortgage) === "1",
    offer: first(sp.offer) === "1",
    quality: first(sp.quality),
    sort: SORTS.has(sort) ? sort : DEFAULT_SORT,
    page: Math.max(1, Number.parseInt(first(sp.page), 10) || 1),
  };
}

// Ссылка на каталог с текущими фильтрами и заменой части из них.
export function catalogHref(lang, filters, changes = {}) {
  const next = { ...filters, page: 1, ...changes };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (key === "page" && value === 1) continue;
    if (key === "sort" && value === DEFAULT_SORT) continue;
    if (FLAGS.includes(key)) {
      if (value) qs.set(key, "1");
    } else if (value !== "" && value != null && value !== false) {
      qs.set(key, String(value));
    }
  }
  const s = qs.toString();
  return s ? `/${lang}/novostroyki?${s}` : `/${lang}/novostroyki`;
}

// Проект в каталоге браузера: только поля карточки и фильтров, чтобы все ~550 проектов
// приходили вместе со страницей и фильтровались без запросов к серверу.
export function slimProject(p) {
  return {
    slug: p.slug,
    name: p.name,
    names: p.names,
    status: p.status,
    housingClass: p.housingClass,
    year: p.year,
    quarter: p.quarter,
    completionKey: p.completionKey,
    region: p.region,
    district: p.district,
    developer: p.developer ? { name: p.developer.name } : null,
    priceFrom: p.priceFrom,
    priceTo: p.priceTo,
    cheapest: p.cheapest,
    apartments: p.apartments,
    floorsMax: p.floorsMax,
    installment: p.installment,
    mortgageRate: p.mortgageRate,
    specialOffer: p.specialOffer,
    quality: p.quality,
    rooms: p.rooms,
    // Карточка показывает три планировки и обложку; сортировке важно лишь, есть ли они.
    layouts: p.layouts.slice(0, 3),
    images: p.images.slice(0, 1),
  };
}

const nullsLast =(a, b) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a - b);
const byName = (a, b) => a.name.localeCompare(b.name, "ru");
const negate = (v) => (v == null ? null : -v);

// «Рекомендуемые»: сначала строящиеся, затем планируемые, сданные — в конце;
// внутри группы выше те, у кого есть фото, цена и планировки, затем по сроку сдачи.
const STATUS_RANK = { building: 0, planned: 1, completed: 2 };
const completeness = (p) => (p.images.length ? 2 : 0) + (p.priceFrom || p.cheapest ? 2 : 0) + (p.layouts.length ? 1 : 0);

const COMPARE = {
  recommended: (a, b) =>
    (STATUS_RANK[a.status] ?? 3) - (STATUS_RANK[b.status] ?? 3) ||
    completeness(b) - completeness(a) ||
    nullsLast(a.completionKey, b.completionKey) ||
    byName(a, b),
  date: (a, b) => nullsLast(a.completionKey, b.completionKey) || byName(a, b),
  price_asc: (a, b) => nullsLast(a.priceFrom, b.priceFrom) || byName(a, b),
  price_desc: (a, b) => nullsLast(negate(a.priceFrom), negate(b.priceFrom)) || byName(a, b),
  name: byName,
};

export function applyFilters(projects, f) {
  const q = f.q.toLowerCase();
  const list = projects.filter((p) => {
    if (q) {
      const haystack = [p.name, p.names?.uz, p.names?.en, p.developer?.name].filter(Boolean).join("\n").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.status && p.status !== f.status) return false;
    if (f.region && p.region.slug !== f.region) return false;
    if (f.district && p.district?.slug !== f.district) return false;
    if (f.cls && p.housingClass !== f.cls) return false;
    if (f.rooms !== "") {
      const r = Number(f.rooms);
      if (!p.rooms.some((x) => (r >= 4 ? x >= 4 : x === r))) return false;
    }
    if (f.year && !(p.year && p.year <= f.year)) return false;
    if (f.pmin && !((p.priceTo ?? p.priceFrom) >= f.pmin * 1e6)) return false;
    if (f.pmax && !(p.priceFrom != null && p.priceFrom <= f.pmax * 1e6)) return false;
    if (f.installment && p.installment !== true) return false;
    if (f.mortgage && p.mortgageRate == null) return false;
    if (f.offer && p.specialOffer !== true) return false;
    if (f.quality && p.quality !== f.quality) return false;
    return true;
  });
  return list.sort(COMPARE[f.sort]);
}
