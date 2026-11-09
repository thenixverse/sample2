import { requireSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Enquiry, EnquiryStatus, NewEnquiry } from '@/types';

export type SubmitResult = { ok: true } | { ok: false; reason: 'demo' | 'duplicate' | 'invalid' | 'failed' };

export async function submitEnquiry(enquiry: NewEnquiry): Promise<SubmitResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: 'demo' };
  try {
    const { error } = await requireSupabase().from('enquiries').insert(enquiry);
    if (!error) return { ok: true };
    console.error('enquiry submit failed', error);
    if (error.message?.includes('duplicate_enquiry')) return { ok: false, reason: 'duplicate' };
    if (error.code === '23514') return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'failed' };
  } catch (cause) {
    console.error('enquiry submit failed', cause);
    return { ok: false, reason: 'failed' };
  }
}

export const SUBMIT_MESSAGES: Record<Exclude<SubmitResult, { ok: true }>['reason'], string> = {
  demo: 'Demo mode: the online form is not connected yet, so nothing was saved. Please call or WhatsApp us instead.',
  duplicate: 'We already received this enquiry a few minutes ago. Our team will be in touch soon.',
  invalid: 'Some details look incorrect. Please check the form and try again.',
  failed: 'Something went wrong while sending. Please try again, or contact us on WhatsApp.',
};

export async function listEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await requireSupabase().from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Enquiry[];
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const { error } = await requireSupabase().from('enquiries').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteEnquiry(id: string): Promise<void> {
  const { error } = await requireSupabase().from('enquiries').delete().eq('id', id);
  if (error) throw error;
}
