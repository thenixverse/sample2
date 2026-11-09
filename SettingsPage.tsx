import { useEffect, useState, type FormEvent } from 'react';
import { Plus, X, Loader2, Save } from 'lucide-react';
import { fetchSettings, saveSettings } from '@/services/admin';
import { useAsyncData } from '@/admin/hooks/useAsyncData';
import { useToast } from '@/admin/hooks/useToast';
import { ErrorState, LoadingState, PageHeader, Panel } from '@/admin/components/AdminUI';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { clean, cleanMultiline, validateEmail, validatePhone } from '@/utils/validation';
import { safeExternalUrl } from '@/utils/helpers';
import type { BusinessSettings } from '@/types';

export default function SettingsPage() {
  const { data, loading, error, reload } = useAsyncData(fetchSettings);
  const notify = useToast();
  const [form, setForm] = useState<BusinessSettings | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading && !form) return <LoadingState />;
  if (error || !form) return <ErrorState onRetry={reload} />;

  const set = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => setForm((f) => f && { ...f, [key]: value });

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const wa = form.whatsapp_number.replace(/\D/g, '');
    const urlError = (v: string) => (v.trim() && !safeExternalUrl(v.trim()) ? 'Enter a full web address starting with https://' : undefined);
    const next = {
      business_name: clean(form.business_name) ? undefined : 'Business name is required.',
      phone: validatePhone(form.phone),
      whatsapp_number: wa.length >= 10 && wa.length <= 15 ? undefined : 'Enter the number with country code, e.g. 918248907533.',
      email: validateEmail(form.email),
      address: cleanMultiline(form.address) ? undefined : 'Address is required.',
      maps_url: urlError(form.maps_url),
      instagram_url: urlError(form.instagram_url),
      facebook_url: urlError(form.facebook_url),
      youtube_url: urlError(form.youtube_url),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSaving(true);
    try {
      await saveSettings({
        ...form,
        business_name: clean(form.business_name),
        phone: clean(form.phone),
        whatsapp_number: wa,
        email: form.email.trim(),
        address: cleanMultiline(form.address),
        maps_url: form.maps_url.trim(),
        instagram_url: form.instagram_url.trim(),
        facebook_url: form.facebook_url.trim(),
        youtube_url: form.youtube_url.trim(),
        hours: form.hours.map((h) => ({ day: clean(h.day), times: clean(h.times) })).filter((h) => h.day && h.times),
      });
      notify('Settings saved');
      reload();
    } catch (cause) {
      console.error(cause);
      notify('Could not save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Business settings"
        description="Contact details shown across the website."
        action={<Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="space-y-5 p-6">
          <h2 className="font-display text-2xl uppercase tracking-wide">Contact</h2>
          <TextField id="s-name" label="Business name" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} error={errors.business_name} maxLength={100} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="s-phone" label="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} maxLength={20} />
            <TextField id="s-wa" label="WhatsApp number" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} error={errors.whatsapp_number} maxLength={20} />
          </div>
          <TextField id="s-email" label="Email" optional type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} maxLength={254} />
          <TextArea id="s-address" label="Address" rows={4} value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} maxLength={400} />
          <TextField id="s-maps" label="Google Maps link" optional value={form.maps_url} onChange={(e) => set('maps_url', e.target.value)} error={errors.maps_url} maxLength={500} />
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4 p-6">
            <h2 className="font-display text-2xl uppercase tracking-wide">Opening hours</h2>
            {form.hours.map((h, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                <input aria-label="Days" className="input" placeholder="Monday – Saturday" value={h.day} maxLength={60} onChange={(e) => set('hours', form.hours.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))} />
                <input aria-label="Times" className="input" placeholder="5:30 AM – 11:00 AM" value={h.times} maxLength={120} onChange={(e) => set('hours', form.hours.map((x, j) => (j === i ? { ...x, times: e.target.value } : x)))} />
                <button type="button" aria-label="Remove row" onClick={() => set('hours', form.hours.filter((_, j) => j !== i))} className="flex items-center justify-center rounded-md border border-white/10 px-3 py-3 text-zinc-400 hover:text-blood-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.hours.length < 10 && (
              <button type="button" onClick={() => set('hours', [...form.hours, { day: '', times: '' }])} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blood-400 hover:text-blood-300">
                <Plus className="h-3.5 w-3.5" /> Add row
              </button>
            )}
          </Panel>
          <Panel className="space-y-5 p-6">
            <h2 className="font-display text-2xl uppercase tracking-wide">Social media</h2>
            <TextField id="s-ig" label="Instagram" optional placeholder="https://instagram.com/..." value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} error={errors.instagram_url} maxLength={300} />
            <TextField id="s-fb" label="Facebook" optional placeholder="https://facebook.com/..." value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} error={errors.facebook_url} maxLength={300} />
            <TextField id="s-yt" label="YouTube" optional placeholder="https://youtube.com/..." value={form.youtube_url} onChange={(e) => set('youtube_url', e.target.value)} error={errors.youtube_url} maxLength={300} />
          </Panel>
        </div>
      </div>
    </form>
  );
}
