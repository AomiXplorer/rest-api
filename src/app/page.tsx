import {
  Hero,
  Marquee,
  SampleCode,
  CategoryGrid,
  Faq,
  CtaCard,
  ContactNote,
} from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Marquee />
      <SampleCode />
      <CategoryGrid />
      <Faq />
      <CtaCard />
      <ContactNote />
    </main>
  );
}
