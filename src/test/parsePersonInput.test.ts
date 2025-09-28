import { describe, it, expect } from 'vitest';
import { parsePersonInput } from '@/components/projectWizard/parsePerson';

describe('parsePersonInput', () => {
  it('parses "Lastname, Name" format', () => {
    const p = parsePersonInput('Doe, John');
    expect(p).toEqual({ name: 'John', lastname: 'Doe' });
  });
  it('parses "Name Lastname" format', () => {
    const p = parsePersonInput('John Doe');
    expect(p).toEqual({ name: 'John', lastname: 'Doe' });
  });
  it('handles single token as name', () => {
    const p = parsePersonInput('Plato');
    expect(p).toEqual({ name: 'Plato', lastname: '' });
  });
  it('returns null for blank', () => {
    const p = parsePersonInput('   ');
    expect(p).toBeNull();
  });
  it('trims spaces around comma', () => {
    const p = parsePersonInput('  Doe  ,   Jane  ');
    expect(p).toEqual({ name: 'Jane', lastname: 'Doe' });
  });
});

