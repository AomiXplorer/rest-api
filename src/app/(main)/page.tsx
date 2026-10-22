import { Hero, Stats, VisitorInfo, Features, Cta } from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Stats />
      <VisitorInfo />
      <Features />
      <Cta />
    </main>
  );
}
