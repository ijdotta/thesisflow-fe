import type { PersonBase } from './types';

// Parse a free-form input like "Lastname, Name" or "Full Name Lastname"
export function parsePersonInput(input: string): PersonBase | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes(',')) {
    const [last, name] = trimmed.split(',').map(s => s.trim());
    return { lastname: last || name || '', name: name || last || '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { name: parts[0], lastname: '' };
  const lastname = parts.pop()!;
  const name = parts.join(' ');
  return { name, lastname };
}

