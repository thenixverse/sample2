import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/Button';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { useEnquiry } from '@/hooks/useEnquiry';
import { PEXELS } from '@/utils/defaults';
import { sizedImage, srcSet } from '@/utils/helpers';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const openEnquiry = useEnquiry();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '20%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.2]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const lines = ['UNLEASH', 'YOUR', 'STRENGTH.'];

  return (
    <section id="home" ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink pb-24 pt-32 sm:items-center sm:pb-0">
      <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
        <img
          src={sizedImage(PEXELS.hero, 1920)}
          srcSet={srcSet(PEXELS.hero, [800, 1280, 1920, 2560])}
          sizes="100vw"
          alt="Dramatically lit gym training floor with pull-up bars and ropes"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-blood-500/20 blur-[140px]" />

      <motion.div className="container-x relative z-10" style={{ opacity: contentOpacity }}>
        <motion.span
          className="eyebrow"
          initial={reduce ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <span className="h-px w-10 bg-blood-500" />
          Unisex Fitness Centre · Trichy
        </motion.span>

        <h1 className="mt-6 font-display text-[19vw] uppercase leading-[0.85] tracking-wide text-white sm:text-[8.5rem] lg:text-[11rem]">
          {lines.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className={i === 2 ? 'block text-blood-500' : 'block'}
                initial={reduce ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.35 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease }}
          className="mt-8 max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest2 text-gold-400">Your fitness. Your journey. Your strength.</p>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Discover a supportive fitness environment where consistency, determination and progress come together. Start your fitness journey at MR. THANOS FITNESS.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => openEnquiry({ type: 'membership' })}>
              Join now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <LinkButton size="lg" variant="outline" href="#gallery">
              Explore the gym
            </LinkButton>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-blood-500" /> Promenade Road, Cantonment, Tiruchirappalli
          </p>
        </motion.div>
      </motion.div>

      <PlaceholderBadge className="absolute bottom-6 left-5 z-10 sm:left-8" label="Sample image" />

      <a href="#about" aria-label="Scroll to about section" className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-widest2 text-zinc-500 transition-colors hover:text-white sm:flex">
        Scroll
        <span className="flex h-10 w-6 justify-center rounded-full border border-white/20 pt-2">
          <span className="h-2 w-1 animate-scrollcue rounded-full bg-blood-500" />
        </span>
      </a>
    </section>
  );
}
