// Ипотечные предложения 10 банков Узбекистана для калькулятора на странице /ipoteka.
// Источник: ипотечный калькулятор domtut.uz (данные банков), снято 10.10.2026.
// Ставки меняются — сверяйте с сайтами банков и обновляйте RATES_CHECKED_AT.
// Логотипы банков лежат в public/banks/<id>.webp (оттуда же, из калькулятора domtut.uz).
//
// rateNew    — годовая ставка на новостройку, %;
// rateResale — на вторичное жильё, % (null — банк по вторичке не кредитует).
export const RATES_CHECKED_AT = "2026-10-10";

export const BANKS = [
  { id: "agrobank", logo: "/banks/agrobank.webp", name: "Agrobank", rateNew: 17.5, rateResale: 17.5, site: "https://agrobank.uz" },
  { id: "asakabank", logo: "/banks/asakabank.webp", name: "Asakabank", rateNew: 18, rateResale: 18, site: "https://asakabank.uz" },
  { id: "asia-alliance-bank", logo: "/banks/asia-alliance-bank.webp", name: "Asia Alliance Bank", rateNew: 18, rateResale: null, site: "https://aab.uz" },
  { id: "davr-bank", logo: "/banks/davr-bank.webp", name: "Davr Bank", rateNew: 24, rateResale: 24, site: "https://davrbank.uz" },
  { id: "hamkorbank", logo: "/banks/hamkorbank.webp", name: "Hamkorbank", rateNew: 20, rateResale: 20, site: "https://hamkorbank.uz" },
  { id: "ipak-yuli", logo: "/banks/ipak-yuli.webp", name: "Ipak Yo'li Bank", rateNew: 16.5, rateResale: 16.5, site: "https://ipakyulibank.uz" },
  { id: "ipoteka-bank", logo: "/banks/ipoteka-bank.webp", name: "Ipoteka-bank", rateNew: 17.5, rateResale: null, site: "https://ipotekabank.uz" },
  { id: "kapitalbank", logo: "/banks/kapitalbank.webp", name: "Kapitalbank", rateNew: 27, rateResale: 27, site: "https://kapitalbank.uz" },
  { id: "nbu", logo: "/banks/nbu.webp", name: "Milliy bank (NBU)", rateNew: 17, rateResale: 22, site: "https://nbu.uz" },
  { id: "xalq-banki", logo: "/banks/xalq-banki.webp", name: "Xalq banki", rateNew: 25, rateResale: null, site: "https://xb.uz" },
];

// Аннуитетный платёж: одинаковая сумма каждый месяц.
export function monthlyPayment(loan, annualRatePct, years) {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (loan <= 0 || n <= 0) return 0;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - (1 + r) ** -n);
}
