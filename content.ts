import { requireSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_CONTENT, DEFAULT_SETTINGS } from '@/utils/defaults';
import type { BusinessSettings, GalleryImage, MembershipPlan, OpeningHour, SiteContent, Testimonial, TrainingProgram } from '@/types';

function parseHours(value: unknown): OpeningHour[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.hours;
  return value
    .filter((h): h is OpeningHour => typeof h?.day === 'string' && typeof h?.times === 'string')
    .map((h) => ({ day: h.day, times: h.times }));
}

export function toSettings(row: Record<string, unknown> | null): BusinessSettings {
  if (!row) return DEFAULT_SETTINGS;
  const str = (k: keyof BusinessSettings) => (typeof row[k] === 'string' ? (row[k] as string) : (DEFAULT_SETTINGS[k] as string));
  return {
    business_name: str('business_name'),
    phone: str('phone'),
    whatsapp_number: str('whatsapp_number'),
    address: str('address'),
    maps_url: str('maps_url'),
    email: str('email'),
    hours: parseHours(row.hours),
    instagram_url: str('instagram_url'),
    facebook_url: str('facebook_url'),
    youtube_url: str('youtube_url'),
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return DEFAULT_CONTENT;
  const db = requireSupabase();
  const [settings, plans, programs, gallery, testimonials] = await Promise.all([
    db.from('business_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('membership_plans').select('*').eq('is_enabled', true).order('sort_order'),
    db.from('training_programs').select('*').eq('is_enabled', true).order('sort_order'),
    db.from('gallery_images').select('*').order('sort_order'),
    db.from('testimonials').select('*').eq('is_published', true).order('sort_order'),
  ]);
  const firstError = [settings, plans, programs, gallery, testimonials].find((r) => r.error)?.error;
  if (firstError) throw firstError;
  return {
    settings: toSettings(settings.data),
    plans: (plans.data ?? []) as MembershipPlan[],
    programs: (programs.data ?? []) as TrainingProgram[],
    gallery: (gallery.data ?? []) as GalleryImage[],
    testimonials: (testimonials.data ?? []) as Testimonial[],
  };
}
