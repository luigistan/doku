/**
 * Template Variant System
 * Generates 5 color variants per template category using intelligent color swapping.
 */

type Replacements = Record<string, string>;

interface PaletteEntry {
  styleName: string;
  replacements: Replacements | null; // null = keep original
}

function colorize(html: string, r: Replacements): string {
  let result = html;
  // Sort keys by length descending to avoid partial matches
  const sorted = Object.entries(r).sort((a, b) => b[0].length - a[0].length);
  for (const [orig, repl] of sorted) {
    result = result.split(orig).join(repl);
  }
  return result;
}

// ── Color Palettes ──────────────────────────────────────────────

// Purple base (landing, portfolio, blog, dashboard, login, saas, pricing, notfound)
const purpleToEmerald: Replacements = {
  '#7c3aed': '#059669', '#6366f1': '#10b981', '#a78bfa': '#34d399',
  '#818cf8': '#6ee7b7', '124,58,237': '5,150,105',
};
const purpleToOcean: Replacements = {
  '#7c3aed': '#2563eb', '#6366f1': '#3b82f6', '#a78bfa': '#60a5fa',
  '#818cf8': '#93c5fd', '124,58,237': '37,99,235',
};
const purpleToSunset: Replacements = {
  '#7c3aed': '#ea580c', '#6366f1': '#f97316', '#a78bfa': '#fb923c',
  '#818cf8': '#fdba74', '124,58,237': '234,88,12',
};
const purpleToRose: Replacements = {
  '#7c3aed': '#e11d48', '#6366f1': '#f43f5e', '#a78bfa': '#fb7185',
  '#818cf8': '#fda4af', '124,58,237': '225,29,72',
};
const purpleToAmber: Replacements = {
  '#7c3aed': '#d97706', '#6366f1': '#f59e0b', '#a78bfa': '#fbbf24',
  '#818cf8': '#fde68a', '124,58,237': '217,119,6',
};

// Amber base (restaurant, education, event)
const amberToRose: Replacements = {
  '#d97706': '#e11d48', '#ea580c': '#f43f5e', '#f59e0b': '#fb7185',
  '#fbbf24': '#fda4af', '#fef3c7': '#ffe4e6', '#b8a078': '#c084a0',
  '#d9770622': '#e11d4822', '#d9770644': '#e11d4844',
  '245,158,11': '225,29,72',
};
const amberToEmerald: Replacements = {
  '#d97706': '#059669', '#ea580c': '#10b981', '#f59e0b': '#34d399',
  '#fbbf24': '#6ee7b7', '#fef3c7': '#d1fae5', '#b8a078': '#6aab8a',
  '#d9770622': '#05966922', '#d9770644': '#05966944',
  '245,158,11': '5,150,105',
};
const amberToOcean: Replacements = {
  '#d97706': '#2563eb', '#ea580c': '#3b82f6', '#f59e0b': '#60a5fa',
  '#fbbf24': '#93c5fd', '#fef3c7': '#dbeafe', '#b8a078': '#7093c5',
  '#d9770622': '#2563eb22', '#d9770644': '#2563eb44',
  '245,158,11': '37,99,235',
};
const amberToPurple: Replacements = {
  '#d97706': '#7c3aed', '#ea580c': '#6366f1', '#f59e0b': '#a78bfa',
  '#fbbf24': '#c4b5fd', '#fef3c7': '#ede9fe', '#b8a078': '#a08bb8',
  '#d9770622': '#7c3aed22', '#d9770644': '#7c3aed44',
  '245,158,11': '124,58,237',
};
const amberToCyan: Replacements = {
  '#d97706': '#0891b2', '#ea580c': '#06b6d4', '#f59e0b': '#22d3ee',
  '#fbbf24': '#67e8f9', '#fef3c7': '#cffafe', '#b8a078': '#60a5b8',
  '#d9770622': '#0891b222', '#d9770644': '#0891b244',
  '245,158,11': '8,145,178',
};

