"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { NEW_DESIGN } from "@/lib/experiment";

function CalculatorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3M8.5 18h.01M12 18h.01" />
    </svg>
  );
}

export default function NavLinks({ lang, labels, switcher }) {
  const pathname = usePathname();
  const menuRef = useRef(null);
  const mortgageHref = `/${lang}/ipoteka`;
  const links = [
    { href: `/${lang}/novostroyki`, label: labels.catalog },
    { href: `/${lang}/budushchee`, label: labels.future },
    { href: `/${lang}/zastroyshchiki`, label: labels.developers },
    { href: `/${lang}#ceny`, label: labels.prices },
    // В новом дизайне ипотека — отдельная кнопка справа (см. ниже), а не пункт меню.
    ...(NEW_DESIGN ? [] : [{ href: mortgageHref, label: labels.mortgage }]),
  ];
  const isActive = (href) => !href.includes("#") && pathname.startsWith(href);

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  return (
    <>
      <nav aria-label={labels.mainMenu} className="hidden flex-1 items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className="whitespace-nowrap rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-navy-100 aria-[current=page]:bg-navy-100 aria-[current=page]:font-semibold aria-[current=page]:text-navy-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {NEW_DESIGN && (
        <Link
          href={mortgageHref}
          aria-current={isActive(mortgageHref) ? "page" : undefined}
          title={labels.mortgageCalc}
          aria-label={labels.mortgageCalc}
          className="ml-auto hidden h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-planned px-3.5 text-sm font-semibold text-planned-text transition-colors hover:bg-planned-soft aria-[current=page]:bg-planned-soft lg:inline-flex"
        >
          <CalculatorIcon />
          {labels.mortgage}
        </Link>
      )}
      <Link
        href={`/${lang}#podbor`}
        className={`${NEW_DESIGN ? "" : "ml-auto "}hidden h-11 shrink-0 items-center whitespace-nowrap rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition-colors hover:bg-navy-950 xl:inline-flex`}
      >
        {labels.pick}
      </Link>
      <div className={NEW_DESIGN ? "ml-auto lg:ml-0" : "ml-auto xl:ml-0"}>{switcher}</div>

      <details ref={menuRef} className="group relative lg:hidden">
        <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-line [&::-webkit-details-marker]:hidden">
          <span className="sr-only">{labels.menu}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </summary>
        <nav aria-label={labels.mainMenu} className="absolute right-0 top-13 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="block rounded-lg px-3 py-3 font-medium hover:bg-navy-100 aria-[current=page]:bg-navy-100"
            >
              {link.label}
            </Link>
          ))}
          {NEW_DESIGN && (
            <Link
              href={mortgageHref}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg border-2 border-planned px-3 py-2.5 font-semibold text-planned-text"
            >
              <CalculatorIcon />
              {labels.mortgageCalc}
            </Link>
          )}
          <Link href={`/${lang}#podbor`} className="mt-1 block rounded-lg bg-navy-900 px-3 py-3 text-center font-bold text-white">
            {labels.pick}
          </Link>
        </nav>
      </details>
    </>
  );
}
