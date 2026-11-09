import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { useContentManager } from '@/admin/hooks/useContentManager';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, OrderButtons, PageHeader, Panel, Toggle } from '@/admin/components/AdminUI';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { clean } from '@/utils/validation';
import { cn } from '@/utils/helpers';
import type { MembershipPlan } from '@/types';

type Draft = Pick<MembershipPlan, 'name' | 'duration_label' | 'price_label' | 'benefits' | 'is_featured' | 'is_enabled'>;
const blank: Draft = { name: '', duration_label: '', price_label: '₹[OWNER TO CONFIRM]', benefits: [''], is_featured: false, is_enabled: true };

export default function PlansPage() {
  const m = useContentManager<MembershipPlan>('membership_plans', 'Plan');
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<MembershipPlan | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const open = (plan?: MembershipPlan) => {
    setFormError(null);
    setEditing(
      plan
        ? {
            id: plan.id,
            draft: {
              name: plan.name,
              duration_label: plan.duration_label,
              price_label: plan.price_label,
              benefits: plan.benefits.length ? plan.benefits : [''],
              is_featured: plan.is_featured,
              is_enabled: plan.is_enabled,
            },
          }
        : { id: null, draft: blank },
    );
  };
  const setDraft = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, draft: { ...e.draft, ...patch } });

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    const values = {
      ...d,
      name: clean(d.name),
      duration_label: clean(d.duration_label),
      price_label: clean(d.price_label),
      benefits: d.benefits.map(clean).filter(Boolean).slice(0, 12),
    };
    if (!values.name) return setFormError('Plan name is required.');
    if (!values.price_label) return setFormError('Price is required (use a placeholder if not confirmed).');
    if (await m.save(editing.id, values)) setEditing(null);
  };

  return (
    <>
      <PageHeader title="Memberships" description="Edit prices, benefits and which plans appear on the website." action={<Button onClick={() => open()}><Plus className="h-4 w-4" /> Add plan</Button>} />

      {m.loading ? <LoadingState /> : m.error ? <ErrorState onRetry={m.reload} /> : m.items.length === 0 ? (
        <EmptyState message="No membership plans yet." action={<Button size="sm" onClick={() => open()}>Add first plan</Button>} />
      ) : (
        <div className="space-y-3">
          {m.items.map((plan, i) => (
            <Panel key={plan.id} className={cn('flex items-center gap-4 p-4 sm:p-5', !plan.is_enabled && 'opacity-60')}>
              <OrderButtons onUp={() => m.move(i, -1)} onDown={() => m.move(i, 1)} disableUp={i === 0 || m.busy} disableDown={i === m.items.length - 1 || m.busy} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
                  {plan.name}
                  {plan.is_featured && <Star className="h-4 w-4 fill-gold-500 text-gold-500" />}
                </p>
                <p className="text-sm text-zinc-400">{plan.price_label} · {plan.duration_label} · {plan.benefits.length} benefits</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-zinc-500 sm:inline">{plan.is_enabled ? 'Visible' : 'Hidden'}</span>
                <Toggle label={`Show ${plan.name}`} checked={plan.is_enabled} disabled={m.busy} onChange={(v) => m.patch(plan.id, { is_enabled: v }, v ? 'Plan enabled' : 'Plan disabled')} />
                <button type="button" aria-label="Edit" onClick={() => open(plan)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button type="button" aria-label="Delete" onClick={() => setDeleting(plan)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-blood-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit plan' : 'New plan'}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <TextField id="p-name" label="Plan name" value={editing.draft.name} onChange={(e) => setDraft({ name: e.target.value })} maxLength={80} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="p-price" label="Price" value={editing.draft.price_label} onChange={(e) => setDraft({ price_label: e.target.value })} maxLength={60} placeholder="₹2,000" />
              <TextField id="p-duration" label="Duration" optional value={editing.draft.duration_label} onChange={(e) => setDraft({ duration_label: e.target.value })} maxLength={80} placeholder="1 Month" />
            </div>
            <div>
              <span className="label">Benefits</span>
              <div className="space-y-2">
                {editing.draft.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input aria-label={`Benefit ${i + 1}`} className="input" value={b} maxLength={160} onChange={(e) => setDraft({ benefits: editing.draft.benefits.map((x, j) => (j === i ? e.target.value : x)) })} />
                    <button type="button" aria-label="Remove benefit" onClick={() => setDraft({ benefits: editing.draft.benefits.filter((_, j) => j !== i) })} className="rounded-md border border-white/10 px-3 text-zinc-400 hover:text-blood-400"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              {editing.draft.benefits.length < 12 && (
                <button type="button" onClick={() => setDraft({ benefits: [...editing.draft.benefits, ''] })} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blood-400 hover:text-blood-300">
                  <Plus className="h-3.5 w-3.5" /> Add benefit
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4 rounded-md bg-ink-800 p-4">
              <label className="flex items-center justify-between text-sm">Highlight as featured <Toggle label="Featured" checked={editing.draft.is_featured} onChange={(v) => setDraft({ is_featured: v })} /></label>
              <label className="flex items-center justify-between text-sm">Show on website <Toggle label="Enabled" checked={editing.draft.is_enabled} onChange={(v) => setDraft({ is_enabled: v })} /></label>
            </div>
            {formError && <p role="alert" className="text-sm text-blood-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={m.busy}>Save plan</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete plan?"
        message={`"${deleting?.name}" will be removed from the website permanently. To hide it temporarily, disable it instead.`}
        busy={m.busy}
        onConfirm={async () => deleting && (await m.remove(deleting.id)) && setDeleting(null)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
