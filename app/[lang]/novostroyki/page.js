import Link from "next/link";
import { Suspense } from "react";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";
import ProjectCard from "@/components/ProjectCard";
import { CardGridSkeleton, Container } from "@/components/ui";
import { DEFAULT_SORT, PAGE_SIZE, SORT_KEYS, applyFilters, catalogHref, parseFilters } from "@/lib/catalog";
import { getProjects } from "@/lib/data";
import { CLASS_KEYS, QUALITY_KEYS, STATUS_KEYS } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { districtCounts, regionCounts } from "@/lib/stats";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.catalog.metaTitle, description: d.catalog.metaDescription };
}

const chip = "flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors";
const chipOn = "border-navy-900 bg-navy-900 text-white";
const chipOff = "border-line bg-white text-ink hover:border-navy-900";
const fieldClass = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] focus:border-navy-900";
const legendClass = "mb-2 text-xs font-bold uppercase tracking-wider text-muted";

function Check({ name, label, checked }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-5 w-5 accent-navy-900" />
      {label}
    </label>
  );
}

function Pagination({ lang, label, filters, page, pages }) {
  if (pages <= 1) return null;
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages);
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={catalogHref(lang, filters, { page: n })}
            aria-current={n === page ? "page" : undefined}
            className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-white px-3 font-semibold aria-[current=page]:border-navy-900 aria-[current=page]:bg-navy-900 aria-[current=page]:text-white"
          >
            {n}
          </Link>
        </span>
      ))}
    </nav>
  );
}

