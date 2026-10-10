import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "@/lib/locales";

function preferredLocale(request) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (LOCALES.includes(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (LOCALES.includes(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Всё, кроме служебных путей Next.js и файлов с расширением (картинки, иконки).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
