/**
 * Template Variant System v2
 * Generates 3 structurally different design variants per template category.
 * Each variant applies BOTH color changes AND layout/typography transformations.
 */

export interface BaseTemplate {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  html: string;
  planSteps: string[];
}

export interface FullTemplate extends BaseTemplate {
  styleId: string;
  styleName: string;
}

// ── Layout Override Stylesheets ─────────────────────────────────
// These inject CSS that structurally changes the page layout via !important

const MINIMAL_LAYOUT = `
<style data-variant="minimal">
  body { background: #f8fafc !important; color: #1e293b !important; font-family: 'Inter', system-ui, sans-serif !important; }
  nav { background: rgba(255,255,255,0.95) !important; border-bottom-color: #e2e8f0 !important; backdrop-filter: blur(12px) !important; }
  nav div, nav a, nav span { color: #475569 !important; }
  nav div:first-child { color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; background: none !important; }
  section:first-of-type { background: linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%) !important; min-height: 70vh !important; }
  section:first-of-type h1 { -webkit-text-fill-color: #0f172a !important; background: none !important; font-weight: 900 !important; letter-spacing: -0.03em !important; }
  section:first-of-type p { color: #64748b !important; }
  section:first-of-type span[style*="background"] { background: #e2e8f0 !important; color: #475569 !important; border-color: #cbd5e1 !important; }
  section:first-of-type button, section:first-of-type a[style*="background"] { border-radius: 999px !important; }
  section:nth-of-type(2), section:nth-of-type(3), section:nth-of-type(4) { background: #ffffff !important; }
  div[style*="grid"] > div, div[style*="display: grid"] > div { background: #f8fafc !important; border-color: #e2e8f0 !important; border-radius: 20px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; }
  h2, h3 { color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; }
  p, span, div { }
  input, textarea, select { background: #ffffff !important; border-color: #e2e8f0 !important; color: #1e293b !important; border-radius: 12px !important; }
  footer { background: #f1f5f9 !important; border-top-color: #e2e8f0 !important; color: #64748b !important; }
  ::-webkit-scrollbar-track { background: #f1f5f9 !important; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1 !important; }
</style>`;

const BOLD_LAYOUT = `
<style data-variant="bold">
  body { background: #030712 !important; font-family: 'Inter', system-ui, sans-serif !important; letter-spacing: -0.01em !important; }
  nav { background: transparent !important; border-bottom: none !important; padding: 1.5rem 3rem !important; }
  section:first-of-type { min-height: 90vh !important; background: radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.1) 0%, transparent 50%), #030712 !important; padding: 6rem 3rem !important; }
  section:first-of-type h1 { font-size: clamp(3rem, 7vw, 5.5rem) !important; font-weight: 900 !important; line-height: 1.05 !important; letter-spacing: -0.04em !important; }
  section:first-of-type p { font-size: 1.25rem !important; max-width: 500px !important; }
  section:first-of-type button { padding: 1rem 2.5rem !important; font-size: 1rem !important; border-radius: 14px !important; }
  section { padding: 6rem 3rem !important; }
  div[style*="grid"] { gap: 1.5rem !important; }
  div[style*="grid"] > div, div[style*="display: grid"] > div { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 24px !important; padding: 2.5rem !important; backdrop-filter: blur(8px) !important; transition: all 0.4s cubic-bezier(0.16,1,0.3,1) !important; }
  div[style*="grid"] > div:hover { transform: translateY(-8px) !important; border-color: rgba(139,92,246,0.3) !important; box-shadow: 0 20px 40px -12px rgba(139,92,246,0.15) !important; }
  h2 { font-size: 2.5rem !important; font-weight: 800 !important; letter-spacing: -0.03em !important; }
  footer { background: transparent !important; border-top: 1px solid rgba(255,255,255,0.05) !important; }
</style>`;

// ── Color Palettes (kept minimal) ───────────────────────────────

type Replacements = Record<string, string>;

// For minimal (light) theme - change accent colors to muted tones
const minimalAccents: Record<string, Replacements> = {
  landing: { '#7c3aed': '#6366f1', '#6366f1': '#818cf8', '#a78bfa': '#6366f1', '124,58,237': '99,102,241', '#7c3aed22': '#6366f122', '#7c3aed44': '#6366f144' },
  restaurant: { '#d97706': '#b45309', '#ea580c': '#c2410c', '#f59e0b': '#d97706', '245,158,11': '180,83,9' },
  portfolio: { '#7c3aed': '#6366f1', '#6366f1': '#818cf8', '#a78bfa': '#6366f1', '124,58,237': '99,102,241' },
  blog: { '#7c3aed': '#6366f1', '#6366f1': '#818cf8', '124,58,237': '99,102,241' },
  dashboard: { '#7c3aed': '#2563eb', '#6366f1': '#3b82f6', '#a78bfa': '#60a5fa', '124,58,237': '37,99,235' },
  ecommerce: { '#2563eb': '#7c3aed', '#3b82f6': '#8b5cf6', '37,99,235': '124,58,237' },
  fitness: { '#059669': '#0891b2', '#10b981': '#06b6d4', '#34d399': '#22d3ee', '5,150,105': '8,145,178' },
  agency: { '#06b6d4': '#6366f1', '#0891b2': '#7c3aed', '6,182,212': '99,102,241' },
  medical: { '#0284c7': '#059669', '#38bdf8': '#34d399' },
  education: { '#d97706': '#7c3aed', '#ea580c': '#6366f1', '#f59e0b': '#a78bfa', '245,158,11': '124,58,237' },
  realestate: { '#e11d48': '#2563eb', '#f43f5e': '#3b82f6' },
  event: { '#d97706': '#e11d48', '#ea580c': '#f43f5e', '#f59e0b': '#fb7185', '245,158,11': '225,29,72' },
  saas: { '#7c3aed': '#059669', '#6366f1': '#10b981', '#a78bfa': '#34d399', '124,58,237': '5,150,105' },
  login: { '#7c3aed': '#2563eb', '#6366f1': '#3b82f6', '124,58,237': '37,99,235' },
  pricing: { '#7c3aed': '#ea580c', '#6366f1': '#f97316', '#a78bfa': '#fb923c', '124,58,237': '234,88,12' },
  veterinary: { '#06b6d4': '#059669', '#0891b2': '#10b981', '6,182,212': '5,150,105' },
  notfound: { '#7c3aed': '#e11d48', '#6366f1': '#f43f5e', '124,58,237': '225,29,72' },
};

