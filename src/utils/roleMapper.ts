export const roleDisplayNames: Record<string, string> = {
  DIRECTOR: 'Director',
  STUDENT: 'Alumno',
  CODIRECTOR: 'Co-director',
  CO_DIRECTOR: 'Co-director',
  COLLABORATOR: 'Colaborador',
}

export function getRoleDisplayName(role: string): string {
  return roleDisplayNames[role] || role
}

const ROLE_ORDER: Record<string, number> = {
  DIRECTOR: 1,
  CO_DIRECTOR: 2,
  CODIRECTOR: 2,
  COLLABORATOR: 3,
  STUDENT: 4,
}

export function sortParticipants<T extends { role: string }>(participants: T[]): T[] {
  return [...participants].sort((a, b) => {
    const orderA = ROLE_ORDER[a.role] ?? 99
    const orderB = ROLE_ORDER[b.role] ?? 99
    if (orderA !== orderB) return orderA - orderB
    // If same role, sort by name
    const nameA = 'personDTO' in a ? (a.personDTO as any).lastname : ''
    const nameB = 'personDTO' in b ? (b.personDTO as any).lastname : ''
    return nameA.localeCompare(nameB)
  })
}
