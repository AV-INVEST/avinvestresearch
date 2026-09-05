import Hero from '@/components/sections/Hero';
import Positioning from '@/components/sections/Positioning';
import Courses from '@/components/sections/Courses';
import Method from '@/components/sections/Method';
import ResearchClub from '@/components/sections/ResearchClub';
import About from '@/components/sections/About';
import CallMe from '@/components/sections/CallMe';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';
import PerformanceSection from '@/components/sections/PerformanceSection';
import Testimonials from '@/components/sections/Testimonials';
import MarketLine from '@/components/visuals/MarketLine';
import CandlestickShowcase from '@/components/visuals/CandlestickShowcase';

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
      <section
        aria-label="Candlestick showcase: scenari educativi"
        className="relative py-4 sm:py-0 sm:mt-4 scroll-mt-28"
      >
        <div className="container-page">
          <CandlestickShowcase />
        </div>
      </section>
      <PerformanceSection />
      <ResearchClub />
      <About />
      <Testimonials />
      <CallMe />
      <FAQ />
      <FinalCTA />
    </>
  );
}
