const count = (list, fn) => list.reduce((n, p) => n + (fn(p) ? 1 : 0), 0);

export function summarize(projects) {
  const active = (p) => p.status === "building";
  return {
    total: projects.length,
    building: count(projects, active),
    planned: count(projects, (p) => p.status === "planned"),
    completed: count(projects, (p) => p.status === "completed"),
    installment: count(projects, (p) => active(p) && p.installment === true),
    mortgage: count(projects, (p) => active(p) && p.mortgageRate != null),
    offer: count(projects, (p) => active(p) && p.specialOffer === true),
    developers: new Set(projects.map((p) => p.developer?.slug).filter(Boolean)).size,
    layouts: projects.reduce((n, p) => n + p.layouts.length, 0),
  };
}

export function pipeline(projects) {
  const upcoming = projects.filter((p) => p.status !== "completed");
  const years = new Map();
  for (const p of upcoming) {
    if (!p.year) continue;
    years.set(p.year, (years.get(p.year) ?? 0) + 1);
  }
  const bars = [...years.entries()].sort(([a], [b]) => a - b).map(([year, n]) => ({ label: String(year), n }));
  const noYear = count(upcoming, (p) => !p.year);
  return { bars, noYear };
}

export function regionCounts(projects) {
  const map = new Map();
  for (const p of projects) {
    const r = map.get(p.region.slug) ?? { ...p.region, count: 0 };
    r.count += 1;
    map.set(p.region.slug, r);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function districtCounts(projects, regionSlug) {
  const map = new Map();
  for (const p of projects) {
    if (!p.district || (regionSlug && p.region.slug !== regionSlug)) continue;
    const d = map.get(p.district.slug) ?? { ...p.district, region: p.region.slug, count: 0, building: 0, priced: [] };
    d.count += 1;
    if (p.status === "building") d.building += 1;
    if (p.priceFrom) d.priced.push((p.priceFrom + (p.priceTo ?? p.priceFrom)) / 2);
    map.set(p.district.slug, d);
  }
  return [...map.values()]
    .map(({ priced, ...d }) => ({
      ...d,
      avgPrice: priced.length ? priced.reduce((a, b) => a + b, 0) / priced.length : null,
    }))
    .sort((a, b) => b.count - a.count);
}

export function developerList(projects) {
  const map = new Map();
  for (const p of projects) {
    if (!p.developer) continue;
    const d = map.get(p.developer.slug) ?? { ...p.developer, total: 0, building: 0, projects: [] };
    d.total += 1;
    if (p.status === "building") d.building += 1;
    d.projects.push(p);
    map.set(p.developer.slug, d);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ru"));
}

export function initials(name) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}
