import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NEW_DESIGN } from "@/lib/experiment";
import LeadForm from "@/components/LeadForm";
import PipelineChart from "@/components/PipelineChart";
import ProjectCard from "@/components/ProjectCard";
import { CardGridSkeleton, Container, SectionTitle } from "@/components/ui";
import { getProjects } from "@/lib/data";
import { QUALITY_KEYS, QUALITY_STYLE } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { developerList, districtCounts, initials, pipeline, regionCounts, summarize } from "@/lib/stats";

const selectClass =
  "h-12 w-full rounded-xl border border-line bg-white px-3 text-[15px] font-medium text-ink focus:border-navy-900";

const TAB_KEYS = ["soon", "offer", "finance"];

// Telegram-бот подбора новостроек.
const TELEGRAM_BOT = "NovaroHomesBot";

function TelegramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.9 4.3c.3-1.3-.5-1.8-1.4-1.5L2.8 9.6c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.7-.8l2.9-14.3zM8.4 12.2l9.9-6.2c.5-.3.9-.1.5.2l-8.2 7.4-.3 3.4-1.9-4.8z" />
    </svg>
  );
}

function pickTab(projects, tab) {
  const building = projects.filter((p) => p.status === "building" && p.layouts.length > 0);
  const byDate = (a, b) => (a.completionKey ?? 1e9) - (b.completionKey ?? 1e9);
  if (tab === "offer") return building.filter((p) => p.specialOffer).sort(byDate).slice(0, 4);
  if (tab === "finance") {
    return building
      .filter((p) => p.mortgageRate != null || p.installment)
      .sort((a, b) => (b.mortgageRate != null) - (a.mortgageRate != null) || byDate(a, b))
      .slice(0, 4);
  }
  return building.sort(byDate).slice(0, 4);
}

