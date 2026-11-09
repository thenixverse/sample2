import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { useSiteContent } from '@/hooks/useSiteContent';
import { cn, safeExternalUrl } from '@/utils/helpers';

export default function Testimonials() {
  const { content } = useSiteContent();
  const items = content.testimonials;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (items.length < 2 || paused || reduce) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [items.length, paused, reduce, go]);

  if (items.length === 0) return null;
  const current = items[Math.min(index, items.length - 1)];

  return (
    <section className="relative overflow-hidden bg-ink-800 py-24 sm:py-32" aria-labelledby="testimonials-heading" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Quote className="pointer-events-none absolute -left-10 top-10 h-72 w-72 text-white/[0.02]" />
      <div className="container-x relative">
        <SectionHeading eyebrow="Testimonials" title={<span id="testimonials-heading">The experience <span className="text-blood-500">speaks.</span></span>} align="center" />

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative min-h-[300px] rounded-lg border border-white/5 bg-ink-700 p-8 sm:p-12" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-1" aria-label={`${current.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('h-4 w-4', i < current.rating ? 'fill-gold-500 text-gold-500' : 'text-zinc-700')} />
                    ))}
                  </div>
                  {current.is_sample && <PlaceholderBadge label="Sample placeholder" />}
                </div>
                <blockquote className="mt-6 text-xl leading-relaxed text-zinc-200 sm:text-2xl">&ldquo;{current.review}&rdquo;</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {current.photo_url && safeExternalUrl(current.photo_url) ? (
                    <img src={safeExternalUrl(current.photo_url)!} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blood-500/15 font-display text-xl text-blood-400">
                      {current.customer_name.replace(/[^A-Za-z]/g, '').charAt(0) || 'M'}
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold text-white">{current.customer_name}</span>
                    <span className="text-xs text-zinc-500">{current.is_sample ? 'Not a genuine review' : 'Member'}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-2">
                {items.map((t, i) => (
                  <button key={t.id} type="button" aria-label={`Show testimonial ${i + 1}`} onClick={() => setIndex(i)} className="flex h-6 items-center">
                    <span className={cn('block h-1 rounded-full transition-all duration-500', i === index ? 'w-10 bg-blood-500' : 'w-4 bg-white/20 hover:bg-white/40')} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous testimonial" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition-colors hover:border-blood-500 hover:bg-blood-500">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" aria-label="Next testimonial" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition-colors hover:border-blood-500 hover:bg-blood-500">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
