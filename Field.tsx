import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ id, label, error, optional, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {optional ? <span className="ml-1 normal-case tracking-normal text-zinc-500">(optional)</span> : <span className="ml-0.5 text-blood-500">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-blood-400">
          {error}
        </p>
      )}
    </div>
  );
}

type BaseProps = { id: string; label: string; error?: string; optional?: boolean; className?: string };

export function TextField({ id, label, error, optional, className, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} error={error} optional={optional} className={className}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn('input', error && 'input-error')} {...rest} />
    </FieldShell>
  );
}

export function TextArea({ id, label, error, optional, className, ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} error={error} optional={optional} className={className}>
      <textarea id={id} rows={4} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn('input resize-none', error && 'input-error')} {...rest} />
    </FieldShell>
  );
}

export function SelectField({ id, label, error, optional, className, children, ...rest }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} error={error} optional={optional} className={className}>
      <div className="relative">
        <select id={id} aria-invalid={!!error} className={cn('input appearance-none pr-10', error && 'input-error')} {...rest}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </div>
    </FieldShell>
  );
}
