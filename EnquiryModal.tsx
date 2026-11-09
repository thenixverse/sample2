import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Send, MessageCircle, Phone, Mail } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { TextField, TextArea, SelectField } from '@/components/ui/Field';
import { FormAlert, FormSuccess } from '@/components/enquiry/FormFeedback';
import { useSiteContent } from '@/hooks/useSiteContent';
import type { EnquiryRequest } from '@/hooks/useEnquiry';
import { submitEnquiry, SUBMIT_MESSAGES } from '@/services/enquiries';
import { isSupabaseConfigured } from '@/lib/supabase';
import { clean, cleanMultiline, normalizePhone, validateEmail, validateLength, validateName, validatePhone, type FieldErrors } from '@/utils/validation';
import { cn, whatsappUrl } from '@/utils/helpers';
import type { ContactMethod } from '@/types';

type Field = 'name' | 'phone' | 'email' | 'plan' | 'message';

const CONTACT_METHODS: { value: ContactMethod; label: string; icon: typeof Phone }[] = [
  { value: 'phone', label: 'Call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'email', label: 'Email', icon: Mail },
];

const empty = { name: '', phone: '', email: '', plan: '', method: 'whatsapp' as ContactMethod, message: '' };

export default function EnquiryModal({ request, onClose }: { request: EnquiryRequest | null; onClose: () => void }) {
  const { content } = useSiteContent();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!request) return;
    setForm({ ...empty, plan: request.plan ?? (request.type === 'personal_training' ? 'Personal Training' : '') });
    setErrors({});
    setDone(false);
    setAlert(null);
  }, [request]);

  const planOptions = Array.from(
    new Set([...content.plans.map((p) => p.name), 'Personal Training', ...content.programs.map((p) => p.name), 'Not sure yet']),
  );

  const set = (key: keyof typeof empty, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as Field]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || !request) return;
    const next: FieldErrors<Field> = {
      name: validateName(form.name),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email, form.method === 'email'),
      plan: form.plan ? undefined : 'Please choose an option.',
      message: validateLength(form.message, 2000, 'message'),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setAlert(null);
    const result = await submitEnquiry({
      enquiry_type: request.type,
      full_name: clean(form.name),
      phone: normalizePhone(form.phone),
      email: form.email.trim() || null,
      interested_plan: clean(form.plan),
      preferred_contact: form.method,
      message: cleanMultiline(form.message) || null,
    });
    setSubmitting(false);
    if (result.ok) setDone(true);
    else setAlert(SUBMIT_MESSAGES[result.reason]);
  };

  const title = request?.title ?? (request?.type === 'personal_training' ? 'Personal Training' : 'Join the Gym');

  return (
    <Modal open={!!request} onClose={onClose} title={title}>
      {done ? (
        <FormSuccess
          title="Enquiry received"
          message={`Thank you, ${clean(form.name).split(' ')[0]}. The MR. THANOS FITNESS team will contact you shortly via ${form.method === 'phone' ? 'phone call' : form.method}.`}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {!isSupabaseConfigured && <FormAlert tone="warning" message={SUBMIT_MESSAGES.demo} />}
          <p className="text-sm text-muted">Share your details and we will get back to you about memberships and training options.</p>
          <TextField id="eq-name" label="Full name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} maxLength={100} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="eq-phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} maxLength={16} />
            <TextField id="eq-email" label="Email" type="email" autoComplete="email" optional={form.method !== 'email'} value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} maxLength={254} />
          </div>
          <SelectField id="eq-plan" label="Interested in" value={form.plan} onChange={(e) => set('plan', e.target.value)} error={errors.plan}>
            <option value="" disabled>Select an option</option>
            {planOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </SelectField>
          <fieldset>
            <legend className="label">Preferred contact method</legend>
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_METHODS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-within:ring-2 focus-within:ring-blood-500',
                    form.method === value ? 'border-blood-500 bg-blood-500/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/30',
                  )}
                >
                  <input type="radio" name="eq-method" value={value} checked={form.method === value} onChange={() => set('method', value)} className="sr-only" />
                  <Icon className="h-4 w-4" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <TextArea id="eq-message" label="Additional message" optional value={form.message} onChange={(e) => set('message', e.target.value)} error={errors.message} maxLength={2000} placeholder="Tell us about your goals or preferred timings" />
          {alert && <FormAlert message={alert} />}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" size="lg" disabled={submitting || !isSupabaseConfigured} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Sending' : 'Submit enquiry'}
            </Button>
            <LinkButton variant="whatsapp" size="lg" href={whatsappUrl(content.settings.whatsapp_number)}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </LinkButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
