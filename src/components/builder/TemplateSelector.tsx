import { useState } from "react";
import { templates } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

const categoryMap: Record<string, { label: string; icon: string }> = {
  all:        { label: "Todos",        icon: "🌐" },
  landing:    { label: "Landing",      icon: "🚀" },
  restaurant: { label: "Restaurante",  icon: "🍽️" },
  ecommerce:  { label: "Tienda",       icon: "🛒" },
  portfolio:  { label: "Portfolio",    icon: "💼" },
  blog:       { label: "Blog",         icon: "✍️" },
  dashboard:  { label: "Dashboard",    icon: "📊" },
  fitness:    { label: "Fitness",      icon: "💪" },
  agency:     { label: "Agencia",      icon: "🚀" },
  medical:    { label: "Clínica",      icon: "🏥" },
  education:  { label: "Educación",    icon: "🎓" },
  realestate: { label: "Inmobiliaria", icon: "🏠" },
  login:      { label: "Login",        icon: "🔐" },
};

const templateIcons: Record<string, string> = {
  landing: "🚀",
  restaurant: "🍽️",
  ecommerce: "🛒",
  portfolio: "💼",
  blog: "✍️",
  dashboard: "📊",
  fitness: "💪",
  agency: "🚀",
  medical: "🏥",
  education: "🎓",
  realestate: "🏠",
  login: "🔐",
};

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [category, setCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[number] | null>(null);

  const categories = ["all", ...Array.from(new Set(templates.map((t) => t.id)))];
  const filtered = category === "all" ? templates : templates.filter((t) => t.id === category);

  return (
    <div className="px-2 pb-4">
      <p className="mb-3 px-2 text-xs font-medium text-muted-foreground">
        O elige un template para empezar:
      </p>

      {/* Category pills */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto px-2 pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const meta = categoryMap[cat];
          if (!meta) return null;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-brain text-brain-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              }`}
            >
              <span className="text-sm">{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Template cards grid */}
      <div className="grid grid-cols-1 gap-3 px-1 sm:grid-cols-2">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            name={t.name}
            html={t.html}
            icon={templateIcons[t.id]}
            onPreview={() => setPreviewTemplate(t)}
            onSelect={() => onSelect(`Crea un sitio tipo ${t.name} profesional`)}
          />
        ))}
      </div>

      {/* Fullscreen preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          html={previewTemplate.html}
          name={previewTemplate.name}
          onSelect={() => {
            onSelect(`Crea un sitio tipo ${previewTemplate.name} profesional`);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
