import Link from "next/link";
import { Suspense } from "react";
import MortgageCalculator from "@/components/MortgageCalculator";
import { Container } from "@/components/ui";
import { BANKS, RATES_CHECKED_AT } from "@/data/banks";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.mortgageCalc.metaTitle, description: d.mortgageCalc.metaDescription };
}

// ?price=650000000 — стоимость подставляется со страницы ЖК («Рассчитать ипотеку»).
async function Calculator({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  const sp = await searchParams;
  const price = Number.parseInt(String(sp.price ?? ""), 10);
  const checkedAt = new Intl.DateTimeFormat(t.intl, { dateStyle: "long" }).format(new Date(RATES_CHECKED_AT));
  const labels = {
    ...d.mortgageCalc.labels,
    mln: d.units.mln,
    bln: d.units.bln,
    disclaimer: d.mortgageCalc.disclaimer(checkedAt),
  };
  return <MortgageCalculator labels={labels} locale={t.intl} initialPrice={Number.isFinite(price) ? price : null} />;
}

export default async function MortgagePage({ searchParams }) {
  const t = await getI18n();
  const { d } = t;
  return (
    <Container className="py-8 sm:py-10">
      <nav aria-label={d.breadcrumbs} className="mb-3 text-sm text-muted">
        <Link href={t.href("/")} className="hover:text-navy-900">{d.catalog.home}</Link> / {d.mortgageCalc.title}
      </nav>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{d.mortgageCalc.title}</h1>
      <p className="mb-6 mt-2 max-w-2xl text-muted">{d.mortgageCalc.intro(BANKS.length)}</p>
      <Suspense fallback={<div className="h-[70vh] animate-pulse rounded-3xl bg-white" aria-busy="true" />}>
        <Calculator searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
