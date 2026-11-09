import { ClipboardList, Gauge, ShieldCheck, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { Button, LinkButton } from '@/components/ui/Button';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useEnquiry } from '@/hooks/useEnquiry';
import { PEXELS } from '@/utils/defaults';
import { sizedImage, srcSet, whatsappUrl } from '@/utils/helpers';

const BENEFITS = [
  { icon: ClipboardList, title: 'A plan around your goals', text: 'Training that reflects what you want to achieve.' },
  { icon: ShieldCheck, title: 'Guidance on form', text: 'Support to help you train with better technique.' },
  { icon: Gauge, title: 'Structured progress', text: 'Clear steps to help you stay on track.' },
  { icon: Sparkles, title: 'Added motivation', text: 'Accountability that helps you stay consistent.' },
];

export default function PersonalTraining() {
  const { content } = useSiteContent();
  const openEnquiry = useEnquiry();

  return (
    <section className="relative overflow-hidden bg-ink" aria-labelledby="pt-heading">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[760px]">
          <img
            src={sizedImage(PEXELS.personal, 1200)}
            srcSet={srcSet(PEXELS.personal, [600, 900, 1200, 1600])}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Trainer guiding a member through an exercise on a gym machine"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/20 lg:to-ink" />
          <PlaceholderBadge className="absolute left-5 top-5" />
        </div>
        <div className="relative flex items-center px-5 py-20 sm:px-12 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <Reveal>
              <span className="eyebrow"><span className="h-px w-8 bg-blood-500" />Personal training</span>
              <h2 id="pt-heading" className="mt-4 font-display text-5xl uppercase tracking-wide sm:text-6xl lg:text-7xl">
                Your goals.<br />Your plan.<br /><span className="text-blood-500">Your progress.</span>
              </h2>
              <p className="mt-6 text-base text-muted sm:text-lg">
                Explore personalised training guidance and discover a training approach that suits your goals.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {BENEFITS.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={0.1 + i * 0.06}>
                  <div className="flex gap-4">
                    <Icon className="h-5 w-5 shrink-0 text-blood-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                      <p className="mt-1 text-sm text-muted">{text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3} className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => openEnquiry({ type: 'personal_training' })}>
                Enquire about PT <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <LinkButton
                size="lg"
                variant="whatsapp"
                href={whatsappUrl(content.settings.whatsapp_number, 'Hello MR. THANOS FITNESS! I would like to know more about personal training.')}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </LinkButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
