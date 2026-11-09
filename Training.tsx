import { ArrowUpRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useEnquiry } from '@/hooks/useEnquiry';
import { isPexels, sizedImage, srcSet } from '@/utils/helpers';

export default function Training() {
  const { content, loading } = useSiteContent();
  const openEnquiry = useEnquiry();
  const programs = content.programs;

  return (
    <section id="training" className="relative bg-ink-800 py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Training"
            title={<>Train the way<br />that <span className="text-blood-500">fits you.</span></>}
            description="Explore the training styles we are planning to feature. Ask us which options are currently available and best suited to your goals."
          />
        </div>

        {loading ? (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-ink-700" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <p className="mt-16 rounded-lg border border-white/5 bg-ink-700 p-10 text-center text-muted">Training programs will be announced soon. Contact us to learn more.</p>
        ) : (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, i) => (
              <Reveal key={program.id} delay={(i % 3) * 0.08}>
                <article className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg bg-ink-700">
                  {program.image_url && (
                    <img
                      src={sizedImage(program.image_url, 800)}
                      srcSet={srcSet(program.image_url, [480, 800])}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      alt={program.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent transition-opacity duration-500 group-hover:from-ink group-hover:via-ink/80" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {!program.is_confirmed && <PlaceholderBadge label="Availability to be confirmed" tone="muted" />}
                    {isPexels(program.image_url) && <PlaceholderBadge />}
                  </div>
                  <div className="relative p-7">
                    <span className="font-display text-lg text-blood-500">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-1 font-display text-4xl uppercase tracking-wide">{program.name}</h3>
                    <p className="mt-3 max-h-0 overflow-hidden text-sm text-zinc-300 opacity-0 transition-all duration-500 group-hover:max-h-32 group-hover:opacity-100 group-focus-within:max-h-32 group-focus-within:opacity-100 max-lg:max-h-32 max-lg:opacity-100">
                      {program.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => openEnquiry({ type: 'program', plan: program.name, title: program.name })}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:text-blood-400"
                    >
                      Learn more
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition-all group-hover:border-blood-500 group-hover:bg-blood-500">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
