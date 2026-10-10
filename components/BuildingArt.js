import { STATUS_STYLE } from "@/lib/format";

const TOWERS = [
  { x: 26, w: 72, opacity: 1 },
  { x: 110, w: 90, opacity: 0.88 },
  { x: 212, w: 80, opacity: 0.72 },
];

function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

// Схематичные дома вместо фото: высоты зависят от slug, цвет — от статуса.
export default function BuildingArt({ slug, status, className = "" }) {
  const { tone, ground } = STATUS_STYLE[status] ?? STATUS_STYLE.building;
  const h = hash(slug);
  const patternId = `win-${slug}`;
  return (
    <div className={className} style={{ background: ground }} aria-hidden="true">
      <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
        <defs>
          <pattern id={patternId} width="14" height="16" patternUnits="userSpaceOnUse">
            <rect x="3" y="4" width="7" height="8" rx="1" fill="#fff" opacity="0.6" />
          </pattern>
        </defs>
        {TOWERS.map((t, i) => {
          const height = 55 + ((h >>> (i * 7)) % 85);
          return (
            <g key={t.x}>
              <rect x={t.x} y={150 - height} width={t.w} height={height} fill={tone} opacity={t.opacity} />
              <rect x={t.x} y={150 - height} width={t.w} height={height} fill={`url(#${patternId})`} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
