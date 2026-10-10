import Link from "next/link";
import { Container } from "@/components/ui";
import { getI18n } from "@/lib/i18n";

export default async function NotFound() {
  const t = await getI18n();
  const n = t.d.notFound;
  return (
    <Container className="flex flex-col items-start gap-4 py-20">
      <span className="font-display text-5xl font-semibold text-navy-900">404</span>
      <h1 className="text-2xl font-bold">{n.title}</h1>
      <p className="text-muted">{n.text}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={t.href("/novostroyki")} className="flex min-h-11 items-center rounded-xl bg-navy-900 px-5 font-bold text-white">
          {n.catalog}
        </Link>
        <Link href={t.href("/")} className="flex min-h-11 items-center rounded-xl border border-line bg-white px-5 font-semibold">
          {n.home}
        </Link>
      </div>
    </Container>
  );
}
