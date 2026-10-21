import {
  Archive,
  Clock,
  Database,
  FileText,
  LayoutDashboard,
  Network,
  PlayCircle,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Vue d'ensemble", to: "/", icon: LayoutDashboard },
  { label: "Investigations", to: "/investigations", icon: Search },
  { label: "Sources", to: "/sources", icon: Database },
  { label: "Collectes", to: "/collectes", icon: PlayCircle },
  { label: "Entités & relations", to: "/entities", icon: Network },
  { label: "Chronologie", to: "/chronologie", icon: Clock },
  { label: "Preuves", to: "/preuves", icon: Archive },
  { label: "Rapports", to: "/rapports", icon: FileText },
  { label: "Paramètres", to: "/parametres", icon: Settings },
];