async function Catalog({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  const c = d.catalog;
  const filters = parseFilters(await searchParams);
  const projects = await getProjects();
  const regions = regionCounts(projects);
  const districts = filters.region ? districtCounts(projects, filters.region) : [];
  const found = applyFilters(projects, filters);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const shown = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const region = regions.find((r) => r.slug === filters.region);
  const href = (changes) => catalogHref(t.lang, filters, changes);
  const keep = (name, value) => value && <input type="hidden" name={name} value={value} />;
  const action = t.href("/novostroyki");

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs font-bold uppercase tracking-wider text-muted">{c.region}</span>
          <Link href={href({ region: "", district: "" })} className={`${chip} ${filters.region ? chipOff : chipOn}`}>
            {c.all} · {projects.length}
          </Link>
          {regions.map((r) => (
            <Link
              key={r.slug}
              href={href({ region: r.slug, district: "" })}
              aria-current={filters.region === r.slug ? "true" : undefined}
              className={`${chip} ${filters.region === r.slug ? chipOn : chipOff}`}
            >
              {t.place(r)} · {r.count}
            </Link>
          ))}
        </div>
        {districts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-xs font-bold uppercase tracking-wider text-muted">{c.district}</span>
            <Link href={href({ district: "" })} className={`${chip} ${filters.district ? chipOff : chipOn}`}>
              {c.allDistricts}
            </Link>
            {districts.map((x) => (
              <Link
                key={x.slug}
                href={href({ district: x.slug })}
                aria-current={filters.district === x.slug ? "true" : undefined}
                className={`${chip} ${filters.district === x.slug ? chipOn : chipOff}`}
              >
                {t.place(x)} · {x.count}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <form action={action} className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24 lg:w-72 lg:shrink-0">
          {keep("region", filters.region)}
          {keep("district", filters.district)}
          {keep("sort", filters.sort !== DEFAULT_SORT && filters.sort)}
          <div className="flex items-center justify-between">
            <strong className="text-lg">{c.filters}</strong>
            <Link href={action} className="text-sm font-semibold text-navy-900 hover:underline">
              {c.reset}
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-q" className={legendClass}>{c.search}</label>
            <input id="f-q" name="q" type="search" defaultValue={filters.q} className={fieldClass} placeholder={c.searchPlaceholder} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-status" className={legendClass}>{c.status}</label>
            <select id="f-status" name="status" defaultValue={filters.status} className={fieldClass}>
              <option value="">{c.any}</option>
              {STATUS_KEYS.map((key) => (
                <option key={key} value={key}>{d.status[key]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-cls" className={legendClass}>{c.housingClass}</label>
            <select id="f-cls" name="cls" defaultValue={filters.cls} className={fieldClass}>
              <option value="">{c.any}</option>
              {CLASS_KEYS.map((key) => (
                <option key={key} value={key}>{d.housingClass[key]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-rooms" className={legendClass}>{d.home.rooms}</label>
              <select id="f-rooms" name="rooms" defaultValue={filters.rooms} className={fieldClass}>
                <option value="">{d.rooms.any}</option>
                <option value="0">{d.rooms.studio}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-year" className={legendClass}>{c.year}</label>
              <select id="f-year" name="year" defaultValue={filters.year ?? ""} className={fieldClass}>
                <option value="">{c.any}</option>
                {[2026, 2027, 2028, 2029].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={legendClass}>{c.price}</legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="f-pmin" className="text-xs text-muted">{c.from}</label>
                <input id="f-pmin" name="pmin" type="number" min="0" step="0.5" inputMode="decimal" defaultValue={filters.pmin ?? ""} className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="f-pmax" className="text-xs text-muted">{c.to}</label>
                <input id="f-pmax" name="pmax" type="number" min="0" step="0.5" inputMode="decimal" defaultValue={filters.pmax ?? ""} className={fieldClass} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className={legendClass}>{c.terms}</legend>
            <Check name="installment" label={d.card.installment} checked={filters.installment} />
            <Check name="mortgage" label={c.mortgage} checked={filters.mortgage} />
            <Check name="offer" label={d.card.offer} checked={filters.offer} />
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-quality" className={legendClass}>{c.quality}</label>
            <select id="f-quality" name="quality" defaultValue={filters.quality} className={fieldClass}>
              <option value="">{c.anyQuality}</option>
              {QUALITY_KEYS.map((key) => (
                <option key={key} value={key}>{d.quality[key].label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="h-12 rounded-xl bg-navy-900 font-bold text-white transition-colors hover:bg-navy-950">
            {c.show}
          </button>
        </form>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <form action={action} className="flex flex-wrap items-center justify-between gap-3">
            {Object.entries(filters).map(([key, value]) =>
              key === "sort" || key === "page" || value === "" || value == null || value === false ? null : (
                <input key={key} type="hidden" name={key} value={value === true ? "1" : String(value)} />
              ),
            )}
            <p className="text-lg font-semibold" aria-live="polite">
              {c.found(t.count(found.length, d.forms.project))}
              {region ? ` · ${t.place(region)}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="f-sort" className="text-sm text-muted">{c.sort}</label>
              <AutoSubmitSelect id="f-sort" name="sort" defaultValue={filters.sort} className={`${fieldClass} w-auto`}>
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>{c.sorts[key]}</option>
                ))}
              </AutoSubmitSelect>
              <noscript>
                <button type="submit" className="h-11 rounded-xl border border-line px-3">OK</button>
              </noscript>
            </div>
          </form>

          {shown.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-8">
              <strong className="text-lg">{c.emptyTitle}</strong>
              <p className="text-muted">{c.emptyText}</p>
              <Link href={action} className="font-semibold text-navy-900 hover:underline">
                {c.emptyReset}
              </Link>
            </div>
          )}

          <Pagination lang={t.lang} label={c.pages} filters={filters} page={page} pages={pages} />
        </div>
      </div>
    </>
  );
}

export default async function CatalogPage({ searchParams }) {
  const t = await getI18n();
  return (
    <Container className="py-8 sm:py-10">
      <nav aria-label={t.d.breadcrumbs} className="mb-3 text-sm text-muted">
        <Link href={t.href("/")} className="hover:text-navy-900">{t.d.catalog.home}</Link> / {t.d.nav.catalog}
      </nav>
      <h1 className="mb-6 font-display text-3xl font-semibold sm:text-4xl">{t.d.catalog.title}</h1>
      <Suspense fallback={<CardGridSkeleton count={6} />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
