import {
  Hero,
  Marquee,
  SampleCode,
  CategoryGrid,
  Faq,
  CtaCard,
  ContactNote,
} from "@/components/home/HomeSections";
import { StickyFooter } from "@/components/home/StickyFooter";

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
      {/* ruang untuk footer marquee yang menempel di bawah */}
      <div className="h-11" />
      <StickyFooter />
    </main>
  );
}
