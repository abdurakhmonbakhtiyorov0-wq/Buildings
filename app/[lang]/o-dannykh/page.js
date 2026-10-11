import { QualityBadge } from "@/components/Badges";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/data";
import { QUALITY_KEYS } from "@/lib/format";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.about.metaTitle, description: d.about.metaDescription };
}

const SOURCES = [
  ["domtut.uz", "https://domtut.uz/catalog-nedvijimosty", "domtut"],
  ["stroyka.uz", "https://stroyka.uz/novostroyki", "stroyka"],
  ["kun.uz, spot.uz, gov.uz", null, "news"],
];

export default async function AboutDataPage() {
  const t = await getI18n();
  const a = t.d.about;
  const { source, projects } = await getCatalog();
  return (
    <Container className="max-w-3xl! py-10">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{a.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {a.intro(t.count(projects.length, t.d.forms.project), source === "supabase")}
      </p>

      <h2 className="mt-10 text-xl font-bold">{a.sourcesTitle}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {SOURCES.map(([name, url, key]) => (
          <li key={name} className="rounded-2xl border border-line bg-white p-5">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-900 hover:underline">
                {name}
              </a>
            ) : (
              <strong>{name}</strong>
            )}
            <p className="mt-1 text-muted">{a.sources[key]}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-bold">{a.qualityTitle}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {QUALITY_KEYS.map((key) => (
          <li key={key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-5">
            <QualityBadge quality={key} d={t.d} />
            <span className="text-muted">{t.d.quality[key].text}</span>
            <span className="ml-auto text-sm font-semibold">
              {t.d.home.inDb(t.num(projects.filter((p) => p.quality === key).length))}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-bold">{a.limitsTitle}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
        {a.limits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Container>
  );
}
