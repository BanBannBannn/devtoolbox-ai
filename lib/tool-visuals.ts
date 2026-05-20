import {
  Bot,
  Braces,
  CalendarDays,
  CheckSquare,
  FileText,
  GitBranch,
  KeyRound,
  QrCode,
  type LucideIcon,
  Clock3,
  Fingerprint,
} from "lucide-react";

export type ToolVisual = {
  icon: LucideIcon;
  accent: string;
  iconClassName: string;
};

const defaultToolVisual: ToolVisual = {
  icon: Braces,
  accent: "from-slate-100 via-white to-slate-50",
  iconClassName: "bg-slate-950 text-white",
};

export const toolVisuals: Record<string, ToolVisual> = {
  "json-formatter": {
    icon: Braces,
    accent: "from-emerald-50 via-white to-cyan-50",
    iconClassName: "bg-emerald-600 text-white",
  },
  "jwt-decoder": {
    icon: KeyRound,
    accent: "from-sky-50 via-white to-emerald-50",
    iconClassName: "bg-sky-600 text-white",
  },
  "readme-generator": {
    icon: FileText,
    accent: "from-amber-50 via-white to-emerald-50",
    iconClassName: "bg-amber-500 text-white",
  },
  "uuid-generator": {
    icon: Fingerprint,
    accent: "from-fuchsia-50 via-white to-sky-50",
    iconClassName: "bg-fuchsia-600 text-white",
  },
  "qr-code-generator": {
    icon: QrCode,
    accent: "from-lime-50 via-white to-emerald-50",
    iconClassName: "bg-lime-600 text-white",
  },
  "date-calculator": {
    icon: CalendarDays,
    accent: "from-blue-50 via-white to-amber-50",
    iconClassName: "bg-blue-600 text-white",
  },
  "unix-timestamp-converter": {
    icon: Clock3,
    accent: "from-cyan-50 via-white to-blue-50",
    iconClassName: "bg-cyan-600 text-white",
  },
  "ai-coding-prompt-generator": {
    icon: Bot,
    accent: "from-violet-50 via-white to-sky-50",
    iconClassName: "bg-violet-600 text-white",
  },
  "git-command-helper": {
    icon: GitBranch,
    accent: "from-orange-50 via-white to-rose-50",
    iconClassName: "bg-orange-600 text-white",
  },
  "test-case-checklist-generator": {
    icon: CheckSquare,
    accent: "from-teal-50 via-white to-emerald-50",
    iconClassName: "bg-teal-600 text-white",
  },
};

export function getToolVisual(slug: string): ToolVisual {
  return toolVisuals[slug] ?? defaultToolVisual;
}
