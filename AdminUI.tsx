import type { ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-white/5 bg-ink-700', className)}>{children}</div>;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50', checked ? 'bg-blood-500' : 'bg-ink-400')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24 text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Panel className="flex flex-col items-center p-12 text-center">
      <AlertTriangle className="h-8 w-8 text-blood-500" />
      <p className="mt-4 text-sm text-zinc-300">We couldn't load this data. Please try again.</p>
      <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </Panel>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Panel className="flex flex-col items-center p-12 text-center">
      <p className="text-sm text-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </Panel>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-zinc-300">{message}</p>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function OrderButtons({ onUp, onDown, disableUp, disableDown }: { onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean }) {
  const cls = 'rounded p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';
  return (
    <div className="flex flex-col">
      <button type="button" aria-label="Move up" className={cls} disabled={disableUp} onClick={onUp}>
        <ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Move down" className={cls} disabled={disableDown} onClick={onDown}>
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
