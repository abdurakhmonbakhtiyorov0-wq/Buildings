import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import PipelineChart from "@/components/PipelineChart";
import { Container, SectionTitle } from "@/components/ui";
import { getProjects } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { pipeline, regionCounts, summarize } from "@/lib/stats";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.future.metaTitle, description: d.future.metaDescription };
}

export default async function FuturePage() {
  const t = await getI18n();
  const { d } = t;
  const f = d.future;
  const projects = await getProjects();
  const s = summarize(projects);
  const { bars, noYear } = pipeline(projects);
  const upcoming = projects.filter((p) => p.status !== "completed");
  const regions = regionCounts(upcoming);
  const megas = projects
    .filter((p) => p.kind !== "complex")
    .sort((a, b) => (a.status === "completed") - (b.status === "completed") || (b.apartments ?? 0) - (a.apartments ?? 0));
  const megaBuilding = megas.filter((p) => p.status === "building").length;
  const withApartments = upcoming.filter((p) => p.apartments);
  const knownApartments = withApartments.reduce((n, p) => n + p.apartments, 0);

  return (
    <>
      <section className="bg-white">
        <Container className="flex flex-col gap-4 py-12">
          <span className="self-start rounded-full bg-planned-soft px-3 py-1.5 text-[13px] font-semibold text-planned-text">{f.kicker}</span>
          <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-[42px]">{f.title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">{f.lead}</p>
        </Container>
      </section>

      <Container className="grid gap-5 pt-8 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <SectionTitle className="text-xl!">{f.chartTitle}</SectionTitle>
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-building" aria-hidden="true" />{f.legendDated}</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-planned" aria-hidden="true" />{f.legendUndated}</span>
            </div>
          </div>
          <PipelineChart bars={bars} noYear={noYear} height={260} />
          <p className="text-sm leading-relaxed text-muted">
            {f.apartmentsNote(t.num(withApartments.length), t.num(upcoming.length), t.num(knownApartments))}
          </p>
        </section>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 rounded-3xl bg-navy-900 p-6 text-white">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-navy-200">{f.buildingNow}</span>
            <span className="font-display text-5xl font-semibold">{t.num(s.building)}</span>
            <span className="text-navy-200">
              {f.split(t.count(s.building - megaBuilding, d.forms.complex), t.count(megaBuilding, d.forms.massif))}
            </span>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6">
            <strong>{f.where}</strong>
            {regions.map((r) => (
              <div key={r.slug} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span>{t.place(r)}</span>
                  <strong>{r.count}</strong>
                </div>
                <div className="h-2 rounded-full bg-canvas">
                  <div className="h-2 rounded-full bg-navy-900" style={{ width: `${Math.max(3, Math.round((r.count / regions[0].count) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container className="py-12">
        <SectionTitle>{f.bigTitle}</SectionTitle>
        <p className="mb-6 mt-2 max-w-2xl text-muted">{f.bigText}</p>
        <ul className="flex flex-col gap-4">
          {megas.map((m) => (
            <li key={m.slug}>
              <Link
                href={t.href(`/zhk/${m.slug}`)}
                className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 transition-shadow hover:shadow-md sm:p-6 lg:flex-row"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={m.status} d={d} />
                    <span className="rounded-full bg-news-soft px-2.5 py-1 text-xs font-bold text-news-text">
                      {m.sources[0]?.name ?? f.sourceUnknown}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug">{t.name(m)}</h3>
                  {t.notes(m) && (
                    <p lang={t.notes(m).lang} className="leading-relaxed text-muted">
                      {t.notes(m).text}
                    </p>
                  )}
                </div>
                <dl className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:w-105">
                  {[
                    [f.facts.apartments, t.num(m.apartments)],
                    [f.facts.houses, t.num(m.buildingsCount)],
                    [f.facts.floors, m.floorsMax && d.project.upTo(m.floorsMax)],
                    [f.facts.area, m.landAreaHa && `${t.dec(m.landAreaHa)} ${d.units.ha}`],
                    [f.facts.investment, t.usd(m.investmentUsd)],
                    [f.facts.completion, m.year && t.completion(m.year, m.quarter)],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-canvas px-3.5 py-3">
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd className="mt-0.5 font-bold">{value}</dd>
                      </div>
                    ))}
                </dl>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 rounded-2xl bg-news-soft px-5 py-4 leading-relaxed text-news-text">{f.disclaimer}</p>
      </Container>
    </>
  );
}
