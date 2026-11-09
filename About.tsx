import { Target, Dumbbell, HeartHandshake } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { PEXELS } from '@/utils/defaults';
import { sizedImage, srcSet } from '@/utils/helpers';

const FEATURES = [
  { no: '01', title: 'Train with purpose', text: 'Build consistency through structured fitness activities.', icon: Target },
  { no: '02', title: 'Strength & fitness', text: 'Explore training opportunities for strength and overall fitness.', icon: Dumbbell },
  { no: '03', title: 'Supportive environment', text: 'Experience an encouraging atmosphere for your fitness journey.', icon: HeartHandshake },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <img
              src={sizedImage(PEXELS.aboutMain, 900)}
              srcSet={srcSet(PEXELS.aboutMain, [480, 900, 1200])}
              sizes="(min-width: 1024px) 40vw, 90vw"
              alt="Member lifting weights with focus"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.5s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <PlaceholderBadge className="absolute left-4 top-4" />
          </div>
          <div className="absolute -bottom-10 -right-2 hidden w-1/2 overflow-hidden rounded-lg border-4 border-ink sm:block lg:-right-10">
            <img src={sizedImage(PEXELS.aboutSecondary, 600)} alt="Woman training with dumbbells" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
          <div className="absolute -left-4 top-10 hidden h-32 w-1 bg-blood-500 lg:block" />
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow="About us" title={<>More than a gym.<br /><span className="text-blood-500">A place to grow.</span></>} />
          <Reveal delay={0.1} className="mt-8 space-y-5 text-base text-zinc-300">
            <p>Welcome to <strong className="font-semibold text-white">MR. THANOS FITNESS</strong>, a unisex fitness centre in Tiruchirappalli.</p>
            <p className="text-muted">We provide a welcoming environment for people who want to improve their fitness, develop strength and maintain an active lifestyle.</p>
            <p className="text-muted">Whether you are starting your journey or continuing your training, discover an environment where consistency and dedication matter.</p>
          </Reveal>
        </div>
      </div>

      <div className="container-x mt-24 grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ no, title, text, icon: Icon }, i) => (
          <Reveal key={no} delay={i * 0.1}>
            <article className="group relative h-full overflow-hidden rounded-lg border border-white/5 bg-ink-700 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-blood-500/40">
              <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-blood-500 transition-transform duration-500 group-hover:scale-x-100" />
              <div className="flex items-start justify-between">
                <span className="font-display text-6xl text-white/10 transition-colors duration-500 group-hover:text-blood-500/30">{no}</span>
                <Icon className="h-6 w-6 text-blood-500" />
              </div>
              <h3 className="mt-6 font-display text-3xl uppercase tracking-wide">{title}</h3>
              <p className="mt-3 text-sm text-muted">{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