// Ocean/Blue base (ecommerce)
const oceanToRose: Replacements = {
  '#2563eb': '#e11d48', '#3b82f6': '#f43f5e', '#60a5fa': '#fb7185',
  '#dbeafe': '#ffe4e6', '#7093c5': '#c084a0',
  '#0a0f18': '#0f0a10', '#0f1525': '#150f18', '#1a2a4a': '#2a1a30',
  '37,99,235': '225,29,72',
};
const oceanToEmerald: Replacements = {
  '#2563eb': '#059669', '#3b82f6': '#10b981', '#60a5fa': '#34d399',
  '#dbeafe': '#d1fae5', '#7093c5': '#6aab8a',
  '#0a0f18': '#0a0f0e', '#0f1525': '#0f1510', '#1a2a4a': '#1a3025',
  '37,99,235': '5,150,105',
};
const oceanToAmber: Replacements = {
  '#2563eb': '#d97706', '#3b82f6': '#f59e0b', '#60a5fa': '#fbbf24',
  '#dbeafe': '#fef3c7', '#7093c5': '#b8a078',
  '#0a0f18': '#0f0c08', '#0f1525': '#151008', '#1a2a4a': '#302010',
  '37,99,235': '217,119,6',
};
const oceanToPurple: Replacements = {
  '#2563eb': '#7c3aed', '#3b82f6': '#8b5cf6', '#60a5fa': '#a78bfa',
  '#dbeafe': '#ede9fe', '#7093c5': '#a08bb8',
  '#0a0f18': '#0a0a12', '#0f1525': '#0f0f1a', '#1a2a4a': '#1e1e3a',
  '37,99,235': '124,58,237',
};
const oceanToCyan: Replacements = {
  '#2563eb': '#0891b2', '#3b82f6': '#06b6d4', '#60a5fa': '#22d3ee',
  '#dbeafe': '#cffafe', '#7093c5': '#60a5b8',
  '37,99,235': '8,145,178',
};

// Emerald base (fitness)
const emeraldToRose: Replacements = {
  '#059669': '#e11d48', '#10b981': '#f43f5e', '#34d399': '#fb7185',
  '#d1fae5': '#ffe4e6', '#6aab8a': '#c084a0',
  '#060f0a': '#0f0608', '#0a150e': '#140810', '#0f1f15': '#1f0f18', '#153025': '#301520',
  '5,150,105': '225,29,72',
};
const emeraldToOcean: Replacements = {
  '#059669': '#2563eb', '#10b981': '#3b82f6', '#34d399': '#60a5fa',
  '#d1fae5': '#dbeafe', '#6aab8a': '#7093c5',
  '#060f0a': '#060a0f', '#0a150e': '#0a0f15', '#0f1f15': '#0f1520', '#153025': '#152540',
  '5,150,105': '37,99,235',
};
const emeraldToSunset: Replacements = {
  '#059669': '#ea580c', '#10b981': '#f97316', '#34d399': '#fb923c',
  '#d1fae5': '#ffedd5', '#6aab8a': '#b89070',
  '#060f0a': '#0f0a06', '#0a150e': '#150e0a', '#0f1f15': '#1f150f', '#153025': '#302015',
  '5,150,105': '234,88,12',
};
const emeraldToPurple: Replacements = {
  '#059669': '#7c3aed', '#10b981': '#8b5cf6', '#34d399': '#a78bfa',
  '#d1fae5': '#ede9fe', '#6aab8a': '#a08bb8',
  '#060f0a': '#08060f', '#0a150e': '#0e0a15', '#0f1f15': '#150f1f', '#153025': '#251530',
  '5,150,105': '124,58,237',
};
const emeraldToAmber: Replacements = {
  '#059669': '#d97706', '#10b981': '#f59e0b', '#34d399': '#fbbf24',
  '#d1fae5': '#fef3c7', '#6aab8a': '#b8a078',
  '#060f0a': '#0f0c06', '#0a150e': '#150e0a', '#0f1f15': '#1f150f', '#153025': '#302515',
  '5,150,105': '217,119,6',
};

