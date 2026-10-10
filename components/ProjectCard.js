import Link from "next/link";
import { QualityBadge, StatusBadge, Tag } from "@/components/Badges";
import ProjectCover from "@/components/ProjectCover";
import { getI18n } from "@/lib/i18n";

export function projectTags(p, d, t) {
  const tags = [];
  if (p.installment) tags.push(d.card.installment);
  if (p.mortgageRate != null) tags.push(d.card.mortgage(t.dec(p.mortgageRate)));
  if (p.specialOffer) tags.push(d.card.offer);
  return tags;
}

export default async function ProjectCard({ project: p }) {
  const t = await getI18n();
  const { d } = t;
  const place = t.place(p.district ?? p.region);
  const meta = [place, p.developer?.name, d.housingClass[p.housingClass]].filter(Boolean).join(" · ");
  const tags = projectTags(p, d, t);
  const href = t.href(`/zhk/${p.slug}`);
  // Правая цифра карточки: самое полезное из того, что известно о проекте.
  const [statLabel, statValue] = p.priceFrom
    ? [d.card.pricePerM2, t.from(t.mln(p.priceFrom))]
    : p.cheapest
      ? [d.card.aptsPrice, t.from(t.money(p.cheapest))]
      : p.apartments
        ? [d.card.apartments, t.num(p.apartments)]
        : p.floorsMax
          ? [d.card.floors, d.project.upTo(p.floorsMax)]
          : [d.card.pricePerM2, d.card.negotiable];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-200 hover:shadow-lg">
      <div className="relative h-36">
        <ProjectCover project={p} className="h-full" />
        <StatusBadge status={p.status} className="absolute left-3 top-3" />
        <QualityBadge quality={p.quality} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold leading-snug">
            <Link href={href} className="hover:text-navy-700">
              {t.name(p)}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted">{meta}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <div>
            <dt className="text-xs text-muted">{d.card.completion}</dt>
            <dd className="font-semibold">{t.completion(p.year, p.quarter)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-muted">{statLabel}</dt>
            <dd className="font-semibold">{statValue}</dd>
          </div>
        </dl>

        {p.layouts.length > 0 && (
          <ul className="flex flex-col gap-1.5" aria-label={d.card.layouts}>
            {p.layouts.slice(0, 3).map((l, i) => (
              <li
                // Комнаты и площадь могут совпадать у разных планировок (другой этаж или цена).
                key={`${l.rooms}-${l.area}-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-1.5 text-sm"
              >
                <span className="font-semibold">{d.rooms.short(l.rooms)}</span>
                <span className="text-muted">{t.area(l.area)}</span>
                <span className={l.price ? "font-semibold" : "text-muted"}>
                  {l.price ? t.from(t.money(l.price)) : d.card.negotiable}
                </span>
              </li>
            ))}
          </ul>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        <Link
          href={href}
          className="mt-auto flex min-h-11 items-center justify-center rounded-xl border border-navy-900 px-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
          aria-label={d.card.detailsAria(t.name(p))}
        >
          {d.card.details}
        </Link>
      </div>
    </article>
  );
}
