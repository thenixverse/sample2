import { Check, MessageCircle, Star } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { Button, LinkButton } from '@/components/ui/Button';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useEnquiry } from '@/hooks/useEnquiry';
import { cn, whatsappUrl } from '@/utils/helpers';

export default function Memberships() {
  const { content } = useSiteContent();
  const openEnquiry = useEnquiry();
  const plans = content.plans;

  return (
    <section id="memberships" className="relative bg-ink-800 py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Memberships"
          title={<>Choose your <span className="text-blood-500">fitness journey.</span></>}
          description="Flexible membership options for every stage of your journey. Final prices and inclusions will be confirmed by the gym."
          align="center"
        />

        {plans.length === 0 ? (
          <p className="mx-auto mt-16 max-w-lg rounded-lg border border-white/5 bg-ink-700 p-10 text-center text-muted">Membership options are being updated. Please contact us for current plans.</p>
        ) : (
          <div className={cn('mx-auto mt-16 grid max-w-6xl gap-5', plans.length >= 3 ? 'lg:grid-cols-3' : plans.length === 2 ? 'md:grid-cols-2' : 'max-w-md')}>
            {plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.1} className="h-full">
                <article
                  className={cn(
                    'group relative flex h-full flex-col rounded-lg border p-8 transition-all duration-500 hover:-translate-y-2 sm:p-10',
                    plan.is_featured
                      ? 'border-blood-500/60 bg-gradient-to-b from-blood-500/15 to-ink-700 shadow-[0_30px_80px_-30px_rgba(227,38,54,0.5)]'
                      : 'border-white/10 bg-ink-700 hover:border-white/25',
                  )}
                >
                  {plan.is_featured && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-sm bg-blood-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
                      <Star className="h-3 w-3 fill-current" /> Featured
                    </span>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-widest2 text-zinc-400">{plan.duration_label}</p>
                  <h3 className="mt-3 font-display text-4xl uppercase tracking-wide">{plan.name}</h3>
                  <div className="mt-8 border-y border-white/10 py-6">
                    <p className={cn('font-display tracking-wide', plan.price_label.includes('[') ? 'text-3xl text-gold-400' : 'text-6xl text-white')}>{plan.price_label}</p>
                    {plan.duration_label && <p className="mt-1 text-xs text-zinc-500">per {plan.duration_label.toLowerCase()}</p>}
                  </div>
                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blood-500/15 text-blood-400">
                          <Check className="h-3 w-3" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex flex-col gap-3">
                    <Button variant={plan.is_featured ? 'primary' : 'outline'} onClick={() => openEnquiry({ type: 'membership', plan: plan.name, title: plan.name })}>
                      Join now
                    </Button>
                    <LinkButton variant="ghost" size="sm" href={whatsappUrl(content.settings.whatsapp_number, `Hello MR. THANOS FITNESS! I'm interested in the ${plan.name}. Could you share the details?`)}>
                      <MessageCircle className="h-4 w-4 text-[#1FAF54]" /> Ask on WhatsApp
                    </LinkButton>
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
