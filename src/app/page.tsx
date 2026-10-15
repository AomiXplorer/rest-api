import { Navbar, Footer } from "@/components/layout/Navbar";
import { Hero, StatsRow, CategoryGrid, FeaturesSection, CtaSection, ContactSection } from "@/components/home/HomeSections";
import { VERIFIED_IDS } from "@/config/verification";

export default function HomePage() {
  return (
    <>
      <Navbar active="home" />
      <main>
        <Hero />
        <StatsRow verifiedCount={VERIFIED_IDS.length} />
        <CategoryGrid />
        <FeaturesSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
