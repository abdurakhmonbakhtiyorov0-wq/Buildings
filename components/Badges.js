import { QUALITY_STYLE, STATUS_STYLE } from "@/lib/format";

// Без серверных зависимостей: подписи приходят в d (словарь языка), бейджи рисуются и в браузере.

const base = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold";

export function StatusBadge({ status, d, className = "" }) {
  return <span className={`${base} ${STATUS_STYLE[status].badge} ${className}`}>{d.status[status]}</span>;
}

export function QualityBadge({ quality, d, className = "" }) {
  const key = QUALITY_STYLE[quality] ? quality : "unverified";
  return (
    <span className={`${base} font-semibold ${QUALITY_STYLE[key]} ${className}`} title={d.quality[key].text}>
      {d.quality[key].label}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-900">
      {children}
    </span>
  );
}
