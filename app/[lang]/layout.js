import { Onest, Unbounded } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";
import "../globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata() {
  const { d } = await getI18n();
  return {
    title: { default: d.meta.title, template: "%s — NOVARO" },
    description: d.meta.description,
  };
}

export default async function RootLayout({ children }) {
  const t = await getI18n();
  return (
    <html lang={t.lang} className={`${onest.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
