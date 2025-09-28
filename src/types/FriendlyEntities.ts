// Friendly (UI-facing) entity shapes used across the app / wizard
export interface FriendlyPerson {
  id: string;
  name: string;
  lastname: string;
  email?: string;
  display: string; // convenience (e.g., "Lastname, Name")
}

export interface FriendlyStudent extends FriendlyPerson {
  studentId?: string;
  career?: string;
}

export interface FriendlyApplicationDomain {
  publicId: string;
  name: string;
  description?: string;
  display: string; // name (or enriched)
}

export interface FriendlyCareer {
  id?: string;
  name: string;
  description?: string;
  display: string;
}
