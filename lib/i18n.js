import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { i18nFor } from "@/lib/i18n-core";
import { hasLocale } from "@/lib/locales";

export { i18nFor };

export async function getI18n() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return i18nFor(locale);
}
