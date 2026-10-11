import Link from "next/link";
import { Suspense } from "react";
import Catalog from "@/components/Catalog";
import { CardGridSkeleton, Container } from "@/components/ui";
import { slimProject } from "@/lib/catalog";
import { getProjects } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.catalog.metaTitle, description: d.catalog.metaDescription };
}

// Все проекты приходят в браузер вместе со страницей, дальше фильтры работают без запросов к серверу.
async function CatalogData({ searchParams }) {
  // Чтение searchParams рендерит каталог по запросу: первый HTML уже отфильтрован по адресу.
  await searchParams;
  const [t, projects] = await Promise.all([getI18n(), getProjects()]);
  return <Catalog lang={t.lang} projects={projects.map(slimProject)} />;
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
        <CatalogData searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
