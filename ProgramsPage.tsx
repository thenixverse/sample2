import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, BadgeCheck } from 'lucide-react';
import { useContentManager } from '@/admin/hooks/useContentManager';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, OrderButtons, PageHeader, Panel, Toggle } from '@/admin/components/AdminUI';
import ImageField from '@/admin/components/ImageField';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { clean, cleanMultiline } from '@/utils/validation';
import { cn, safeExternalUrl, sizedImage } from '@/utils/helpers';
import type { TrainingProgram } from '@/types';

type Draft = Pick<TrainingProgram, 'name' | 'description' | 'image_url' | 'is_confirmed' | 'is_enabled'>;
const blank: Draft = { name: '', description: '', image_url: '', is_confirmed: false, is_enabled: true };

export default function ProgramsPage() {
  const m = useContentManager<TrainingProgram>('training_programs', 'Program');
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<TrainingProgram | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const open = (p?: TrainingProgram) => {
    setFormError(null);
    setEditing(p ? { id: p.id, draft: { name: p.name, description: p.description, image_url: p.image_url, is_confirmed: p.is_confirmed, is_enabled: p.is_enabled } } : { id: null, draft: blank });
  };
  const setDraft = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, draft: { ...e.draft, ...patch } });

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    const values = { ...d, name: clean(d.name), description: cleanMultiline(d.description).slice(0, 600), image_url: d.image_url.trim() };
    if (!values.name) return setFormError('Program name is required.');
    if (values.image_url && !safeExternalUrl(values.image_url)) return setFormError('Image must be a valid web address.');
    if (await m.save(editing.id, values)) setEditing(null);
  };

  return (
    <>
      <PageHeader title="Training programs" description="Program cards shown in the Training section. Mark as confirmed once the owner verifies availability." action={<Button onClick={() => open()}><Plus className="h-4 w-4" /> Add program</Button>} />

      {m.loading ? <LoadingState /> : m.error ? <ErrorState onRetry={m.reload} /> : m.items.length === 0 ? (
        <EmptyState message="No programs yet." action={<Button size="sm" onClick={() => open()}>Add first program</Button>} />
      ) : (
        <div className="space-y-3">
          {m.items.map((p, i) => (
            <Panel key={p.id} className={cn('flex items-center gap-4 p-4', !p.is_enabled && 'opacity-60')}>
              <OrderButtons onUp={() => m.move(i, -1)} onDown={() => m.move(i, 1)} disableUp={i === 0 || m.busy} disableDown={i === m.items.length - 1 || m.busy} />
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-ink-800">
                {safeExternalUrl(p.image_url) && <img src={sizedImage(p.image_url, 200)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
                  {p.name}
                  {p.is_confirmed && <BadgeCheck className="h-4 w-4 text-emerald-400" aria-label="Confirmed" />}
                </p>
                <p className="truncate text-sm text-zinc-400">{p.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle label={`Show ${p.name}`} checked={p.is_enabled} disabled={m.busy} onChange={(v) => m.patch(p.id, { is_enabled: v }, v ? 'Program shown' : 'Program hidden')} />
                <button type="button" aria-label="Edit" onClick={() => open(p)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button type="button" aria-label="Delete" onClick={() => setDeleting(p)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-blood-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit program' : 'New program'}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <TextField id="pr-name" label="Program name" value={editing.draft.name} onChange={(e) => setDraft({ name: e.target.value })} maxLength={80} />
            <TextArea id="pr-desc" label="Short description" optional value={editing.draft.description} onChange={(e) => setDraft({ description: e.target.value })} maxLength={600} />
            <ImageField id="pr-image" label="Card image" folder="programs" value={editing.draft.image_url} onChange={(url) => setDraft({ image_url: url })} />
            <div className="flex flex-col gap-4 rounded-md bg-ink-800 p-4">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Availability confirmed by owner<span className="block text-xs text-zinc-500">Removes the "to be confirmed" label.</span></span>
                <Toggle label="Confirmed" checked={editing.draft.is_confirmed} onChange={(v) => setDraft({ is_confirmed: v })} />
              </label>
              <label className="flex items-center justify-between text-sm">Show on website <Toggle label="Enabled" checked={editing.draft.is_enabled} onChange={(v) => setDraft({ is_enabled: v })} /></label>
            </div>
            {formError && <p role="alert" className="text-sm text-blood-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={m.busy}>Save program</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete program?"
        message={`"${deleting?.name}" will be removed permanently. To hide it temporarily, switch it off instead.`}
        busy={m.busy}
        onConfirm={async () => deleting && (await m.remove(deleting.id)) && setDeleting(null)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
