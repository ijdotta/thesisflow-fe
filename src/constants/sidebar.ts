import { ROUTES } from './routes';
import {Files, type LucideProps, Users2} from "lucide-react"
import type {ForwardRefExoticComponent, RefAttributes} from "react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Projects', href: ROUTES.projects, icon: Files},
  { label: 'People', href: ROUTES.people, icon: Users2 },
];