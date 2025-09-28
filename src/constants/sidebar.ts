import { ROUTES } from './routes';
import {Files, type LucideProps, Users2, GraduationCap, School} from "lucide-react"
import type {ForwardRefExoticComponent, RefAttributes} from "react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Projects', href: ROUTES.projects, icon: Files},
  { label: 'People', href: ROUTES.people, icon: Users2 },
  { label: 'Professors', href: ROUTES.professors, icon: School },
  { label: 'Students', href: ROUTES.students, icon: GraduationCap },
];