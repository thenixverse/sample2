import type { ReactNode } from 'react';
import Reveal from '@/components/ui/Reveal';
import { cn } from '@/utils/helpers';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeading({ eyebrow, title, description, align = 'left', className }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <Reveal className={cn(centered && 'mx-auto text-center', 'max-w-3xl', className)}>
      <span className={cn('eyebrow', centered && 'justify-center')}>
        <span className="h-px w-8 bg-blood-500" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-5xl uppercase tracking-wide text-white sm:text-6xl lg:text-7xl">{title}</h2>
      {description && <p className={cn('mt-6 text-base text-muted sm:text-lg', centered && 'mx-auto max-w-2xl')}>{description}</p>}
    </Reveal>
  );
}
