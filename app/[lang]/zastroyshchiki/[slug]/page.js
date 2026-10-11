import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProjectCard from "@/components/ProjectCard";
import { CardGridSkeleton, Container } from "@/components/ui";
import { getProjects } from "@/lib/data";
import { STATUS_KEYS } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { developerList, initials } from "@/lib/stats";

// При сборке рисуем только топ застройщиков (их же показывает страница-список);
// страницы остальных рисуются при первом открытии и кэшируются.
const PRERENDER_DEVELOPERS = 10;

export async function generateStaticParams() {
  return developerList(await getProjects())
    .slice(0, PRERENDER_DEVELOPERS)
    .map((dev) => ({ slug: dev.slug }));
}

async function findDeveloper(slug) {
  return developerList(await getProjects()).find((dev) => dev.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [{ d }, dev] = await Promise.all([getI18n(), findDeveloper(slug)]);
  return { title: dev ? d.developers.projectsTitle(dev.name) : d.developers.notFound };
}

const ORDER = ["building", "planned", "completed"].filter((s) => STATUS_KEYS.includes(s));

async function DeveloperDetails({ params }) {
  const { slug } = await params;
  const [t, dev] = await Promise.all([getI18n(), findDeveloper(slug)]);
  if (!dev) notFound();
  const { d } = t;

  const groups = ORDER.map((status) => ({ status, projects: dev.projects.filter((p) => p.status === status) })).filter(
    (g) => g.projects.length,
  );

  return (
    <>
      <nav aria-label={d.breadcrumbs} className="mb-4 text-sm text-muted">
        <Link href={t.href("/")} className="hover:text-navy-900">{d.catalog.home}</Link> /{" "}
        <Link href={t.href("/zastroyshchiki")} className="hover:text-navy-900">{d.developers.title}</Link> / {dev.name}
      </nav>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-100 text-xl font-bold text-navy-900">
          {initials(dev.name)}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{dev.name}</h1>
          <p className="mt-1 text-muted">
            {d.developers.inDb(t.count(dev.total, d.forms.project))} ·{" "}
            {groups.map((g) => `${d.status[g.status]}: ${g.projects.length}`).join(", ")}
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-2xl rounded-2xl bg-news-soft px-4 py-3 text-sm text-news-text">{d.developers.note}</p>

      {groups.map((g) => (
        <section key={g.status} className="mt-10">
          <h2 className="mb-4 text-xl font-bold">
            {d.status[g.status]} · {g.projects.length}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {g.projects.map((p) => (
              <ProjectCard key={p.slug} project={p} t={t} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default function DeveloperPage({ params }) {
  return (
    <Container className="py-8 sm:py-10">
      <Suspense fallback={<CardGridSkeleton />}>
        <DeveloperDetails params={params} />
      </Suspense>
    </Container>
  );
}
