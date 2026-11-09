import { Clock, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';
import ContactForm from '@/components/enquiry/ContactForm';
import { useSiteContent } from '@/hooks/useSiteContent';
import { safeExternalUrl, telUrl, whatsappUrl } from '@/utils/helpers';

export default function Contact() {
  const { content } = useSiteContent();
  const s = content.settings;
  const mapQuery = encodeURIComponent(`${s.business_name}, ${s.address.replace(/\n/g, ' ')}`);
  const directions = safeExternalUrl(s.maps_url) ?? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <section id="contact" className="relative bg-ink py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="Contact" title={<>Your next chapter<br /><span className="text-blood-500">starts here.</span></>} />

        <div className="mt-16 grid gap-6 lg:grid-cols-5">
          <Reveal className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-white/5 bg-ink-700 p-8">
              <h3 className="font-display text-3xl uppercase tracking-wide">{s.business_name}</h3>
              <dl className="mt-8 space-y-6 text-sm">
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blood-500" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Address</dt>
                    <dd className="mt-1 whitespace-pre-line text-zinc-200">{s.address}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blood-500" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Phone</dt>
                    <dd className="mt-1"><a href={telUrl(s.phone)} className="text-zinc-200 hover:text-white">{s.phone}</a></dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blood-500" />
                  <div className="flex-1">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Opening hours</dt>
                    <dd className="mt-2 space-y-2">
                      {s.hours.map((h) => (
                        <div key={h.day} className="flex flex-col justify-between gap-1 border-b border-white/5 pb-2 last:border-0 sm:flex-row sm:gap-4">
                          <span className="text-zinc-400">{h.day}</span>
                          <span className="text-zinc-200 sm:text-right">{h.times}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <LinkButton href={telUrl(s.phone)}><Phone className="h-4 w-4" /> Call now</LinkButton>
                <LinkButton variant="whatsapp" href={whatsappUrl(s.whatsapp_number)}><MessageCircle className="h-4 w-4" /> WhatsApp</LinkButton>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/5 bg-ink-700">
              <iframe
                title="Map showing MR. THANOS FITNESS location"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-64 w-full grayscale invert-[0.9] contrast-[0.9]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4">
                <LinkButton variant="outline" size="sm" href={directions} className="w-full">
                  <Navigation className="h-4 w-4" /> Get directions
                </LinkButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="h-full rounded-lg border border-white/5 bg-ink-700 p-8 sm:p-10">
              <h3 className="font-display text-3xl uppercase tracking-wide">Send us a message</h3>
              <p className="mt-2 text-sm text-muted">Questions about memberships, timings or training? Drop us a line.</p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
