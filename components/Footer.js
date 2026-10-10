import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/lib/i18n";

export default async function Footer() {
  const t = await getI18n();
  const { d } = t;
  const regions = [
    ["tashkent", { ru: "Ташкент", uz: "Toshkent", en: "Tashkent" }],
    ["tashkent-region", { ru: "Ташкентская область", uz: "Toshkent viloyati", en: "Tashkent Region" }],
    ["samarkand", { ru: "Самарканд", uz: "Samarqand", en: "Samarkand" }],
    ["fergana", { ru: "Фергана", uz: "Fargʻona", en: "Fergana" }],
    ["andijan", { ru: "Андижан", uz: "Andijon", en: "Andijan" }],
    ["jizzakh", { ru: "Джизак", uz: "Jizzax", en: "Jizzakh" }],
  ];
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div className="flex flex-col gap-3 leading-relaxed">
          <div className="flex items-center gap-2.5">
            <Image src="/novaro-logo.jpg" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="font-display font-semibold tracking-[0.08em] text-navy-900">NOVARO</span>
          </div>
          <p>{d.footer.disclaimer}</p>
        </div>
        <nav aria-label={d.footer.byRegion} className="flex flex-col gap-2">
          <strong className="text-ink">{d.footer.byRegion}</strong>
          {regions.map(([slug, names]) => (
            <Link key={slug} href={t.href(`/novostroyki?region=${slug}`)} className="hover:text-navy-900">
              {names[t.lang]}
            </Link>
          ))}
        </nav>
        <nav aria-label={d.footer.sections} className="flex flex-col gap-2">
          <strong className="text-ink">{d.footer.sections}</strong>
          <Link href={t.href("/novostroyki")} className="hover:text-navy-900">{d.footer.catalog}</Link>
          <Link href={t.href("/budushchee")} className="hover:text-navy-900">{d.nav.future}</Link>
          <Link href={t.href("/zastroyshchiki")} className="hover:text-navy-900">{d.nav.developers}</Link>
          <Link href={t.href("/o-dannykh")} className="hover:text-navy-900">{d.footer.about}</Link>
          <Link href={t.href("/politika")} className="hover:text-navy-900">{d.legal.metaTitle}</Link>
        </nav>
        <div className="flex flex-col gap-2">
          <strong className="text-ink">{d.footer.sources}</strong>
          <span>domtut.uz, stroyka.uz, kun.uz, spot.uz, gov.uz</span>
        </div>
      </div>
    </footer>
  );
}
