import { Container } from "@/components/ui";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { d } = await getI18n();
  return { title: d.legal.metaTitle, description: d.legal.metaDescription };
}

// Якоря #privacy и #consent — на них ведут ссылки из чекбоксов формы заявки.
function Section({ id, title, items }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function PolicyPage() {
  const { d } = await getI18n();
  const l = d.legal;
  return (
    <Container className="max-w-3xl! py-10">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{l.title}</h1>
      <p className="mt-4 rounded-2xl bg-navy-100 p-4 text-sm leading-relaxed text-navy-900">{l.note}</p>
      <Section id="privacy" title={l.privacyTitle} items={l.privacy} />
      <Section id="consent" title={l.consentTitle} items={l.consent} />
    </Container>
  );
}
