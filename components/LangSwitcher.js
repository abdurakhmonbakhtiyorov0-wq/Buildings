"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_LABELS, LOCALES } from "@/lib/locales";

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);

export default function LangSwitcher({ current, label }) {
  const pathname = usePathname();
  const router = useRouter();
  const rest = pathname.replace(LOCALE_PREFIX, "");

  return (
    <nav aria-label={label} className="flex shrink-0 overflow-hidden rounded-xl border border-line">
      {LOCALES.map((locale) => {
        const href = `/${locale}${rest}`;
        return (
          <a
            key={locale}
            href={href}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
              router.push(href + window.location.search);
            }}
            className="flex h-11 min-w-11 items-center justify-center px-2.5 text-sm font-semibold transition-colors hover:bg-navy-100 aria-[current=true]:bg-navy-900 aria-[current=true]:text-white"
          >
            {LOCALE_LABELS[locale]}
          </a>
        );
      })}
    </nav>
  );
}
