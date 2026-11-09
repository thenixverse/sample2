import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { sizedImage } from '@/utils/helpers';
import type { GalleryImage } from '@/types';

interface LightboxProps {
  images: GalleryImage[];
  index: number | null;
  onChange: (index: number | null) => void;
}

export default function Lightbox({ images, index, onChange }: LightboxProps) {
  const image = index === null ? null : images[index];
  const step = useCallback(
    (dir: number) => index !== null && onChange((index + dir + images.length) % images.length),
    [index, images.length, onChange],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, onChange, step]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={image.title || 'Gallery image'}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
        >
          <button type="button" aria-label="Close" onClick={() => onChange(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-blood-500 sm:left-6">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-blood-500 sm:right-6">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <motion.figure
            key={image.id}
            className="relative max-h-full max-w-5xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={sizedImage(image.image_url, 1600)} alt={image.alt_text || image.title} className="max-h-[80vh] w-auto rounded-md object-contain" />
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-display text-2xl uppercase tracking-wide">{image.title}</span>
                <span className="ml-3 text-xs uppercase tracking-widest text-zinc-500">{image.category}</span>
              </span>
              <span className="flex items-center gap-3 text-xs text-zinc-500">
                {image.is_placeholder && <PlaceholderBadge label="Sample stock photo" />}
                {index! + 1} / {images.length}
              </span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