// Cyan base (agency, veterinary)
const cyanToPurple: Replacements = {
  '#06b6d4': '#7c3aed', '#0891b2': '#6366f1', '#67e8f9': '#a78bfa',
  '#cffafe': '#ede9fe', '#60a5b8': '#a08bb8',
  '#060a0f': '#08060f', '#0a151d': '#0e0a15', '#152535': '#1e1530',
  '#06b6d422': '#7c3aed22', '#06b6d444': '#7c3aed44',
  '6,182,212': '124,58,237',
};
const cyanToEmerald: Replacements = {
  '#06b6d4': '#059669', '#0891b2': '#10b981', '#67e8f9': '#34d399',
  '#cffafe': '#d1fae5', '#60a5b8': '#6aab8a',
  '#060a0f': '#060f0a', '#0a151d': '#0a150e', '#152535': '#153025',
  '#06b6d422': '#05966922', '#06b6d444': '#05966944',
  '6,182,212': '5,150,105',
};
const cyanToSunset: Replacements = {
  '#06b6d4': '#ea580c', '#0891b2': '#f97316', '#67e8f9': '#fb923c',
  '#cffafe': '#ffedd5', '#60a5b8': '#b89070',
  '#060a0f': '#0f0a06', '#0a151d': '#150e0a', '#152535': '#302015',
  '#06b6d422': '#ea580c22', '#06b6d444': '#ea580c44',
  '6,182,212': '234,88,12',
};
const cyanToRose: Replacements = {
  '#06b6d4': '#e11d48', '#0891b2': '#f43f5e', '#67e8f9': '#fb7185',
  '#cffafe': '#ffe4e6', '#60a5b8': '#c084a0',
  '#060a0f': '#0f0608', '#0a151d': '#140810', '#152535': '#301520',
  '#06b6d422': '#e11d4822', '#06b6d444': '#e11d4844',
  '6,182,212': '225,29,72',
};
const cyanToAmber: Replacements = {
  '#06b6d4': '#d97706', '#0891b2': '#f59e0b', '#67e8f9': '#fbbf24',
  '#cffafe': '#fef3c7', '#60a5b8': '#b8a078',
  '#060a0f': '#0f0c06', '#0a151d': '#150e0a', '#152535': '#302515',
  '#06b6d422': '#d9770622', '#06b6d444': '#d9770644',
  '6,182,212': '217,119,6',
};

// Sky base (medical)
const skyToEmerald: Replacements = {
  '#0284c7': '#059669', '#38bdf8': '#34d399',
  '#e0f2fe': '#d1fae5', '#7cb8d0': '#6aab8a',
  '#080f14': '#060f0a', '#0a1520': '#0a150e', '#0f1a1f': '#0f1f15', '#15303a': '#153025',
};
const skyToPurple: Replacements = {
  '#0284c7': '#7c3aed', '#38bdf8': '#a78bfa',
  '#e0f2fe': '#ede9fe', '#7cb8d0': '#a08bb8',
  '#080f14': '#08060f', '#0a1520': '#0e0a15', '#0f1a1f': '#150f1f', '#15303a': '#251530',
};
const skyToRose: Replacements = {
  '#0284c7': '#e11d48', '#38bdf8': '#fb7185',
  '#e0f2fe': '#ffe4e6', '#7cb8d0': '#c084a0',
  '#080f14': '#0f0608', '#0a1520': '#140810', '#0f1a1f': '#1f0f15', '#15303a': '#301520',
};
const skyToAmber: Replacements = {
  '#0284c7': '#d97706', '#38bdf8': '#fbbf24',
  '#e0f2fe': '#fef3c7', '#7cb8d0': '#b8a078',
  '#080f14': '#0f0c06', '#0a1520': '#150e0a', '#0f1a1f': '#1f150f', '#15303a': '#302515',
};

// Rose base (realestate)
const roseToPurple: Replacements = {
  '#e11d48': '#7c3aed', '#f43f5e': '#8b5cf6',
};
const roseToOcean: Replacements = {
  '#e11d48': '#2563eb', '#f43f5e': '#3b82f6',
};
const roseToAmber: Replacements = {
  '#e11d48': '#d97706', '#f43f5e': '#f59e0b',
};
const roseToEmerald: Replacements = {
  '#e11d48': '#059669', '#f43f5e': '#10b981',
};

// Restaurant-specific warm background swaps
const restaurantWarmToWine: Replacements = {
  '#d97706': '#881337', '#ea580c': '#be123c', '#f59e0b': '#f43f5e',
  '#fef3c7': '#fce7f3', '#b8a078': '#c084a0',
  "'Playfair Display'": "'Playfair Display'",
};
const restaurantWarmToForest: Replacements = {
  '#d97706': '#15803d', '#ea580c': '#22c55e', '#f59e0b': '#4ade80',
  '#fef3c7': '#dcfce7', '#b8a078': '#6aab8a',
};
const restaurantWarmToNavy: Replacements = {
  '#d97706': '#1e40af', '#ea580c': '#2563eb', '#f59e0b': '#60a5fa',
  '#fef3c7': '#dbeafe', '#b8a078': '#7093c5',
};
const restaurantWarmToCoral: Replacements = {
  '#d97706': '#db2777', '#ea580c': '#ec4899', '#f59e0b': '#f9a8d4',
  '#fef3c7': '#fce7f3', '#b8a078': '#c084a0',
};

// ── Palette assignments per category ────────────────────────────

