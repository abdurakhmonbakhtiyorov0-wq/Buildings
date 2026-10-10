import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QualityBadge, StatusBadge } from "@/components/Badges";
import LeadForm from "@/components/LeadForm";
import ProjectCard from "@/components/ProjectCard";
import ProjectCover from "@/components/ProjectCover";
import ProjectGallery from "@/components/ProjectGallery";
import { Container, SectionTitle } from "@/components/ui";
import { getProject, getProjects } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

// При сборке заранее рисуем только популярные страницы: все ~550 ЖК × 3 языка
// не укладываются в лимиты сборки. Остальные рисуются при первом открытии и кэшируются.
const PRERENDER_PROJECTS = 24;

export async function generateStaticParams() {
  const projects = await getProjects();
  const popular = projects.filter((p) => p.status === "building" && p.images.length > 0).slice(0, PRERENDER_PROJECTS);
  return (popular.length ? popular : projects.slice(0, 1)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [t, p] = await Promise.all([getI18n(), getProject(slug)]);
  if (!p) return { title: t.d.project.notFound };
  return {
    title: t.name(p),
    description: t.d.project.metaDescription(t.name(p), t.place(p.district ?? p.region), t.completion(p.year, p.quarter)),
  };
}

function Fact({ label, value, empty }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className={value ? "mt-1 text-lg font-bold" : "mt-1.5 font-medium text-muted"}>{value ?? empty}</dd>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-7">
      <SectionTitle className="text-xl! sm:text-[22px]!">{title}</SectionTitle>
      {children}
    </section>
  );
}

function Steps({ status, labels, date }) {
  const current = ["planned", "building", "completed"].indexOf(status);
  const steps = [
    { title: labels.permits, text: status === "planned" ? labels.announced : labels.passed },
    {
      title: labels.construction,
      text: status === "building" ? labels.inProgress : status === "completed" ? labels.passed : labels.notStarted,
    },
    { title: labels.handover, text: status === "completed" ? labels.done(date) : labels.plan(date) },
  ];
  return (
    <ol className="grid gap-5 sm:grid-cols-3">
      {steps.map((s, i) => {
        const state = i < current || status === "completed" ? "done" : i === current ? "now" : "next";
        const dot =
          state === "done" ? "bg-done" : state === "now" ? "bg-building ring-4 ring-building-soft" : "border-2 border-slate-300 bg-white";
        return (
          <li key={s.title} className="flex flex-col gap-2">
            <span className={`h-4 w-4 rounded-full ${dot}`} aria-hidden="true" />
            <strong>{s.title}</strong>
            <span className="text-sm text-muted">{s.text}</span>
          </li>
        );
      })}
    </ol>
  );
}

