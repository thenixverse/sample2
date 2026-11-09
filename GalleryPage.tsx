import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useContentManager } from '@/admin/hooks/useContentManager';
import { useToast } from '@/admin/hooks/useToast';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, OrderButtons, PageHeader, Panel, Toggle } from '@/admin/components/AdminUI';
import ImageField from '@/admin/components/ImageField';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import PlaceholderBadge from '@/components/ui/PlaceholderBadge';
import { removeStoredImage, renameGalleryCategory } from '@/services/admin';
import { clean } from '@/utils/validation';
import { safeExternalUrl, sizedImage } from '@/utils/helpers';
import type { GalleryImage } from '@/types';

type Draft = Pick<GalleryImage, 'title' | 'alt_text' | 'category' | 'image_url' | 'storage_path' | 'is_placeholder'>;
const DEFAULT_CATEGORIES = ['Gym Interior', 'Training Equipment', 'Workout Environment', 'Fitness Activities'];
const blank: Draft = { title: '', alt_text: '', category: DEFAULT_CATEGORIES[0], image_url: '', storage_path: null, is_placeholder: false };

export default function GalleryPage() {
  const m = useContentManager<GalleryImage>('gallery_images', 'Photo');
  const notify = useToast();
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  const [renaming, setRenaming] = useState<{ from: string; to: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    m.items.forEach((g) => counts.set(g.category, (counts.get(g.category) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [m.items]);
  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories.map(([c]) => c)]));

  const open = (g?: GalleryImage) => {
    setFormError(null);
    setEditing(g ? { id: g.id, draft: { title: g.title, alt_text: g.alt_text, category: g.category, image_url: g.image_url, storage_path: g.storage_path, is_placeholder: g.is_placeholder } } : { id: null, draft: blank });
  };
  const setDraft = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, draft: { ...e.draft, ...patch } });

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    const values = { ...d, title: clean(d.title), alt_text: clean(d.alt_text), category: clean(d.category), image_url: d.image_url.trim() };
    if (!safeExternalUrl(values.image_url)) return setFormError('Please upload an image or enter a valid image address.');
    if (!values.category) return setFormError('Category is required.');
    if (!values.alt_text) values.alt_text = values.title || `${values.category} photo`;
    if (await m.save(editing.id, values)) setEditing(null);
  };

  const rename = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!renaming) return;
    const to = clean(renaming.to);
    if (!to || to.length > 60) return notify('Enter a category name (up to 60 characters)', 'error');
    try {
      await renameGalleryCategory(renaming.from, to);
      await m.reload();
      notify('Category renamed');
      setRenaming(null);
    } catch (cause) {
      console.error(cause);
      notify('Could not rename category', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Gallery" description="Upload real gym photos and retire the sample stock images." action={<Button onClick={() => open()}><Plus className="h-4 w-4" /> Add photo</Button>} />

      {categories.length > 0 && (
        <Panel className="mb-6 flex flex-wrap items-center gap-2 p-4">
          <span className="mr-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500"><Tag className="h-3.5 w-3.5" /> Categories</span>
          {categories.map(([c, n]) => (
            <button key={c} type="button" onClick={() => setRenaming({ from: c, to: c })} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-blood-500" title="Rename category">
              {c} <span className="text-zinc-500">({n})</span>
            </button>
          ))}
        </Panel>
      )}

      {m.loading ? <LoadingState /> : m.error ? <ErrorState onRetry={m.reload} /> : m.items.length === 0 ? (
        <EmptyState message="The gallery is empty." action={<Button size="sm" onClick={() => open()}>Upload first photo</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {m.items.map((g, i) => (
            <Panel key={g.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-ink-800">
                <img src={sizedImage(g.image_url, 500)} alt={g.alt_text} loading="lazy" className="h-full w-full object-cover" />
                {g.is_placeholder && <PlaceholderBadge label="Sample stock" className="absolute left-2 top-2" />}
              </div>
              <div className="flex items-center gap-3 p-3">
                <OrderButtons onUp={() => m.move(i, -1)} onDown={() => m.move(i, 1)} disableUp={i === 0 || m.busy} disableDown={i === m.items.length - 1 || m.busy} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{g.title || 'Untitled'}</p>
                  <p className="text-xs text-zinc-500">{g.category}</p>
                </div>
                <button type="button" aria-label="Edit" onClick={() => open(g)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button type="button" aria-label="Delete" onClick={() => setDeleting(g)} className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-blood-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit photo' : 'Add photo'}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <ImageField
              id="g-image"
              label="Photo"
              folder="gallery"
              value={editing.draft.image_url}
              onChange={(url, path) => setDraft({ image_url: url, storage_path: path, ...(path ? { is_placeholder: false } : {}) })}
            />
            <TextField id="g-title" label="Title" optional value={editing.draft.title} onChange={(e) => setDraft({ title: e.target.value })} maxLength={120} />
            <TextField id="g-alt" label="Description for screen readers" optional value={editing.draft.alt_text} onChange={(e) => setDraft({ alt_text: e.target.value })} maxLength={250} />
            <TextField id="g-cat" label="Category" list="gallery-categories" value={editing.draft.category} onChange={(e) => setDraft({ category: e.target.value })} maxLength={60} />
            <datalist id="gallery-categories">{categoryOptions.map((c) => <option key={c} value={c} />)}</datalist>
            <label className="flex items-center justify-between gap-4 rounded-md bg-ink-800 p-4 text-sm">
              <span>Sample / stock photo<span className="block text-xs text-zinc-500">Shows a "Sample" label so visitors know it is not the real gym.</span></span>
              <Toggle label="Sample photo" checked={editing.draft.is_placeholder} onChange={(v) => setDraft({ is_placeholder: v })} />
            </label>
            {formError && <p role="alert" className="text-sm text-blood-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={m.busy}>Save photo</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Rename category">
        {renaming && (
          <form onSubmit={rename} className="space-y-5">
            <TextField id="cat-name" label={`New name for "${renaming.from}"`} value={renaming.to} onChange={(e) => setRenaming({ ...renaming, to: e.target.value })} maxLength={60} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setRenaming(null)}>Cancel</Button>
              <Button type="submit">Rename</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete photo?"
        message="This photo will be removed from the gallery permanently."
        busy={m.busy}
        onConfirm={async () => deleting && (await m.remove(deleting.id, () => removeStoredImage(deleting.storage_path))) && setDeleting(null)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
