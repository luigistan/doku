import {
  Rocket,
  UtensilsCrossed,
  Briefcase,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  Dumbbell,
  Stethoscope,
  Building,
  Laptop,
  GraduationCap,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

interface Template {
  icon: LucideIcon;
  name: string;
  prompt: string;
}

const templates: Template[] = [
  { icon: Rocket, name: "Landing Page", prompt: "Crea una landing page profesional" },
  { icon: UtensilsCrossed, name: "Restaurante", prompt: "Crea un sitio para restaurante" },
  { icon: Briefcase, name: "Portfolio", prompt: "Crea un portfolio profesional" },
  { icon: ShoppingCart, name: "E-Commerce", prompt: "Crea una tienda online" },
  { icon: FileText, name: "Blog", prompt: "Crea un blog" },
  { icon: LayoutDashboard, name: "Dashboard", prompt: "Crea un dashboard administrativo" },
  { icon: Dumbbell, name: "Gimnasio", prompt: "Crea un sitio para gimnasio" },
  { icon: Stethoscope, name: "Clínica", prompt: "Crea un sitio para clinica medica" },
  { icon: Building, name: "Inmobiliaria", prompt: "Crea un sitio de bienes raices" },
  { icon: Laptop, name: "SaaS", prompt: "Crea una landing para producto SaaS" },
  { icon: GraduationCap, name: "Educación", prompt: "Crea un sitio de cursos online" },
  { icon: PawPrint, name: "Veterinaria", prompt: "Crea un sitio para veterinaria" },
];

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="px-4 pb-4">
      <p className="mb-3 text-xs font-medium text-muted-foreground">
        O elige un template para empezar:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => (
          <button
            key={t.name}
            onClick={() => onSelect(t.prompt)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-brain hover:bg-surface-3"
          >
            <t.icon className="h-4 w-4 shrink-0 text-brain" />
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
