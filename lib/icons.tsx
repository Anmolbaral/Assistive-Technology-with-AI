/**
 * Shared icon map for consistent Lucide icons across the platform.
 * Replaces emoji usage for a more professional, credible appearance.
 */

import {
  Zap,
  Clock,
  Target,
  BookOpen,
  Lock,
  Shield,
  GraduationCap,
  PenTool,
  Wrench,
  BarChart3,
  CheckCircle2,
  User,
  Building2,
  Camera,
  Hash,
  Mail,
  FileText,
  Monitor,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  clock: Clock,
  target: Target,
  book: BookOpen,
  lock: Lock,
  shield: Shield,
  graduation: GraduationCap,
  pen: PenTool,
  wrench: Wrench,
  chart: BarChart3,
  check: CheckCircle2,
  user: User,
  building: Building2,
  camera: Camera,
  hash: Hash,
  mail: Mail,
  file: FileText,
  monitor: Monitor,
  lightbulb: Lightbulb,
};

export function getIcon(key: string): LucideIcon | undefined {
  return ICON_MAP[key];
}
