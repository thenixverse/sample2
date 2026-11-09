import { requireSupabase, GALLERY_BUCKET } from '@/lib/supabase';
import { toSettings } from '@/services/content';
import type { BusinessSettings } from '@/types';

export type ContentTable = 'membership_plans' | 'training_programs' | 'gallery_images' | 'testimonials';

export async function listRows<T>(table: ContentTable): Promise<T[]> {
  const { data, error } = await requireSupabase().from(table).select('*').order('sort_order').order('created_at');
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function insertRow<T>(table: ContentTable, values: Partial<T>): Promise<void> {
  const { error } = await requireSupabase().from(table).insert(values);
  if (error) throw error;
}

export async function updateRow<T>(table: ContentTable, id: string, values: Partial<T>): Promise<void> {
  const { error } = await requireSupabase().from(table).update(values).eq('id', id);
  if (error) throw error;
}

export async function deleteRow(table: ContentTable, id: string): Promise<void> {
  const { error } = await requireSupabase().from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function swapOrder(table: ContentTable, a: { id: string; sort_order: number }, b: { id: string; sort_order: number }) {
  const aOrder = a.sort_order === b.sort_order ? b.sort_order + 1 : b.sort_order;
  await Promise.all([updateRow(table, a.id, { sort_order: aOrder }), updateRow(table, b.id, { sort_order: a.sort_order })]);
}

export async function fetchSettings(): Promise<BusinessSettings> {
  const { data, error } = await requireSupabase().from('business_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return toSettings(data);
}

export async function saveSettings(settings: BusinessSettings): Promise<void> {
  const { error } = await requireSupabase().from('business_settings').update(settings).eq('id', 1);
  if (error) throw error;
}

export async function renameGalleryCategory(from: string, to: string): Promise<void> {
  const { error } = await requireSupabase().from('gallery_images').update({ category: to }).eq('category', from);
  if (error) throw error;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | undefined {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG, WebP or AVIF images are allowed.';
  if (file.size > MAX_UPLOAD_BYTES) return 'Image must be 5 MB or smaller.';
  return undefined;
}

export async function uploadImage(file: File, folder: string): Promise<{ url: string; path: string }> {
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const db = requireSupabase();
  const { error } = await db.storage.from(GALLERY_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = db.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removeStoredImage(path: string | null): Promise<void> {
  if (!path) return;
  const { error } = await requireSupabase().storage.from(GALLERY_BUCKET).remove([path]);
  if (error) console.error('storage remove failed', error);
}
