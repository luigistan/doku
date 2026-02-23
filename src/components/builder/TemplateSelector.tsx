import { useState, useMemo } from "react";
import { templates } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import type { Template } from "@/types/builder";

const categoryMeta: Record<string, { label: string; icon: string }> = {
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
  event:      { label: "Evento",       icon: "🎤" },
  saas:       { label: "SaaS",         icon: "⚡" },
  login:      { label: "Login",        icon: "🔐" },
  pricing:    { label: "Precios",      icon: "💎" },
  veterinary: { label: "Veterinaria",  icon: "🐾" },
  notfound:   { label: "404",          icon: "🔍" },
};

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
  initialCategory?: string;
}

export function TemplateSelector({ onSelect, initialCategory }: TemplateSelectorProps) {
  const [category, setCategory] = useState(initialCategory || "all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Get unique category IDs preserving order
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return ["all", ...templates.reduce<string[]>((acc, t) => {
      if (!seen.has(t.id)) { seen.add(t.id); acc.push(t.id); }
      return acc;
    }, [])];
  }, []);

  // When "all" show first variant per category, otherwise show all variants
  const filtered = useMemo(() => {
    if (category === "all") {
      const seen = new Set<string>();
      return templates.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
    }
    return templates.filter(t => t.id === category);
  }, [category]);

  return (
    <div className="px-2 pb-4">
      <p className="mb-3 px-2 text-xs font-medium text-muted-foreground">
        {category === "all"
          ? "Elige una categoría o explora los templates:"
          : `${filtered.length} estilos disponibles — elige el que más te guste:`}
      </p>

      {/* Category pills */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto px-2 pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
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
            key={t.styleId}
            name={t.name}
            styleName={category !== "all" ? t.styleName : undefined}
            html={t.html}
            icon={categoryMeta[t.id]?.icon}
            onPreview={() => setPreviewTemplate(t)}
            onSelect={() => onSelect(`Crea un sitio tipo ${t.name} estilo ${t.styleName} profesional`)}
          />
        ))}
      </div>

      {/* Fullscreen preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          html={previewTemplate.html}
          name={`${previewTemplate.name} — ${previewTemplate.styleName}`}
          onSelect={() => {
            onSelect(`Crea un sitio tipo ${previewTemplate.name} estilo ${previewTemplate.styleName} profesional`);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
