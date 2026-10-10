import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CardGridSkeleton, Container } from "@/components/ui";
import { catalogHref, parseFilters } from "@/lib/catalog";
import { getProjects } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { developerList, initials } from "@/lib/stats";

// Без поиска показываем только крупнейших по числу проектов; остальных можно найти поиском.
const TOP = 10;
const MAX_RESULTS = 50;

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.developers.metaTitle, description: d.developers.metaDescription };
}

// Иконки 24×24 в стиле линий; цвет берётся из currentColor.
const ICONS = {
  catalog: "M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20M8 8h2M8 12h2M8 16h2M17 13h0M17 17h0",
  building: "M4 21h16M7 21V9M7 9l13-5v3M7 9 2 7l5-3 13 0M17 7v5M15 12h4v3h-4zM11 21v-6h4v6",
  installment: "M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  map: "M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  google: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  website: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
};

function Icon({ name, className = "" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICONS[name]} />
    </svg>
  );
}

function VerifiedBadge({ label }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-label={label} className="shrink-0 text-done">
      <title>{label}</title>
      <path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_BUTTON =
  "flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-muted transition-colors hover:border-navy-200 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

function IconLink({ href, icon, label, external = false }) {
  const props = { href, title: label, "aria-label": label, className: ICON_BUTTON };
  if (external) {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        <Icon name={icon} />
      </a>
    );
  }
  return (
    <Link {...props}>
      <Icon name={icon} />
    </Link>
  );
}

function DeveloperRow({ dev, t }) {
  const { d } = t;
  const labels = d.developers.icons;
  const href = t.href(`/zastroyshchiki/${dev.slug}`);
  const catalog = (changes) => catalogHref(t.lang, parseFilters({}), { q: dev.name, ...changes });
  const share = dev.total ? Math.round((dev.building / dev.total) * 100) : 0;
  const cheapest = Math.min(...dev.projects.map((p) => p.cheapest ?? Infinity));
  const hasInstallment = dev.projects.some((p) => p.installment === true);
  const query = encodeURIComponent(`${dev.name} Toshkent`);

  const icons = [
    dev.phone && { href: `tel:${dev.phone.replace(/[^\d+]/g, "")}`, icon: "phone", label: dev.phone, external: true },
    dev.website && { href: dev.website, icon: "website", label: labels.website, external: true },
    { href: catalog({}), icon: "catalog", label: labels.catalog },
    dev.building > 0 && { href: catalog({ status: "building" }), icon: "building", label: labels.building },
    hasInstallment && { href: catalog({ installment: true }), icon: "installment", label: labels.installment },
    { href: `https://www.google.com/maps/search/?api=1&query=${query}`, icon: "map", label: labels.map, external: true },
    { href: `https://www.google.com/search?q=${query}`, icon: "google", label: labels.google, external: true },
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md lg:flex-row lg:items-center lg:gap-6 lg:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white shadow-sm sm:h-24 sm:w-24"
        >
          {dev.logo_url ? (
            <Image src={dev.logo_url} alt="" fill sizes="96px" unoptimized className="object-contain p-2" />
          ) : (
            <span className="font-display text-2xl font-semibold tracking-wide text-navy-900">{initials(dev.name)}</span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
            <Link href={href} className="truncate hover:underline">
              {dev.name}
            </Link>
            {dev.verified && <VerifiedBadge label={d.developers.verified} />}
          </h2>
          <p className="text-sm text-muted">
            {[dev.founded_year && d.developers.founded(dev.founded_year), Number.isFinite(cheapest) && d.project.aptsFrom(t.money(cheapest))]
              .filter(Boolean)
              .join(" · ") || " "}
          </p>
          <div className="mt-3 flex max-w-xs flex-col gap-1.5">
            <span className="text-sm font-medium">{d.developers.buildingShare}</span>
            <div className="flex items-center gap-3">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-canvas"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={dev.total}
                aria-valuenow={dev.building}
                aria-label={d.developers.buildingShare}
              >
                <div className="h-full rounded-full bg-building" style={{ width: `${share}%` }} />
              </div>
              <span className="text-sm tabular-nums text-muted">
                {dev.building} / {dev.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start lg:shrink-0">
        <div className="flex flex-col gap-3 sm:items-end">
          <Link
            href={href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 font-semibold text-white transition-colors hover:bg-cta-hover"
          >
            {d.developers.viewProjects}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <ul className="flex flex-wrap gap-2 sm:justify-end">
            {icons.map((i) => (
              <li key={i.icon}>
                <IconLink {...i} />
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:w-44 sm:flex-col">
          <span className="inline-flex h-12 items-center justify-center rounded-full bg-canvas px-5 font-semibold">
            {t.count(dev.total, d.forms.project)}
          </span>
          <span
            className={`inline-flex h-12 items-center justify-center rounded-full border border-line px-5 text-sm ${
              dev.building ? "text-building-text" : "text-muted/60"
            }`}
          >
            {dev.building ? d.developers.building(dev.building) : d.developers.noBuilding}
          </span>
        </div>
      </div>
    </article>
  );
}

async function DeveloperList({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  const { q } = parseFilters(await searchParams);
  const developers = developerList(await getProjects());
  const needle = q.toLowerCase();
  const list = needle
    ? developers.filter((dev) => dev.name.toLowerCase().includes(needle)).slice(0, MAX_RESULTS)
    : developers.slice(0, TOP);

  return (
    <>
      <form role="search" className="mb-5 flex items-center gap-2 rounded-2xl border border-line bg-white p-2 pl-5">
        <label htmlFor="developer-search" className="sr-only">{d.developers.search}</label>
        <input
          id="developer-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={d.developers.search}
          className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label={d.developers.searchButton}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-navy-900 transition-colors hover:bg-canvas"
        >
          <Icon name="google" className="h-6 w-6" />
        </button>
      </form>
      <p className="mb-4 font-medium" aria-live="polite">
        {needle ? d.developers.found(list.length) : d.developers.top(list.length)}
        {needle && (
          <>
            {" · "}
            <Link href={t.href("/zastroyshchiki")} className="text-navy-900 underline">{d.developers.reset}</Link>
          </>
        )}
      </p>
      {list.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {list.map((dev) => (
            <li key={dev.slug}>
              <DeveloperRow dev={dev} t={t} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">{d.developers.nothing}</p>
      )}
    </>
  );
}

export default async function DevelopersPage({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  const total = developerList(await getProjects()).length;
  return (
    <Container className="py-8 sm:py-10">
      <nav aria-label={d.breadcrumbs} className="mb-3 text-sm text-muted">
        <Link href={t.href("/")} className="hover:text-navy-900">{d.catalog.home}</Link> / {d.developers.title}
      </nav>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{d.developers.title}</h1>
      <p className="mb-6 mt-2 max-w-2xl text-muted">{d.developers.intro(t.count(total, d.forms.company))}</p>
      <Suspense fallback={<CardGridSkeleton count={4} />}>
        <DeveloperList searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
