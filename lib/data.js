import { cacheLife, cacheTag } from "next/cache";
import snapshot from "@/data/projects.json";
import { supabase } from "@/lib/supabase";

// Чтобы перейти на свой Express API, достаточно заменить loadRows():
// он должен вернуть массив проектов в том же виде, что data/projects.json.
const PROJECT_SELECT = `
  id, slug, kind, name, name_uz, name_en, notes_uz, notes_en, status, housing_class, completion_year, completion_quarter, address, lat, lon,
  apartments_total, buildings_count, floors_max, residents, land_area_ha, investment_usd,
  price_m2_from, price_m2_to, installment, mortgage_rate_pct, special_offer, finishing,
  description, notes, quality,
  developer:developers(slug, name, founded_year, logo_url, phone, verified),
  region:regions(slug, name_ru, name_uz),
  district:districts(slug, name_ru, name_uz),
  layouts(rooms, area_total, price_uzs, price_m2),
  project_media(kind, url, caption, sort_order),
  project_sources(url, fetched_on, source:sources(code, name, kind))`;

// Колонки переводов появляются после ../i18n_projects.sql; до этого запрашиваем без них.
const UNDEFINED_COLUMN = "42703";
const BASE_SELECT = PROJECT_SELECT.replace("name_uz, name_en, notes_uz, notes_en, ", "");

async function loadRows() {
  if (!supabase) return { source: "snapshot", rows: snapshot };
  let { data, error } = await supabase.from("projects").select(PROJECT_SELECT).order("id");
  if (error?.code === UNDEFINED_COLUMN) {
    ({ data, error } = await supabase.from("projects").select(BASE_SELECT).order("id"));
  }
  if (error) {
    console.error("Supabase: не удалось загрузить проекты, используется локальная копия.", error.message);
    return { source: "snapshot", rows: snapshot };
  }
  return { source: "supabase", rows: data };
}

const num = (v) => (v == null ? null : Number(v));

// В базе нет английских названий: для регионов и районов области берём общепринятые,
// для районов Ташкента — узбекскую латиницу.
const REGION_EN = {
  tashkent: "Tashkent",
  "tashkent-region": "Tashkent Region",
  samarkand: "Samarkand",
  bukhara: "Bukhara",
  andijan: "Andijan",
  fergana: "Fergana",
  namangan: "Namangan",
  khorezm: "Khorezm",
  karakalpakstan: "Karakalpakstan",
  kashkadarya: "Kashkadarya",
  surkhandarya: "Surkhandarya",
  navoi: "Navoi",
  jizzakh: "Jizzakh",
  syrdarya: "Syrdarya",
};

const DISTRICT_EN = {
  "new-tashkent": "New Tashkent",
  nurafshon: "Nurafshon",
  akhangaran: "Akhangaran District",
  parkent: "Parkent District",
  zangiata: "Zangiata District",
  qibray: "Qibray District",
  "fergana-district": "Fergana District",
  margilan: "Margilan",
};

const MAPS = "https://www.google.com/maps/search/?api=1&query=";

// С координатами — точная точка; без них — поиск в Google Картах по названию и адресу.
function mapLink(p) {
  if (p.lat != null && p.lon != null) return { url: `${MAPS}${p.lat},${p.lon}`, exact: true };
  const query = [p.kind === "complex" ? `ЖК ${p.name}` : p.name, p.address, p.district?.name_ru, p.region?.name_ru]
    .filter(Boolean)
    .join(", ");
  return { url: MAPS + encodeURIComponent(query), exact: false };
}

const place = (item, en) =>
  item ? { slug: item.slug, ru: item.name_ru, uz: item.name_uz ?? item.name_ru, en: en ?? item.name_uz ?? item.name_ru } : null;

function normalize(p) {
  const layouts = (p.layouts ?? [])
    .map((l) => ({
      rooms: l.rooms,
      area: num(l.area_total),
      price: num(l.price_uzs),
      priceM2: num(l.price_m2),
    }))
    .sort((a, b) => a.rooms - b.rooms || a.area - b.area);
  const perM2 = layouts.map((l) => l.priceM2).filter(Boolean);
  const prices = layouts.map((l) => l.price).filter(Boolean);
  return {
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    name: p.name,
    // Перевода может не быть: тогда t.name() / t.notes() покажут русский текст.
    names: { ru: p.name, uz: p.name_uz ?? null, en: p.name_en ?? null },
    status: p.status,
    housingClass: p.housing_class,
    year: p.completion_year,
    quarter: p.completion_quarter,
    completionKey: p.completion_year ? p.completion_year * 10 + (p.completion_quarter ?? 4) : null,
    address: p.address,
    lat: num(p.lat),
    lon: num(p.lon),
    map: mapLink(p),
    apartments: p.apartments_total,
    buildingsCount: p.buildings_count,
    floorsMax: p.floors_max,
    residents: p.residents,
    landAreaHa: num(p.land_area_ha),
    investmentUsd: num(p.investment_usd),
    priceFrom: num(p.price_m2_from) ?? (perM2.length ? Math.min(...perM2) : null),
    priceTo: num(p.price_m2_to) ?? (perM2.length ? Math.max(...perM2) : null),
    cheapest: prices.length ? Math.min(...prices) : null,
    installment: p.installment,
    mortgageRate: num(p.mortgage_rate_pct),
    specialOffer: p.special_offer,
    finishing: p.finishing,
    description: p.description,
    notes: p.notes,
    notesI18n: { ru: p.notes, uz: p.notes_uz ?? null, en: p.notes_en ?? null },
    quality: p.quality,
    developer: p.developer ?? null,
    region: place(p.region, REGION_EN[p.region.slug]),
    district: place(p.district, DISTRICT_EN[p.district?.slug]),
    layouts,
    rooms: [...new Set(layouts.map((l) => l.rooms))],
    images: (p.project_media ?? [])
      .filter((m) => m.kind !== "video")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({ url: m.url, kind: m.kind, caption: m.caption })),
    sources: (p.project_sources ?? []).map((s) => ({
      url: s.url,
      fetchedOn: s.fetched_on,
      name: s.source?.name,
      kind: s.source?.kind,
    })),
  };
}

export async function getCatalog() {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  const { source, rows } = await loadRows();
  return { source, projects: rows.map(normalize) };
}

export async function getProjects() {
  return (await getCatalog()).projects;
}

export async function getProject(slug) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}
