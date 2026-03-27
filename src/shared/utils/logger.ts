export function maskEmail(email?: string | null): string | null {
  if (!email) return null;

  const [name, domain] = email.split('@');
  if (!domain) return '***';

  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}