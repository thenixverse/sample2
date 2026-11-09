import { Facebook, Instagram, MapPin, Phone, Youtube } from 'lucide-react';
import { Logo } from '@/components/layout/Navbar';
import { useSiteContent } from '@/hooks/useSiteContent';
import { NAV_LINKS } from '@/utils/defaults';
import { safeExternalUrl, telUrl } from '@/utils/helpers';

export default function Footer() {
  const { content } = useSiteContent();
  const s = content.settings;
  const socials = [
    { url: s.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: s.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: s.youtube_url, icon: Youtube, label: 'YouTube' },
  ]
    .map((x) => ({ ...x, url: safeExternalUrl(x.url) }))
    .filter((x) => x.url);

  return (
    <footer className="border-t border-white/5 bg-ink">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm text-sm text-muted">
            A welcoming unisex fitness centre in Cantonment, Tiruchirappalli. Your fitness. Your journey. Your strength.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ url, icon: Icon, label }) => (
                <a key={label} href={url!} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition-colors hover:border-blood-500 hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest2 text-zinc-500">Explore</h3>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-1">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-sm text-zinc-300 transition-colors hover:text-blood-400">{label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest2 text-zinc-500">Visit</h3>
          <address className="mt-5 space-y-4 text-sm not-italic text-zinc-300">
            <p className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blood-500" /><span className="whitespace-pre-line">{s.address}</span></p>
            <a href={telUrl(s.phone)} className="flex gap-3 hover:text-white"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-blood-500" />{s.phone}</a>
          </address>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-zinc-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {s.business_name}. All rights reserved.</p>
          <p>Photos marked "Sample" are stock images for preview only.</p>
        </div>
      </div>
    </footer>
  );
}
