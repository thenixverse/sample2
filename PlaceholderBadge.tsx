import { cn } from '@/utils/helpers';

interface PlaceholderBadgeProps {
  label?: string;
  className?: string;
  tone?: 'gold' | 'muted';
}

export default function PlaceholderBadge({ label = 'Sample image', className, tone = 'gold' }: PlaceholderBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur',
        tone === 'gold' ? 'border border-gold-500/40 bg-black/60 text-gold-300' : 'border border-white/10 bg-black/60 text-zinc-300',
        className,
      )}
    >
      {label}
    </span>
  );
}
