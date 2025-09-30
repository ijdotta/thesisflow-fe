import { ROUTES } from './routes';
import {Files, type LucideProps, Users2, GraduationCap, School, Tag, Layers, Landmark, Database, UploadCloud} from "lucide-react"
import type {ForwardRefExoticComponent, RefAttributes} from "react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Proyectos', href: ROUTES.projects, icon: Files},
  { label: 'Personas', href: ROUTES.people, icon: Users2 },
  { label: 'Profesores', href: ROUTES.professors, icon: School },
  { label: 'Alumnos', href: ROUTES.students, icon: GraduationCap },
  { label: 'Carreras', href: ROUTES.careers, icon: Landmark },
  { label: 'Dominios', href: ROUTES.applicationDomains, icon: Layers },
  { label: 'Etiquetas', href: ROUTES.tags, icon: Tag },
];

export const SIDEBAR_UTIL_ITEMS: SidebarItem[] = [
  { label: 'Backup', href: ROUTES.backup, icon: Database },
  { label: 'Import Data', href: ROUTES.importData, icon: UploadCloud },
];