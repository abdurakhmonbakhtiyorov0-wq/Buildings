import { getI18n } from "@/lib/i18n";

// Столбики по годам сдачи; dark — вариант для тёмного фона.
export default async function PipelineChart({ bars, noYear = 0, dark = false, height = 220 }) {
  const t = await getI18n();
  const items = noYear ? [...bars, { label: t.d.chart.noYear, n: noYear, muted: true }] : bars;
  const max = Math.max(...items.map((b) => b.n), 1);
  const text = dark ? "text-white" : "text-ink";
  const sub = dark ? "text-navy-200" : "text-muted";
  const axis = dark ? "border-white/30" : "border-line";

  return (
    <figure className="flex flex-col gap-2">
      <div className={`flex items-end gap-3 border-b px-1 sm:gap-5 ${axis}`} style={{ height }}>
        {items.map((b) => (
          <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className={`text-base font-bold ${text}`}>{b.n}</span>
            <div
              className={`w-full max-w-16 rounded-t-lg ${b.muted ? "bg-planned" : "bg-building"}`}
              style={{ height: `${Math.max(4, (b.n / max) * (height - 40))}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-1 sm:gap-5">
        {items.map((b) => (
          <span key={b.label} className={`flex-1 text-center text-xs font-semibold sm:text-sm ${sub}`}>
            {b.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {items.map((b) => `${b.label}: ${t.count(b.n, t.d.forms.project)}`).join("; ")}
      </figcaption>
    </figure>
  );
}
