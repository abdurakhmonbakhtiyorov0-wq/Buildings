"use client";

import Image from "next/image";
import { useState } from "react";
import { BANKS, monthlyPayment } from "@/data/banks";

const PRICE_MIN = 100_000_000;
const PRICE_MAX = 5_000_000_000;
const DOWN_CHIPS = [15, 20, 30, 40, 50];
const YEAR_CHIPS = [5, 10, 15, 20];
const YEARS_MAX = 25;

const digits = (value) => Number(String(value).replace(/\D/g, "")) || 0;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const chip = (active) =>
  `h-10 rounded-xl px-3.5 text-sm font-semibold transition-colors ${
    active ? "bg-navy-900 text-white" : "bg-canvas text-ink hover:bg-navy-100"
  }`;

function MoneyField({ id, label, value, onChange, suffix, min, max, step, nf }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-muted">{label}</label>
      <div className="flex h-14 items-center rounded-xl border border-line bg-white px-4 focus-within:border-navy-900">
        <input
          id={id}
          inputMode="numeric"
          value={nf.format(value)}
          onChange={(e) => onChange(digits(e.target.value))}
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
        />
        <span className="text-muted">{suffix}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-navy-900"
      />
    </div>
  );
}

export default function MortgageCalculator({ labels: l, locale, initialPrice }) {
  const nf = new Intl.NumberFormat(locale);
  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const money = (n) =>
    n >= 1e9 ? `${nf1.format(n / 1e9)} ${l.bln}` : n >= 1e6 ? `${nf1.format(n / 1e6)} ${l.mln}` : `${nf.format(Math.round(n))} ${l.currency}`;

  const startPrice = clamp(initialPrice || 500_000_000, PRICE_MIN, PRICE_MAX);
  const [price, setPrice] = useState(startPrice);
  const [down, setDown] = useState(Math.round(startPrice * 0.3));
  const [years, setYears] = useState(10);
  const [type, setType] = useState("new");

  const loan = Math.max(price - down, 0);
  const downPct = price ? Math.round((down / price) * 100) : 0;
  const offers = BANKS.map((b) => ({ ...b, rate: type === "new" ? b.rateNew : b.rateResale }))
    .filter((b) => b.rate != null)
    .map((b) => {
      const monthly = monthlyPayment(loan, b.rate, years);
      return { ...b, monthly, overpay: monthly * years * 12 - loan };
    })
    .sort((a, b) => a.monthly - b.monthly);

  function changePrice(next) {
    const p = clamp(next, 0, PRICE_MAX * 4);
    setPrice(p);
    setDown((d) => Math.min(d, p));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Карточка по высоте содержимого и «прилипает» при прокрутке длинного списка банков. */}
      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-xl font-bold">{l.formTitle}</h2>

        <MoneyField id="m-price" label={l.price} value={price} onChange={changePrice} suffix={l.currency}
          min={PRICE_MIN} max={PRICE_MAX} step={10_000_000} nf={nf} />

        <div className="flex flex-col gap-3">
          <MoneyField id="m-down" label={`${l.down} · ${downPct}%`} value={down} onChange={(v) => setDown(clamp(v, 0, price))}
            suffix={l.currency} min={0} max={price} step={5_000_000} nf={nf} />
          <div className="flex flex-wrap gap-2">
            {DOWN_CHIPS.map((pct) => (
              <button key={pct} type="button" aria-pressed={downPct === pct} onClick={() => setDown(Math.round((price * pct) / 100))} className={chip(downPct === pct)}>
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="m-years" className="text-sm font-medium text-muted">{l.term}</label>
            <div className="flex h-14 items-center rounded-xl border border-line bg-white px-4 focus-within:border-navy-900">
              <input
                id="m-years"
                inputMode="numeric"
                value={years}
                onChange={(e) => setYears(clamp(digits(e.target.value), 1, YEARS_MAX))}
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
              />
              <span className="text-muted">{l.years}</span>
            </div>
            <input type="range" aria-label={l.term} min={1} max={YEARS_MAX} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-navy-900" />
          </div>
          <div className="flex flex-wrap gap-2">
            {YEAR_CHIPS.map((y) => (
              <button key={y} type="button" aria-pressed={years === y} onClick={() => setYears(y)} className={chip(years === y)}>
                {y} {l.yearsShort}
              </button>
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-label={l.typeLabel} className="flex flex-wrap gap-2">
          {[["new", l.typeNew], ["resale", l.typeResale]].map(([key, label]) => (
            <button key={key} type="button" role="radio" aria-checked={type === key} onClick={() => setType(key)}
              className={`h-12 rounded-xl px-5 font-semibold transition-colors ${type === key ? "bg-cta text-white" : "border border-line bg-white hover:bg-canvas"}`}>
              {label}
            </button>
          ))}
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-canvas p-4">
          <div>
            <dt className="text-xs text-muted">{l.loan}</dt>
            <dd className="text-lg font-bold">{money(loan)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{l.banksCount}</dt>
            <dd className="text-lg font-bold">{offers.length}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold">{l.offersTitle}</h2>
        {loan === 0 ? (
          <p className="rounded-2xl bg-canvas p-5 text-muted">{l.noLoan}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line" aria-live="polite">
            {offers.map((b, i) => (
              <li key={b.id} className="flex flex-col gap-4 py-5">
                <div className="flex items-center gap-4">
                  <span className="relative h-14 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
                    <Image src={b.logo} alt="" fill sizes="112px" className="object-contain p-2" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block">{b.name}</strong>
                    {i === 0 && <span className="text-xs font-semibold text-done-text">{l.best}</span>}
                  </div>
                  <a
                    href={b.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-canvas px-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
                  >
                    {l.bankSite} ↗
                  </a>
                </div>
                <dl className="grid grid-cols-3 gap-3 rounded-2xl bg-canvas/60 px-4 py-3">
                  <div>
                    <dt className="text-xs text-muted">{l.monthly}</dt>
                    <dd className="whitespace-nowrap font-bold text-navy-900">{money(b.monthly)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{l.rate}</dt>
                    <dd className="whitespace-nowrap font-bold text-navy-900">{nf1.format(b.rate)}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{l.overpay}</dt>
                    <dd className="whitespace-nowrap font-semibold">{money(b.overpay)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-auto text-sm leading-relaxed text-muted">{l.disclaimer}</p>
      </section>
    </div>
  );
}
