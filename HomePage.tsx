import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFab from '@/components/layout/WhatsAppFab';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import About from '@/components/sections/About';
import Training from '@/components/sections/Training';
import WhyUs from '@/components/sections/WhyUs';
import Memberships from '@/components/sections/Memberships';
import PersonalTraining from '@/components/sections/PersonalTraining';
import Gallery from '@/components/sections/Gallery';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import { SiteContentProvider } from '@/hooks/useSiteContent';
import { EnquiryProvider } from '@/hooks/useEnquiry';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function HomePage() {
  useEffect(() => {
    document.title = 'MR. THANOS FITNESS | Unisex Gym in Cantonment, Trichy';
  }, []);

  return (
    <SiteContentProvider>
      <EnquiryProvider>
        {!isSupabaseConfigured && (
          <div className="relative z-[60] bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-ink">
            Demo mode: online forms are not connected, so enquiries will not be saved.
          </div>
        )}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Navbar />
        <main id="main">
          <Hero />
          <Marquee />
          <About />
          <Training />
          <WhyUs />
          <Memberships />
          <PersonalTraining />
          <Gallery />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
        <WhatsAppFab />
      </EnquiryProvider>
    </SiteContentProvider>
  );
}
