import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import Lightbox from '@/components/gallery/Lightbox';
import { useSiteContent } from '@/hooks/useSiteContent';
import { cn, sizedImage } from '@/utils/helpers';

const SPANS = ['sm:row-span-2', '', '', 'sm:col-span-2', '', 'sm:row-span-2', '', ''];

export default function Gallery() {
  const { content, loading } = useSiteContent();
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(content.gallery.map((g) => g.category)))], [content.gallery]);
  const images = useMemo(() => (filter === 'All' ? content.gallery : content.gallery.filter((g) => g.category === filter)), [content.gallery, filter]);
  const hasPlaceholders = content.gallery.some((g) => g.is_placeholder);

  return (
    <section id="gallery" className="bg-ink py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Gallery" title={<>Inside the <span className="text-blood-500">grind.</span></>} />
          {categories.length > 2 && (
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Gallery categories">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={filter === c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                    filter === c ? 'border-blood-500 bg-blood-500 text-white' : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasPlaceholders && (
          <p className="mt-6 text-xs text-zinc-500">Images marked "Sample" are temporary stock photographs, not pictures of MR. THANOS FITNESS.</p>
        )}

        {loading ? (
          <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse rounded-md bg-ink-700" />)}
          </div>
        ) : images.length === 0 ? (
          <p className="mt-12 rounded-lg border border-white/5 bg-ink-700 p-10 text-center text-muted">Gallery photos are coming soon.</p>
        ) : (
          <motion.div layout className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {images.map((img, i) => (
                <motion.button
                  key={img.id}
                  layout
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setLightbox(i)}
                  aria-label={`Open image: ${img.title || img.alt_text}`}
                  className={cn('group relative overflow-hidden rounded-md bg-ink-700 text-left', SPANS[i % SPANS.length])}
                >
                  <img
                    src={sizedImage(img.image_url, 700)}
                    alt={img.alt_text || img.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                  {img.is_placeholder && <PlaceholderBadge label="Sample" className="absolute left-2 top-2" />}
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <span>
                      <span className="block text-[10px] uppercase tracking-widest text-blood-400">{img.category}</span>
                      <span className="font-display text-xl uppercase tracking-wide">{img.title}</span>
                    </span>
                    <Expand className="h-4 w-4 text-white" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <Lightbox images={images} index={lightbox} onChange={setLightbox} />
    </section>
  );
}