export const palettes: Record<string, PaletteEntry[]> = {
  landing: [
    { styleName: 'Gradient', replacements: null },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Sunset', replacements: purpleToSunset },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  restaurant: [
    { styleName: 'Elegante', replacements: null },
    { styleName: 'Vino', replacements: restaurantWarmToWine },
    { styleName: 'Bosque', replacements: restaurantWarmToForest },
    { styleName: 'Nocturno', replacements: restaurantWarmToNavy },
    { styleName: 'Coral', replacements: restaurantWarmToCoral },
  ],
  portfolio: [
    { styleName: 'Creativo', replacements: null },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Sunset', replacements: purpleToSunset },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  blog: [
    { styleName: 'Tech', replacements: null },
    { styleName: 'Amber', replacements: purpleToAmber },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  dashboard: [
    { styleName: 'Dark', replacements: null },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Sunset', replacements: purpleToSunset },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  ecommerce: [
    { styleName: 'Tech Blue', replacements: null },
    { styleName: 'Rosa', replacements: oceanToRose },
    { styleName: 'Esmeralda', replacements: oceanToEmerald },
    { styleName: 'Amber', replacements: oceanToAmber },
    { styleName: 'Púrpura', replacements: oceanToPurple },
  ],
  fitness: [
    { styleName: 'Energético', replacements: null },
    { styleName: 'Rosa', replacements: emeraldToRose },
    { styleName: 'Océano', replacements: emeraldToOcean },
    { styleName: 'Sunset', replacements: emeraldToSunset },
    { styleName: 'Púrpura', replacements: emeraldToPurple },
  ],
  agency: [
    { styleName: 'Cyan', replacements: null },
    { styleName: 'Púrpura', replacements: cyanToPurple },
    { styleName: 'Esmeralda', replacements: cyanToEmerald },
    { styleName: 'Sunset', replacements: cyanToSunset },
    { styleName: 'Rosa', replacements: cyanToRose },
  ],
  login: [
    { styleName: 'Gradient', replacements: null },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Rosa', replacements: purpleToRose },
    { styleName: 'Sunset', replacements: purpleToSunset },
  ],
  medical: [
    { styleName: 'Profesional', replacements: null },
    { styleName: 'Esmeralda', replacements: skyToEmerald },
    { styleName: 'Púrpura', replacements: skyToPurple },
    { styleName: 'Rosa', replacements: skyToRose },
    { styleName: 'Amber', replacements: skyToAmber },
  ],
  education: [
    { styleName: 'Clásico', replacements: null },
    { styleName: 'Océano', replacements: amberToOcean },
    { styleName: 'Púrpura', replacements: amberToPurple },
    { styleName: 'Esmeralda', replacements: amberToEmerald },
    { styleName: 'Cyan', replacements: amberToCyan },
  ],
  realestate: [
    { styleName: 'Rosa', replacements: null },
    { styleName: 'Océano', replacements: roseToOcean },
    { styleName: 'Amber', replacements: roseToAmber },
    { styleName: 'Esmeralda', replacements: roseToEmerald },
    { styleName: 'Púrpura', replacements: roseToPurple },
  ],
  event: [
    { styleName: 'Clásico', replacements: null },
    { styleName: 'Rosa', replacements: amberToRose },
    { styleName: 'Océano', replacements: amberToOcean },
    { styleName: 'Esmeralda', replacements: amberToEmerald },
    { styleName: 'Púrpura', replacements: amberToPurple },
  ],
  saas: [
    { styleName: 'Gradient', replacements: null },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Sunset', replacements: purpleToSunset },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  notfound: [
    { styleName: 'Default', replacements: null },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Sunset', replacements: purpleToSunset },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  pricing: [
    { styleName: 'Default', replacements: null },
    { styleName: 'Esmeralda', replacements: purpleToEmerald },
    { styleName: 'Océano', replacements: purpleToOcean },
    { styleName: 'Amber', replacements: purpleToAmber },
    { styleName: 'Rosa', replacements: purpleToRose },
  ],
  veterinary: [
    { styleName: 'Cyan', replacements: null },
    { styleName: 'Púrpura', replacements: cyanToPurple },
    { styleName: 'Esmeralda', replacements: cyanToEmerald },
    { styleName: 'Amber', replacements: cyanToAmber },
    { styleName: 'Rosa', replacements: cyanToRose },
  ],
};

// ── Variant Generator ───────────────────────────────────────────

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

export function generateVariants(base: BaseTemplate): FullTemplate[] {
  const entries = palettes[base.id];
  if (!entries) {
    return [{
      ...base,
      styleId: base.id,
      styleName: 'Default',
    }];
  }

  return entries.map(p => ({
    ...base,
    styleId: `${base.id}-${p.styleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    styleName: p.styleName,
    html: p.replacements ? colorize(base.html, p.replacements) : base.html,
  }));
}
