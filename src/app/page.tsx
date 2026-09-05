import Hero from '@/components/sections/Hero';
import Positioning from '@/components/sections/Positioning';
import Courses from '@/components/sections/Courses';
import Method from '@/components/sections/Method';
import ResearchClub from '@/components/sections/ResearchClub';
import About from '@/components/sections/About';
import CallMe from '@/components/sections/CallMe';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';
import MarketLine from '@/components/visuals/MarketLine';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div aria-hidden="true" className="relative -mt-4">
        <MarketLine className="opacity-70" />
      </div>
      <Positioning />
      <Courses />
      <Method />
      <ResearchClub />
      <About />
      <CallMe />
      <FAQ />
      <FinalCTA />
    </>
  );
}