async function ProjectDetails({ params }) {
  const { slug } = await params;
  const [t, p, projects] = await Promise.all([getI18n(), getProject(slug), getProjects()]);
  if (!p) notFound();
  const { d } = t;
  const pr = d.project;

  const placeKey = p.district?.slug ?? p.region.slug;
  const similar = projects
    .filter((x) => x.slug !== p.slug && x.status === "building" && (x.district?.slug ?? x.region.slug) === placeKey)
    .slice(0, 3);
  const terms = [
    [pr.termLabels.installment, p.installment == null ? null : p.installment ? pr.yes : pr.no],
    [pr.termLabels.mortgage, p.mortgageRate != null ? pr.mortgageFrom(t.dec(p.mortgageRate)) : null],
    [pr.termLabels.offer, p.specialOffer ? pr.yes : null],
    [pr.termLabels.finishing, d.finishing[p.finishing] ?? null],
  ];
  const facts = [
    [pr.facts.completion, p.year ? t.completion(p.year, p.quarter) : null],
    [pr.facts.housingClass, d.housingClass[p.housingClass] ?? null],
    [pr.facts.apartments, t.num(p.apartments)],
    [pr.facts.floors, p.floorsMax ? pr.upTo(p.floorsMax) : null],
    ...(p.buildingsCount ? [[pr.facts.buildings, t.num(p.buildingsCount)]] : []),
    ...(p.landAreaHa ? [[pr.facts.land, `${t.dec(p.landAreaHa)} ${d.units.ha}`]] : []),
    ...(p.residents ? [[pr.facts.residents, t.num(p.residents)]] : []),
    ...(p.investmentUsd ? [[pr.facts.investment, t.usd(p.investmentUsd)]] : []),
  ];
  const priceRange = t.priceRange(p.priceFrom, p.priceTo);
  const notes = t.notes(p);
  const date = t.completion(p.year, p.quarter);

  return (
    <>
      <nav aria-label={d.breadcrumbs} className="text-sm text-muted">
        <Link href={t.href("/")} className="hover:text-navy-900">{d.catalog.home}</Link> /{" "}
        <Link href={t.href("/novostroyki")} className="hover:text-navy-900">{d.nav.catalog}</Link> /{" "}
        <Link href={t.href(`/novostroyki?region=${p.region.slug}`)} className="hover:text-navy-900">{t.place(p.region)}</Link> / {t.name(p)}
      </nav>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={p.status} />
        {p.housingClass && (
          <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-900">{d.housingClass[p.housingClass]}</span>
        )}
        <QualityBadge quality={p.quality} />
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">{t.name(p)}</h1>
      <p className="mt-2 text-lg text-muted">
        {[t.place(p.district ?? p.region), p.address].filter(Boolean).join(" · ")}
        {p.developer && (
          <>
            {` · ${pr.developer} `}
            <Link href={t.href(`/zastroyshchiki/${p.developer.slug}`)} className="font-semibold text-navy-900 hover:underline">
              {p.developer.name}
            </Link>
          </>
        )}
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {p.images.length > 0 ? (
            <ProjectGallery images={p.images} name={t.name(p)} />
          ) : (
            <div className="relative overflow-hidden rounded-3xl">
              <ProjectCover project={p} priority className="h-64 sm:h-96" sizes="(min-width: 1024px) 60vw, 100vw" />
              <p className="absolute bottom-4 left-4 max-w-sm rounded-xl bg-white/95 px-4 py-2.5 text-sm text-muted">{pr.photo}</p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {facts.map(([label, value]) => (
              <Fact key={label} label={label} value={value} empty={d.noData} />
            ))}
          </dl>

          <Panel title={pr.location.title}>
            <dl className="grid gap-3 sm:grid-cols-3">
              {[
                [pr.location.region, t.place(p.region)],
                [pr.location.district, t.place(p.district)],
                [pr.location.address, p.address],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-canvas px-4 py-3">
                  <dt className="text-[13px] text-muted">{label}</dt>
                  <dd className={value ? "mt-0.5 font-semibold" : "mt-0.5 text-muted"}>{value ?? d.noData}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={p.map.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy-900 px-5 font-bold text-white transition-colors hover:bg-navy-950"
              >
                <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
                  <path
                    d="M11 20s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10zM11 12a2 2 0 100-4 2 2 0 000 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {pr.location.open}
              </a>
              <p className="flex-1 basis-64 text-sm text-muted">{p.map.exact ? pr.location.exact : pr.location.search}</p>
            </div>
          </Panel>

          {notes && (
            <Panel title={pr.notes}>
              <p lang={notes.lang} className="leading-relaxed text-ink">{notes.text}</p>
              {!notes.translated && pr.notesLanguage && <p className="text-sm text-muted">{pr.notesLanguage}</p>}
            </Panel>
          )}

          <Panel title={pr.layouts}>
            {p.layouts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-120 text-left">
                    <thead className="text-[13px] text-muted">
                      <tr>
                        <th scope="col" className="pb-2 font-medium">{pr.table.apartment}</th>
                        <th scope="col" className="pb-2 font-medium">{pr.table.area}</th>
                        <th scope="col" className="pb-2 font-medium">{pr.table.perM2}</th>
                        <th scope="col" className="pb-2 text-right font-medium">{pr.table.price}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.layouts.map((l, i) => (
                        <tr key={`${l.rooms}-${l.area}-${i}`} className="border-t border-line">
                          <th scope="row" className="py-3.5 font-semibold">{d.rooms.long(l.rooms)}</th>
                          <td className="py-3.5">{t.area(l.area)}</td>
                          <td className="py-3.5">{t.money(l.priceM2) ?? "—"}</td>
                          <td className={`py-3.5 text-right ${l.price ? "text-lg font-bold" : "text-muted"}`}>
                            {t.money(l.price) ?? d.card.negotiable}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted">{pr.layoutsNote}</p>
              </>
            ) : (
              <p className="text-muted">{pr.noLayouts}</p>
            )}
          </Panel>

          <Panel title={pr.progress}>
            <Steps status={p.status} labels={pr.steps} date={date} />
          </Panel>

          <Panel title={pr.terms}>
            <dl className="grid gap-3 sm:grid-cols-2">
              {terms.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 rounded-xl bg-canvas px-4 py-3">
                  <dt>{label}</dt>
                  <dd className={value ? "font-bold text-done-text" : "text-muted"}>{value ?? d.noData}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title={pr.sources}>
            <p className="flex flex-wrap items-center gap-3">
              <QualityBadge quality={p.quality} />
              <span className="text-muted">{d.quality[p.quality]?.text}</span>
            </p>
            <ul className="flex flex-col gap-2">
              {p.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-900 hover:underline">
                    {s.name}
                  </a>
                  <span className="text-sm text-muted"> · {pr.fetched(s.fetchedOn)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:w-96 lg:shrink-0">
          <div className="flex flex-col gap-2 rounded-3xl bg-navy-900 p-6 text-white">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-navy-200">{pr.price}</span>
            <span className="font-display text-2xl font-semibold leading-snug">{priceRange ?? pr.priceNone}</span>
            {p.cheapest && <span className="text-navy-200">{pr.aptsFrom(t.money(p.cheapest))}</span>}
            <span className="text-navy-200">{pr.completionLine(date)}</span>
            <Link
              href={t.href(`/ipoteka${p.cheapest ? `?price=${p.cheapest}` : ""}`)}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 font-bold text-navy-900 transition-colors hover:bg-navy-100"
            >
              {d.mortgageCalc.fromProject}
            </Link>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="mb-1 text-lg font-bold">{pr.leadTitle}</h2>
            <p className="mb-4 text-sm text-muted">{pr.leadText}</p>
            <LeadForm labels={d.lead} policyHref={t.href("/politika")} projectId={p.id} idPrefix="project-lead" />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <SectionTitle className="mb-5">{pr.nearby}</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((x) => (
              <ProjectCard key={x.slug} project={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function ProjectPage({ params }) {
  return (
    <Container className="py-8 sm:py-10">
      <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-3xl bg-white" aria-busy="true" />}>
        <ProjectDetails params={params} />
      </Suspense>
    </Container>
  );
}