// For bold theme - vibrant high-contrast colors
const boldAccents: Record<string, Replacements> = {
  landing: { '#7c3aed': '#8b5cf6', '#6366f1': '#a78bfa', '#a78bfa': '#c4b5fd', '124,58,237': '139,92,246' },
  restaurant: { '#d97706': '#dc2626', '#ea580c': '#ef4444', '#f59e0b': '#f87171', '#fef3c7': '#fee2e2', '#b8a078': '#fca5a5', '245,158,11': '220,38,38' },
  portfolio: { '#7c3aed': '#ec4899', '#6366f1': '#f472b6', '#a78bfa': '#f9a8d4', '124,58,237': '236,72,153' },
  blog: { '#7c3aed': '#14b8a6', '#6366f1': '#2dd4bf', '#a78bfa': '#5eead4', '124,58,237': '20,184,166' },
  dashboard: { '#7c3aed': '#f97316', '#6366f1': '#fb923c', '#a78bfa': '#fdba74', '124,58,237': '249,115,22' },
  ecommerce: { '#2563eb': '#059669', '#3b82f6': '#10b981', '#60a5fa': '#34d399', '37,99,235': '5,150,105' },
  fitness: { '#059669': '#dc2626', '#10b981': '#ef4444', '#34d399': '#f87171', '5,150,105': '220,38,38' },
  agency: { '#06b6d4': '#f59e0b', '#0891b2': '#d97706', '#67e8f9': '#fbbf24', '6,182,212': '245,158,11' },
  medical: { '#0284c7': '#7c3aed', '#38bdf8': '#a78bfa' },
  education: { '#d97706': '#06b6d4', '#ea580c': '#0891b2', '#f59e0b': '#22d3ee', '245,158,11': '6,182,212' },
  realestate: { '#e11d48': '#7c3aed', '#f43f5e': '#8b5cf6' },
  event: { '#d97706': '#2563eb', '#ea580c': '#3b82f6', '#f59e0b': '#60a5fa', '245,158,11': '37,99,235' },
  saas: { '#7c3aed': '#dc2626', '#6366f1': '#ef4444', '#a78bfa': '#f87171', '124,58,237': '220,38,38' },
  login: { '#7c3aed': '#059669', '#6366f1': '#10b981', '124,58,237': '5,150,105' },
  pricing: { '#7c3aed': '#2563eb', '#6366f1': '#3b82f6', '#a78bfa': '#60a5fa', '124,58,237': '37,99,235' },
  veterinary: { '#06b6d4': '#ec4899', '#0891b2': '#db2777', '#67e8f9': '#f9a8d4', '6,182,212': '236,72,153' },
  notfound: { '#7c3aed': '#059669', '#6366f1': '#10b981', '124,58,237': '5,150,105' },
};

// ── Helpers ─────────────────────────────────────────────────────

function colorize(html: string, r: Replacements): string {
  let result = html;
  const sorted = Object.entries(r).sort((a, b) => b[0].length - a[0].length);
  for (const [orig, repl] of sorted) {
    result = result.split(orig).join(repl);
  }
  return result;
}

function injectLayoutCSS(html: string, css: string): string {
  return html.replace('</head>', `${css}\n</head>`);
}

// ── Variant Generator ───────────────────────────────────────────

interface VariantDef {
  styleName: string;
  layoutCSS: string;
  accents: Replacements | null;
}

function getVariants(categoryId: string): VariantDef[] {
  return [
    {
      styleName: 'Original',
      layoutCSS: '',
      accents: null,
    },
    {
      styleName: 'Minimal',
      layoutCSS: MINIMAL_LAYOUT,
      accents: minimalAccents[categoryId] || null,
    },
    {
      styleName: 'Bold',
      layoutCSS: BOLD_LAYOUT,
      accents: boldAccents[categoryId] || null,
    },
  ];
}

export function generateVariants(base: BaseTemplate): FullTemplate[] {
  const variants = getVariants(base.id);

  return variants.map(v => {
    let html = base.html;

    // Apply color changes first
    if (v.accents) {
      html = colorize(html, v.accents);
    }

    // Inject layout CSS
    if (v.layoutCSS) {
      html = injectLayoutCSS(html, v.layoutCSS);
    }

    return {
      ...base,
      styleId: `${base.id}-${v.styleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      styleName: v.styleName,
      html,
    };
  });
}
