import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Dumbbell } from 'lucide-react';
import { NAV_LINKS } from '@/utils/defaults';
import { useEnquiry } from '@/hooks/useEnquiry';
import { cn } from '@/utils/helpers';

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#home" className={cn('group flex items-center gap-3', className)} aria-label="MR. THANOS FITNESS home">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blood-500 transition-transform duration-500 group-hover:rotate-[-8deg]">
        <Dumbbell className="h-5 w-5 text-white" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl tracking-wider text-white">MR. THANOS</span>
        <span className="block text-[10px] font-semibold uppercase tracking-widest2 text-muted">Fitness</span>
      </span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const openEnquiry = useEnquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled || open ? 'border-b border-white/5 bg-ink/90 py-3 backdrop-blur-xl' : 'bg-gradient-to-b from-black/70 to-transparent py-5',
      )}
    >
      <nav className="container-x flex items-center justify-between" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  'relative px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors',
                  active === id ? 'text-white' : 'text-zinc-400 hover:text-white',
                )}
              >
                {label}
                <span className={cn('absolute inset-x-4 -bottom-0.5 h-0.5 origin-left bg-blood-500 transition-transform duration-300', active === id ? 'scale-x-100' : 'scale-x-0')} />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openEnquiry({ type: 'membership' })}
            className="hidden rounded-md bg-blood-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blood-600 sm:inline-flex"
          >
            Join now
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[65px] bg-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="container-x flex flex-col pt-6">
              {NAV_LINKS.map(({ id, label }, i) => (
                <motion.li key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <a
                    href={`#${id}`}
                    onClick={() => setOpen(false)}
                    className={cn('flex items-center justify-between border-b border-white/5 py-4 font-display text-4xl uppercase tracking-wide', active === id ? 'text-blood-500' : 'text-white')}
                  >
                    {label}
                    <span className="text-xs font-sans text-zinc-600">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="container-x mt-8">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openEnquiry({ type: 'membership' });
                }}
                className="w-full rounded-md bg-blood-500 py-4 text-sm font-semibold uppercase tracking-wider text-white"
              >
                Join now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
