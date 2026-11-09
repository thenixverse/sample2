import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'outline' | 'ghost' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-semibold uppercase tracking-wider transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-blood-500 text-white hover:bg-blood-600 shadow-[0_8px_30px_-8px_rgba(227,38,54,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(227,38,54,0.8)]',
  outline: 'border border-white/25 text-white hover:border-white hover:bg-white hover:text-ink',
  ghost: 'text-zinc-300 hover:text-white hover:bg-white/5',
  whatsapp: 'bg-[#1FAF54] text-white hover:bg-[#178F44]',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[11px]',
  md: 'px-6 py-3.5 text-xs',
  lg: 'px-8 py-4 text-sm',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({ variant = 'primary', size = 'md', className, children, ...rest }: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = rest.href?.startsWith('http');
  return (
    <a
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
