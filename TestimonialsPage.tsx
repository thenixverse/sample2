import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useContentManager } from '@/admin/hooks/useContentManager';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, OrderButtons, PageHeader, Panel, Toggle } from '@/admin/components/AdminUI';
import ImageField from '@/admin/components/ImageField';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { clean, cleanMultiline } from '@/utils/validation';
import { cn, safeExternalUrl } from '@/utils/helpers';
import type { Testimonial } from '@/types';

type Draft = Pick<Testimonial, 'customer_name' | 'rating' | 'review' | 'photo_url' | 'is_sample' | 'is_published'>;
const blank: Draft = { customer_name: '', rating: 5, review: '', photo_url: '', is_sample: false, is_published: true };

export default function TestimonialsPage() {
  const m = useContentManager<Testimonial>('testimonials', 'Testimonial');
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [permission, setPermission] = useState(false);

  const open = (t?: Testimonial) => {
    setFormError(null);
    setPermission(!!t && !t.is_sample);
    setEditing(t ? { id: t.id, draft: { customer_name: t.customer_name, rating: t.rating, review: t.review, photo_url: t.photo_url ?? '', is_sample: t.is_sample, is_published: t.is_published } } : { id: null, draft: blank });
  };
  const setDraft = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, draft: { ...e.draft, ...patch } });

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    const photo = (d.photo_url ?? '').trim();
    const values = { ...d, customer_name: clean(d.customer_name), review: cleanMultiline(d.review).slice(0, 1200), photo_url: photo || null, rating: Math.min(5, Math.max(1, Math.round(d.rating))) };
    if (!values.customer_name) return setFormError('Customer name is required.');
    if (!values.review) return setFormError('Review text is required.');
    if (photo && !safeExternalUrl(photo)) return setFormError('Photo must be a valid web address.');
    if (!values.is_sample && values.is_published && !permission) return setFormError('Confirm you have the customer\u2019s permission to publish this review.');
    if (await m.save(editing.id, values)) setEditing(null);
  };

  return (
    <>
      <PageHeader title="Testimonials" description="Only publish genuine reviews with the customer's permission." action={<Button onClick={() => open()}><Plus className="h-4 w-4" /> Add testimonial</Button>} />

      {m.loading ? <LoadingState /> : m.error ? <ErrorState onRetry={m.reload} /> : m.items.length === 0 ? (
        <EmptyState message="No testimonials yet. The section is hidden on the website until one is published." action={<Button size="sm" onClick={() => open()}>Add testimonial</Button>} />
      ) : (
        <div className="space-y-3">
          {m.items.map((t, i) => (
            <Panel key={t.id} className={cn('flex items-start gap-4 p-4', !t.is_published && 'opacity-60')}>
              <OrderButtons onUp={() => m.move(i, -1)} onDown={() => m.move(i, 1)} disableUp={i === 0 || m.busy} disableDown={i === m.items.length - 1 || m.busy} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{t.customer_name}</p>
                  <span className="flex">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-3 w-3 fill-gold-500 text-gold-500" />)}</span>
                  {t.is_sample && <PlaceholderBadge label="Sample" />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{t.review}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle label={`Publish ${t.customer_name}`} checked={t.is_published} disabled={m.busy} onChange={(v) => m.patch(t.id, { is_published: v }, v ? 'Published' : 'Unpublished')} />
                <button type="button" aria-label="Edit" onClick={() => open(t)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button type="button" aria-label="Delete" onClick={() => setDeleting(t)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-blood-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit testimonial' : 'New testimonial'}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <TextField id="t-name" label="Customer name" value={editing.draft.customer_name} onChange={(e) => setDraft({ customer_name: e.target.value })} maxLength={100} />
            <fieldset>
              <legend className="label">Rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setDraft({ rating: n })} className="p-1">
                    <Star className={cn('h-6 w-6', n <= editing.draft.rating ? 'fill-gold-500 text-gold-500' : 'text-zinc-700')} />
                  </button>
                ))}
              </div>
            </fieldset>
            <TextArea id="t-review" label="Review" value={editing.draft.review} onChange={(e) => setDraft({ review: e.target.value })} maxLength={1200} />
            <ImageField id="t-photo" label="Profile photo (optional)" folder="testimonials" value={editing.draft.photo_url ?? ''} onChange={(url) => setDraft({ photo_url: url })} />
            <div className="flex flex-col gap-4 rounded-md bg-ink-800 p-4">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Sample placeholder<span className="block text-xs text-zinc-500">Labelled on the website as not a genuine review.</span></span>
                <Toggle label="Sample" checked={editing.draft.is_sample} onChange={(v) => setDraft({ is_sample: v })} />
              </label>
              <label className="flex items-center justify-between text-sm">Publish on website <Toggle label="Published" checked={editing.draft.is_published} onChange={(v) => setDraft({ is_published: v })} /></label>
              {!editing.draft.is_sample && (
                <label className="flex items-start gap-3 text-sm text-zinc-300">
                  <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-1 h-4 w-4 accent-blood-500" />
                  I confirm this is a genuine review and the customer has given permission to publish it.
                </label>
              )}
            </div>
            {formError && <p role="alert" className="text-sm text-blood-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={m.busy}>Save testimonial</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove testimonial?"
        message={`The review from ${deleting?.customer_name} will be deleted permanently.`}
        busy={m.busy}
        onConfirm={async () => deleting && (await m.remove(deleting.id)) && setDeleting(null)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