async function HomeProjects({ searchParams, projects }) {
  const t = await getI18n();
  const { tab: raw } = await searchParams;
  const tab = TAB_KEYS.includes(raw) ? raw : "soon";
  const cards = pickTab(projects, tab);
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label={t.d.home.tabsAria}>
        {TAB_KEYS.map((key) => (
          <Link
            key={key}
            href={key === "soon" ? t.href("/") : `${t.href("/")}?tab=${key}`}
            scroll={false}
            role="tab"
            aria-selected={key === tab}
            className="flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold transition-colors hover:border-navy-900 aria-selected:border-navy-900 aria-selected:bg-navy-900 aria-selected:text-white"
          >
            {t.d.home.tabs[key]}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((p) => (
          <ProjectCard key={p.slug} project={p} t={t} />
        ))}
      </div>
    </>
  );
}

export default async function HomePage({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  const h = d.home;
  const projects = await getProjects();
  const s = summarize(projects);
  const regions = regionCounts(projects);
  const allDistricts = districtCounts(projects);
  const tashkentDistricts = districtCounts(projects, "tashkent");
  const { bars, noYear } = pipeline(projects);
  const devs = developerList(projects).slice(0, 6);
  const megas = projects
    .filter((p) => p.kind === "megaproject" && p.status !== "completed" && p.apartments)
    .sort((a, b) => b.apartments - a.apartments)
    .slice(0, 3);
  const maxDistrict = tashkentDistricts[0]?.count ?? 1;
  const catalog = (query) => t.href(`/novostroyki?${query}`);

  const tiles = [
    { n: s.building, label: h.tiles.building, href: catalog("status=building"), color: "text-building-text" },
    { n: s.planned, label: h.tiles.planned, href: catalog("status=planned"), color: "text-planned-text" },
    { n: s.completed, label: h.tiles.completed, href: catalog("status=completed"), color: "text-done-text" },
    { n: s.installment, label: h.tiles.installment, href: catalog("status=building&installment=1"), color: "text-navy-900" },
    { n: s.mortgage, label: h.tiles.mortgage, href: catalog("status=building&mortgage=1"), color: "text-navy-900" },
    { n: s.offer, label: h.tiles.offer, href: catalog("status=building&offer=1"), color: "text-navy-900" },
  ];
  const statuses = [
    ["building", d.status.building],
    ["planned", d.status.planned],
    ["completed", d.status.completed],
    ["", h.statusAll],
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        {NEW_DESIGN ? (
          <>
            <Image
              src="/hero/home.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[70%_center]"
            />
            {/* Затемнение слева: текст и форма читаются, здание справа остаётся ярким. */}
            <div className="absolute inset-0 bg-linear-to-r from-navy-950/95 via-navy-950/75 to-navy-950/10" aria-hidden="true" />
          </>
        ) : (
        <svg
          viewBox="0 0 600 420"
          className="pointer-events-none absolute bottom-0 right-0 hidden h-105 w-150 opacity-50 lg:block"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-win" width="16" height="20" patternUnits="userSpaceOnUse">
              <rect x="4" y="5" width="8" height="10" rx="1" fill="#0e2f4c" opacity="0.55" />
            </pattern>
          </defs>
          {[
            [60, 210, 90, "#1c4a72"],
            [165, 90, 120, "#24567f"],
            [300, 150, 105, "#1c4a72"],
            [420, 40, 130, "#2b6290"],
          ].map(([x, y, w, fill]) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={420 - y} fill={fill} />
              <rect x={x} y={y} width={w} height={420 - y} fill="url(#hero-win)" />
            </g>
          ))}
        </svg>
        )}

        <Container className={`relative flex flex-col gap-6 py-14 sm:py-16 lg:pb-24 ${NEW_DESIGN ? "lg:py-24" : ""}`}>
          <span className="self-start rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold">
            {h.badge(t.count(s.total, d.forms.project))}
          </span>
          <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-5xl sm:leading-[1.12]">
            {h.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-navy-200">{h.lead}</p>

          <form action={t.href("/novostroyki")} className="flex max-w-4xl flex-col gap-4 rounded-2xl bg-white p-4 text-ink sm:p-5">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">{h.statusLegend}</legend>
              {statuses.map(([value, label]) => (
                <label key={label} className="cursor-pointer">
                  <input type="radio" name="status" value={value} defaultChecked={value === "building"} className="peer sr-only" />
                  <span className="flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold transition-colors peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-cta">
                    {label}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_0.8fr_auto] lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hero-region" className="text-xs font-semibold text-muted">{h.region}</label>
                <select id="hero-region" name="region" className={selectClass} defaultValue="">
                  <option value="">{h.allRegions}</option>
                  {regions.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {t.place(r)} · {r.count}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hero-district" className="text-xs font-semibold text-muted">{h.district}</label>
                <select id="hero-district" name="district" className={selectClass} defaultValue="">
                  <option value="">{h.anyDistrict}</option>
                  {regions.map((r) => (
                    <optgroup key={r.slug} label={t.place(r)}>
                      {allDistricts
                        .filter((x) => x.region === r.slug)
                        .map((x) => (
                          <option key={x.slug} value={x.slug}>
                            {t.place(x)} · {x.count}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hero-rooms" className="text-xs font-semibold text-muted">{h.rooms}</label>
                <select id="hero-rooms" name="rooms" className={selectClass} defaultValue="">
                  <option value="">{d.rooms.any}</option>
                  <option value="0">{d.rooms.studio}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hero-year" className="text-xs font-semibold text-muted">{h.year}</label>
                <select id="hero-year" name="year" className={selectClass} defaultValue="">
                  <option value="">{h.anyYear}</option>
                  {bars.map((b) => (
                    <option key={b.label} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="h-12 rounded-xl bg-cta px-8 font-bold text-white transition-colors hover:bg-cta-hover">
                {h.find}
              </button>
            </div>
            <Link href={t.href("/novostroyki")} className="self-start text-sm font-semibold text-navy-900 hover:underline">
              {h.allFilters}
            </Link>
          </form>
        </Container>
      </section>

      <Container className="relative -mt-7">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <li key={tile.label}>
              <Link
                href={tile.href}
                className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-white px-4 py-4 transition-shadow hover:shadow-md"
              >
                <span className={`font-display text-2xl font-semibold ${tile.color}`}>{t.num(tile.n)}</span>
                <span className="text-sm text-muted">{tile.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pt-14">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <SectionTitle>{h.newBuildings}</SectionTitle>
          <Link href={catalog("status=building")} className="font-semibold text-navy-900 hover:underline">
            {h.seeAll(s.building)}
          </Link>
        </div>
        <Suspense fallback={<CardGridSkeleton />}>
          <HomeProjects searchParams={searchParams} projects={projects} />
        </Suspense>
      </Container>

      <Container className="pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <SectionTitle>{h.developers}</SectionTitle>
          <Link href={t.href("/zastroyshchiki")} className="font-semibold text-navy-900 hover:underline">
            {h.allDevelopers(s.developers)}
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {devs.map((dev) => (
            <li key={dev.slug}>
              <Link
                href={t.href(`/zastroyshchiki/${dev.slug}`)}
                className="flex h-full items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-sm font-bold text-navy-900">
                  {initials(dev.name)}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate">{dev.name}</strong>
                  <span className="text-[13px] text-muted">
                    {t.count(dev.total, d.forms.project)} · {h.devBuilding(dev.building)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="grid gap-5 pt-14 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-3xl bg-navy-900 p-6 text-white sm:p-8">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-navy-200">{h.forecastKicker}</p>
            <h2 className="mt-2 font-display text-xl font-semibold">{h.forecastTitle}</h2>
          </div>
          <PipelineChart bars={bars} dark height={200} />
          <Link href={t.href("/budushchee")} className="flex min-h-11 items-center self-start rounded-xl bg-white px-4 text-sm font-bold text-navy-900">
            {h.forecastLink}
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <SectionTitle className="text-xl!">{h.bigAnnouncements}</SectionTitle>
          {megas.map((m) => (
            <Link
              key={m.slug}
              href={t.href(`/zhk/${m.slug}`)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md"
            >
              <span className="min-w-0 flex-1 basis-56">
                <strong className="block">{t.name(m)}</strong>
                <span className="text-[13px] text-muted">
                  {[m.floorsMax && d.upToFloors(m.floorsMax), t.usd(m.investmentUsd), m.landAreaHa && `${t.dec(m.landAreaHa)} ${d.units.ha}`]
                    .filter(Boolean)
                    .join(" · ") || t.place(m.region)}
                </span>
              </span>
              <span className="font-display text-lg font-semibold text-planned-text">
                {t.num(m.apartments)} {d.units.apts}
              </span>
            </Link>
          ))}
          {noYear > 0 && <p className="text-sm text-muted">{h.noYear(t.count(noYear, d.forms.project))}</p>}
        </div>
      </Container>

      <Container id="ceny" className="scroll-mt-24 pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <SectionTitle>{h.pricesTitle}</SectionTitle>
          <span className="text-sm text-muted">{h.pricesSub}</span>
        </div>
        <ul className="rounded-2xl border border-line bg-white px-4 sm:px-6">
          {tashkentDistricts.map((x) => (
            <li key={x.slug} className="border-b border-line last:border-0">
              <Link
                href={catalog(`region=tashkent&district=${x.slug}`)}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5 hover:text-navy-700"
              >
                <span className="w-full font-semibold sm:w-48">{t.place(x)}</span>
                <span className="h-2.5 min-w-24 flex-1 rounded-full bg-canvas">
                  <span className="block h-2.5 rounded-full bg-navy-900" style={{ width: `${Math.round((x.count / maxDistrict) * 100)}%` }} />
                </span>
                <span className="w-28 text-right font-semibold">{t.count(x.count, d.forms.project)}</span>
                <span className="w-40 text-right text-sm text-muted">
                  {x.avgPrice ? `${t.mln(x.avgPrice)} ${d.units.perM2}` : d.noData}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container id="podbor" className="grid scroll-mt-24 gap-5 py-14 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6 rounded-3xl border border-line bg-white p-6 sm:p-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <SectionTitle className="text-xl!">{h.pickTitle}</SectionTitle>
            <p className="leading-relaxed text-muted">{h.pickText}</p>
          </div>
          <LeadForm labels={d.lead} policyHref={t.href("/politika")} idPrefix="home-lead" />
        </div>
        <div className="flex flex-col gap-5 rounded-3xl bg-navy-100 p-6 sm:p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0088cc] text-white shadow-md" aria-hidden="true">
            <TelegramIcon className="h-7 w-7" />
          </span>
          <div className="flex flex-col gap-2">
            <strong className="text-xl">{h.telegramTitle}</strong>
            <p className="leading-relaxed text-navy-800">{h.telegramText}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {h.telegramSteps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0077b3]">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-navy-900">{step}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <a
              href={`https://t.me/${TELEGRAM_BOT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-2xl bg-[#0088cc] px-6 text-lg font-bold text-white shadow-md transition-colors hover:bg-[#0077b3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0088cc]"
            >
              <TelegramIcon className="h-5 w-5" />
              {h.telegramButton}
            </a>
            <span className="text-center text-sm font-medium text-navy-800">@{TELEGRAM_BOT}</span>
          </div>
        </div>
      </Container>

      <section className="bg-navy-950 text-white">
        <Container className="flex flex-col gap-7 py-14">
          <div>
            <SectionTitle>{h.trustTitle}</SectionTitle>
            <p className="mt-3 max-w-3xl leading-relaxed text-navy-200">{h.trustText}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUALITY_KEYS.map((key) => (
              <li key={key} className="flex flex-col gap-2.5 rounded-2xl border border-white/15 p-5">
                <span className={`self-start rounded-full px-3 py-1 text-[13px] font-bold ${QUALITY_STYLE[key]}`}>
                  {d.quality[key].label}
                </span>
                <span className="text-sm leading-relaxed text-navy-200">{d.quality[key].text}</span>
                <span className="mt-auto text-sm font-semibold">
                  {h.inDb(t.num(projects.filter((p) => p.quality === key).length))}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
