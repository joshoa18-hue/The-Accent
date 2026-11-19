import {
  BookOpen,
  Brain,
  Briefcase,
  Cpu,
  GraduationCap,
  Landmark,
  Languages,
  LayoutDashboard,
  Music,
  Shield,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName } from "@/config/navigation";
import type { SchoolIconName } from "@/types/school";

/**
 * Data stores icon NAMES (plain strings), because names can be saved in a
 * database and sent between server and browser. These maps turn names into
 * the actual icon components at the last moment.
 */
const schoolIcons: Record<SchoolIconName, LucideIcon> = {
  "book-open": BookOpen,
  cpu: Cpu,
  briefcase: Briefcase,
  brain: Brain,
  music: Music,
  languages: Languages,
  landmark: Landmark,
  sprout: Sprout,
};

const navIcons: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  schools: GraduationCap,
  character: Shield,
};

type IconProps = { className?: string };

export function SchoolIcon({ name, className }: IconProps & { name: SchoolIconName }) {
  const Icon = schoolIcons[name];
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}

export function NavIcon({ name, className }: IconProps & { name: NavIconName }) {
  const Icon = navIcons[name];
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}
