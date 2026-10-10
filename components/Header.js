import Image from "next/image";
import Link from "next/link";
import LangSwitcher from "@/components/LangSwitcher";
import NavLinks from "@/components/NavLinks";
import { getI18n } from "@/lib/i18n";

export default async function Header() {
  const t = await getI18n();
  const { d } = t;
  return (
    <>
      <div className="bg-navy-950 text-[13px] text-navy-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6 lg:px-10">
          <span>{d.topbar.tagline}</span>
          <Link href={t.href("/o-dannykh")} className="font-semibold text-white hover:underline">
            {d.topbar.aboutData}
          </Link>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6 lg:px-10">
          <Link href={t.href("/")} className="flex shrink-0 items-center gap-2.5 text-navy-900" aria-label={d.nav.home}>
            <Image src="/novaro-logo.jpg" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <span className="hidden font-display text-lg font-semibold tracking-[0.08em] sm:inline">NOVARO</span>
          </Link>
          <NavLinks lang={t.lang} labels={d.nav} switcher={<LangSwitcher current={t.lang} label={d.nav.language} />} />
        </div>
      </header>
    </>
  );
}
