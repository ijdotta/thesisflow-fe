export const roleDisplayNames: Record<string, string> = {
  DIRECTOR: 'Director',
  STUDENT: 'Alumno',
  CODIRECTOR: 'Co-director',
  COLLABORATOR: 'Colaborador',
}

export function getRoleDisplayName(role: string): string {
  return roleDisplayNames[role] || role
}
