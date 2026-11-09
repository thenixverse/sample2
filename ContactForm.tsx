import { useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { FormAlert, FormSuccess } from '@/components/enquiry/FormFeedback';
import { submitEnquiry, SUBMIT_MESSAGES } from '@/services/enquiries';
import { isSupabaseConfigured } from '@/lib/supabase';
import { clean, cleanMultiline, normalizePhone, validateEmail, validateLength, validateName, validatePhone, type FieldErrors } from '@/utils/validation';

type Field = 'name' | 'phone' | 'email' | 'subject' | 'message';
const empty: Record<Field, string> = { name: '', phone: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const set = (key: Field, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const next: FieldErrors<Field> = {
      name: validateName(form.name),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email, true),
      subject: validateLength(form.subject, 150, 'a subject', true),
      message: validateLength(form.message, 2000, 'a message', true),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setAlert(null);
    const result = await submitEnquiry({
      enquiry_type: 'contact',
      full_name: clean(form.name),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      subject: clean(form.subject),
      message: cleanMultiline(form.message),
      preferred_contact: 'email',
    });
    setSubmitting(false);
    if (result.ok) setDone(true);
    else setAlert(SUBMIT_MESSAGES[result.reason]);
  };

  if (done) {
    return (
      <FormSuccess
        title="Message sent"
        message="Thanks for reaching out. We have received your message and will reply as soon as possible."
        onReset={() => {
          setForm(empty);
          setDone(false);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {!isSupabaseConfigured && <FormAlert tone="warning" message={SUBMIT_MESSAGES.demo} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="c-name" label="Name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} maxLength={100} />
        <TextField id="c-phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} maxLength={16} />
      </div>
      <TextField id="c-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} maxLength={254} />
      <TextField id="c-subject" label="Subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} error={errors.subject} maxLength={150} />
      <TextArea id="c-message" label="Message" rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} error={errors.message} maxLength={2000} />
      {alert && <FormAlert message={alert} />}
      <Button type="submit" size="lg" disabled={submitting || !isSupabaseConfigured} className="w-full">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Sending' : 'Send message'}
      </Button>
    </form>
  );
}
