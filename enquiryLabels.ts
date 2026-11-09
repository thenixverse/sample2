import type { EnquiryStatus, EnquiryType } from '@/types';

export const TYPE_LABELS: Record<EnquiryType, string> = {
  membership: 'Membership',
  personal_training: 'Personal training',
  program: 'Training program',
  contact: 'Contact form',
};

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In progress',
  closed: 'Closed',
};

export const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'bg-blood-500/15 text-blood-300 border-blood-500/30',
  contacted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  in_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  closed: 'bg-white/5 text-zinc-400 border-white/10',
};
