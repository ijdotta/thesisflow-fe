// Friendly (UI-facing) entity shapes used across the app / wizard
export interface FriendlyPerson {
  publicId: string;
  name: string;
  lastname: string;
  email?: string;
  display: string; // convenience (e.g., "Lastname, Name")
}

export interface FriendlyStudent extends FriendlyPerson {
  studentId?: string;
  careers?: string[]; // multi-career list
  email?: string; // added
}

export interface FriendlyApplicationDomain {
  publicId: string;
  name: string;
  description?: string;
  display: string; // name (or enriched)
}

export interface FriendlyCareer {
  publicId: string;
  name: string;
  description?: string;
  display: string;
}

export interface FriendlyTag {
  publicId: string;
  name: string;
  description?: string;
  display: string;
}
