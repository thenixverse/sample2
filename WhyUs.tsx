import { HeartHandshake, Dumbbell, UserCheck, MapPin } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

const REASONS = [
  { icon: HeartHandshake, title: 'Supportive training environment', text: 'Members often highlight the encouraging, friendly atmosphere that keeps them coming back.' },
  { icon: Dumbbell, title: 'Equipment for strength and fitness', text: 'A useful selection of gym equipment to support strength work and overall fitness.' },
  { icon: UserCheck, title: 'Trainer guidance', text: 'Positive guidance on the gym floor to help you train with more confidence.' },
  { icon: MapPin, title: 'Convenient location', text: 'Located on Promenade Road in Cantonment, easy to reach across Tiruchirappalli.' },
];

export default function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-32" aria-labelledby="why-heading">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blood-500/10 blur-[120px]" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Why choose us"
          title={<span id="why-heading">Your fitness deserves <span className="text-blood-500">the right environment.</span></span>}
          align="center"
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <div className="group relative h-full bg-ink-800 p-8 transition-colors duration-500 hover:bg-ink-700">
                <span className="flex h-14 w-14 items-center justify-center rounded-md border border-blood-500/30 bg-blood-500/10 text-blood-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-blood-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-8 font-display text-3xl uppercase tracking-wide">{title}</h3>
                <p className="mt-3 text-sm text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
