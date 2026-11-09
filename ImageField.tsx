import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadImage, validateImageFile } from '@/services/admin';
import { useToast } from '@/admin/hooks/useToast';
import { safeExternalUrl } from '@/utils/helpers';

interface ImageFieldProps {
  id: string;
  label: string;
  value: string;
  folder: string;
  onChange: (url: string, storagePath: string | null) => void;
}

export default function ImageField({ id, label, value, folder, onChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const notify = useToast();
  const preview = safeExternalUrl(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) return notify(problem, 'error');
    setUploading(true);
    try {
      const { url, path } = await uploadImage(file, folder);
      onChange(url, path);
      notify('Image uploaded');
    } catch (cause) {
      console.error('upload failed', cause);
      notify('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-ink-800">
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-zinc-600" />}
        </div>
        <div className="flex-1 space-y-2">
          <input id={id} className="input" placeholder="https://..." value={value} onChange={(e) => onChange(e.target.value, null)} maxLength={1000} />
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:border-white/30 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {uploading ? 'Uploading' : 'Upload image'}
          </button>
          <p className="text-[11px] text-zinc-500">JPG, PNG, WebP or AVIF, up to 5 MB.</p>
        </div>
      </div>
    </div>
  );
}
