export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const clean = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
export const cleanMultiline = (value: string) => value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();

export function normalizePhone(value: string): string {
  return value.replace(/[^\d+ ]/g, '').replace(/\s+/g, ' ').trim();
}

export function validateName(value: string): string | undefined {
  const v = clean(value);
  if (!v) return 'Please enter your name.';
  if (v.length < 2) return 'Name looks too short.';
  if (v.length > 100) return 'Name is too long.';
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const v = normalizePhone(value);
  const digits = v.replace(/\D/g, '');
  if (!v) return 'Please enter your phone number.';
  if (digits.length < 10 || digits.length > 13 || !/^\+?[0-9 ]{10,16}$/.test(v)) return 'Enter a valid phone number.';
  return undefined;
}

export function validateEmail(value: string, required = false): string | undefined {
  const v = value.trim();
  if (!v) return required ? 'Please enter your email.' : undefined;
  if (v.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Enter a valid email address.';
  return undefined;
}

export function validateLength(value: string, max: number, label: string, required = false): string | undefined {
  const v = value.trim();
  if (required && !v) return `Please enter ${label}.`;
  if (v.length > max) return `${label[0].toUpperCase()}${label.slice(1)} must be under ${max} characters.`;
  return undefined;
}
