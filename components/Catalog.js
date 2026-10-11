"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { DEFAULT_SORT, PAGE_SIZE, SORT_KEYS, applyFilters, catalogHref, parseFilters } from "@/lib/catalog";
import { CLASS_KEYS, QUALITY_KEYS, STATUS_KEYS } from "@/lib/format";
import { i18nFor } from "@/lib/i18n-core";
import { districtCounts, regionCounts } from "@/lib/stats";

const chip = "flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors";
const chipOn = "border-navy-900 bg-navy-900 text-white";
const chipOff = "border-line bg-white text-ink hover:border-navy-900";
const fieldClass = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] focus:border-navy-900";
const legendClass = "mb-2 text-xs font-bold uppercase tracking-wider text-muted";

// Фильтры живут в адресе: history.pushState меняет его без запроса к серверу,
// а useSearchParams отдаёт новые значения (так Next.js связывает History API со своим роутером).
function go(href, replace = false) {
  window.history[replace ? "replaceState" : "pushState"](null, "", href);
}

const readForm = (form) => parseFilters(Object.fromEntries(new FormData(form)));

// Обычная ссылка: в новой вкладке и без JS открывает ту же подборку, а простой клик фильтрует на месте.
function NavLink({ href, onNavigate, ...props }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate(href);
      }}
      {...props}
    />
  );
}

function Check({ name, label, checked }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-5 w-5 accent-navy-900" />
      {label}
    </label>
  );
}

function Pagination({ label, page, pages, href, onNavigate }) {
  if (pages <= 1) return null;
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages);
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <NavLink
            href={href({ page: n })}
            onNavigate={onNavigate}
            aria-current={n === page ? "page" : undefined}
            className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-white px-3 font-semibold aria-[current=page]:border-navy-900 aria-[current=page]:bg-navy-900 aria-[current=page]:text-white"
          >
            {n}
          </NavLink>
        </span>
      ))}
    </nav>
  );
}

export default function Catalog({ lang, projects }) {
  const t = i18nFor(lang);
  const { d } = t;
  const c = d.catalog;
  const filters = parseFilters(Object.fromEntries(useSearchParams()));
  const regions = regionCounts(projects);
  const districts = filters.region ? districtCounts(projects, filters.region) : [];
  const found = applyFilters(projects, filters);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const shown = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const region = regions.find((r) => r.slug === filters.region);
  const href = (changes) => catalogHref(lang, filters, changes);
  const keep = (name, value) => value && <input type="hidden" name={name} value={value} />;
  const action = t.href("/novostroyki");
  const results = useRef(null);

  // Поля форм не управляемые: при «назад/вперёд» и сбросе пересоздаём формы, чтобы они
  // показали значения из адреса. При вводе не пересоздаём — иначе пропадёт фокус.
  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    const sync = () => setFormKey((k) => k + 1);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const reset = (to) => {
    go(to);
    setFormKey((k) => k + 1);
  };
  const toPage = (to) => {
    go(to);
    results.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs font-bold uppercase tracking-wider text-muted">{c.region}</span>
          <NavLink href={href({ region: "", district: "" })} onNavigate={go} className={`${chip} ${filters.region ? chipOff : chipOn}`}>
            {c.all} · {projects.length}
          </NavLink>
          {regions.map((r) => (
            <NavLink
              key={r.slug}
              href={href({ region: r.slug, district: "" })}
              onNavigate={go}
              aria-current={filters.region === r.slug ? "true" : undefined}
              className={`${chip} ${filters.region === r.slug ? chipOn : chipOff}`}
            >
              {t.place(r)} · {r.count}
            </NavLink>
          ))}
        </div>
        {districts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-xs font-bold uppercase tracking-wider text-muted">{c.district}</span>
            <NavLink href={href({ district: "" })} onNavigate={go} className={`${chip} ${filters.district ? chipOff : chipOn}`}>
              {c.allDistricts}
            </NavLink>
            {districts.map((x) => (
              <NavLink
                key={x.slug}
                href={href({ district: x.slug })}
                onNavigate={go}
                aria-current={filters.district === x.slug ? "true" : undefined}
                className={`${chip} ${filters.district === x.slug ? chipOn : chipOff}`}
              >
                {t.place(x)} · {x.count}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <form
          key={`filters-${formKey}`}
          action={action}
          onChange={(e) => go(catalogHref(lang, readForm(e.currentTarget)), true)}
          onSubmit={(e) => {
            e.preventDefault();
            go(catalogHref(lang, readForm(e.currentTarget)), true);
            results.current?.scrollIntoView({ block: "start", behavior: "smooth" });
          }}
          className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24 lg:w-72 lg:shrink-0"
        >
          {keep("region", filters.region)}
          {keep("district", filters.district)}
          {keep("sort", filters.sort !== DEFAULT_SORT && filters.sort)}
          <div className="flex items-center justify-between">
            <strong className="text-lg">{c.filters}</strong>
            <NavLink href={action} onNavigate={reset} className="text-sm font-semibold text-navy-900 hover:underline">
              {c.reset}
            </NavLink>
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

        <div ref={results} className="flex min-w-0 flex-1 scroll-mt-24 flex-col gap-5">
          <form key={`sort-${formKey}`} action={action} className="flex flex-wrap items-center justify-between gap-3">
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
              <select
                id="f-sort"
                name="sort"
                defaultValue={filters.sort}
                onChange={(e) => go(href({ sort: e.currentTarget.value }))}
                className={`${fieldClass} w-auto`}
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>{c.sorts[key]}</option>
                ))}
              </select>
              <noscript>
                <button type="submit" className="h-11 rounded-xl border border-line px-3">OK</button>
              </noscript>
            </div>
          </form>

          {shown.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p) => (
                <ProjectCard key={p.slug} project={p} t={t} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-8">
              <strong className="text-lg">{c.emptyTitle}</strong>
              <p className="text-muted">{c.emptyText}</p>
              <NavLink href={action} onNavigate={reset} className="font-semibold text-navy-900 hover:underline">
                {c.emptyReset}
              </NavLink>
            </div>
          )}

          <Pagination label={c.pages} page={page} pages={pages} href={href} onNavigate={toPage} />
        </div>
      </div>
    </div>
  );
}
