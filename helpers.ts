const DEFAULT_WA_MESSAGE =
  'Hello MR. THANOS FITNESS! I would like to know more about your gym membership plans and training programs.';

export function whatsappUrl(number: string, message: string = DEFAULT_WA_MESSAGE): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function isPexels(url: string): boolean {
  return url.includes('images.pexels.com');
}

export function sizedImage(url: string, width: number): string {
  if (!isPexels(url)) return url;
  const base = url.split('?')[0];
  return `${base}?auto=compress&cs=tinysrgb&w=${width}`;
}

export function srcSet(url: string, widths: number[] = [480, 800, 1200]): string | undefined {
  if (!isPexels(url)) return undefined;
  return widths.map((w) => `${sizedImage(url, w)} ${w}w`).join(', ');
}

export function safeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
