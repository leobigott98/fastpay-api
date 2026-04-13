export function maskEmail(email?: string | null): string | null {
  if (!email) return null;
  const [name, domain] = email.split('@');
  if (!domain) return '***';
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone?: string | null): string | null {
  if (!phone) return null;
  if (phone.length <= 4) return '***';
  return `${'*'.repeat(Math.max(phone.length - 4, 1))}${phone.slice(-4)}`;
}

export function maskDocument(value?: string | null): string | null {
  if (!value) return null;
  if (value.length <= 3) return '***';
  return `${'*'.repeat(value.length - 3)}${value.slice(-3)}`;
}