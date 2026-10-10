"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Галерея на странице ЖК: клик по миниатюре показывает это фото крупно.
export default function ProjectGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const mainRef = useRef(null);
  const current = images[active] ?? images[0];

  function select(i) {
    setActive(i);
    // Если большое фото ушло за верх экрана — плавно вернуть его в видимую область.
    mainRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={mainRef} className="relative h-64 overflow-hidden rounded-3xl bg-canvas sm:h-96">
        <Image
          key={current.url}
          src={current.url}
          alt={current.caption ?? name}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          loading="eager"
          fetchPriority={active === 0 ? "high" : "auto"}
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => select(i)}
                aria-pressed={i === active}
                aria-label={img.caption ?? `${name} — ${i + 1}`}
                className={`relative block h-24 w-full cursor-pointer overflow-hidden rounded-xl transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 sm:h-28 ${
                  i === active ? "ring-2 ring-navy-900 ring-offset-2" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {current.caption && <p className="text-sm text-muted">{current.caption}</p>}
    </div>
  );
}
