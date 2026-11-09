import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/helpers';

export function FormSuccess({ title, message, onReset }: { title: string; message: string; onReset?: () => void }) {
  return (
    <div role="status" className="flex flex-col items-center py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h3 className="mt-6 font-display text-4xl uppercase tracking-wide">{title}</h3>
      <p className="mt-3 max-w-sm text-sm text-muted">{message}</p>
      {onReset && (
        <button type="button" onClick={onReset} className="mt-6 text-xs font-semibold uppercase tracking-wider text-blood-400 hover:text-blood-300">
          Send another message
        </button>
      )}
    </div>
  );
}

export function FormAlert({ message, tone = 'error' }: { message: string; tone?: 'error' | 'warning' }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3 text-sm',
        tone === 'error' ? 'border-blood-500/30 bg-blood-500/10 text-blood-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200',
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
