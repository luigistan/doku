import { useState, useEffect, useCallback, useMemo } from "react";
import { Brain, Monitor } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DemoScenario {
  prompt: string;
  intent: string;
  sections: number;
  name: string;
  confidence: string;
  templateId: string;
}

const SCENARIOS: DemoScenario[] = [
  {
    prompt: "Quiero una tienda online para vender zapatillas con catálogo y carrito",
    intent: "E-Commerce",
    sections: 6,
    name: "Sneaker Store",
    confidence: "94%",
    templateId: "ecommerce",
  },
  {
    prompt: "Crea un restaurante elegante llamado La Casa del Chef con menú y reservas",
    intent: "Restaurante",
    sections: 5,
    name: "La Casa del Chef",
    confidence: "97%",
    templateId: "restaurant",
  },
  {
    prompt: "Hazme un portfolio moderno para mostrar mis proyectos de diseño web",
    intent: "Portfolio",
    sections: 4,
    name: "Mi Portfolio",
    confidence: "92%",
    templateId: "portfolio",
  },
];

// Phases: typing(0-2s) -> analysis(2-4s) -> generating(4-5.5s) -> preview(5.5-9s) -> pause(9-10.5s)
type Phase = "typing" | "analysis" | "generating" | "preview" | "pause";

const HeroDemo = () => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [visibleBullets, setVisibleBullets] = useState(0);
  const [progress, setProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const scenario = SCENARIOS[scenarioIdx];

  // Get HTML from templates dynamically
  const templateHtml = useMemo(() => {
    try {
      // Dynamic import not needed - we use a simple mini HTML for the demo preview
      return getMiniPreviewHtml(scenario.templateId, scenario.name);
    } catch {
      return "";
    }
  }, [scenario.templateId, scenario.name]);

  const reset = useCallback(() => {
    setPhase("typing");
    setTypedChars(0);
    setVisibleBullets(0);
    setProgress(0);
    setPreviewVisible(false);
  }, []);

  // Phase machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typedChars < scenario.prompt.length) {
        timer = setTimeout(() => setTypedChars(c => c + 1), 35);
      } else {
        timer = setTimeout(() => setPhase("analysis"), 400);
      }
    } else if (phase === "analysis") {
      if (visibleBullets < 4) {
        timer = setTimeout(() => setVisibleBullets(b => b + 1), 400);
      } else {
        timer = setTimeout(() => setPhase("generating"), 300);
      }
    } else if (phase === "generating") {
      if (progress < 100) {
        timer = setTimeout(() => setProgress(p => Math.min(p + 4, 100)), 60);
      } else {
        timer = setTimeout(() => setPhase("preview"), 200);
      }
    } else if (phase === "preview") {
      setPreviewVisible(true);
      timer = setTimeout(() => setPhase("pause"), 3500);
    } else if (phase === "pause") {
      timer = setTimeout(() => {
        setScenarioIdx(i => (i + 1) % SCENARIOS.length);
        reset();
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [phase, typedChars, visibleBullets, progress, scenario.prompt.length, reset]);

  const bullets = [
    { label: "Tipo", value: scenario.intent },
    { label: "Secciones", value: `${scenario.sections} detectadas` },
    { label: "Nombre", value: scenario.name },
    { label: "Confianza", value: scenario.confidence },
  ];

  return (
    <div className="mt-16 rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-execute/60" />
        </div>
        <div className="flex-1 mx-8">
          <div className="rounded-md bg-surface-2 px-3 py-1 text-xs text-muted-foreground text-center font-mono">
            www.doku.red
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex h-72 md:h-96">
        {/* Left: Chat simulation */}
        <div className="w-2/5 border-r border-border p-4 space-y-3 overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5 text-brain" />
            <span className="font-medium">Brain Mode</span>
            <div className="ml-auto flex gap-1">
              {SCENARIOS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === scenarioIdx ? "bg-brain" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* User message with typing effect */}
          <div className="rounded-lg bg-brain/10 p-3 text-xs text-foreground min-h-[60px]">
            "{scenario.prompt.slice(0, typedChars)}
            {phase === "typing" && (
              <span className="inline-block w-0.5 h-3.5 bg-brain animate-pulse ml-0.5" />
            )}
            {typedChars >= scenario.prompt.length && '"'}
          </div>

          {/* Analysis bullets */}
          {phase !== "typing" && (
            <div className="rounded-lg bg-surface-2 p-3 text-xs text-muted-foreground space-y-1.5">
              {bullets.map((bullet, i) => (
                <div
                  key={bullet.label}
                  className="flex items-center gap-1.5 transition-all duration-300"
                  style={{
                    opacity: i < visibleBullets ? 1 : 0,
                    transform: i < visibleBullets ? "translateY(0)" : "translateY(8px)",
                  }}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < visibleBullets ? "bg-execute" : "bg-border"
                    }`}
                  />
                  <span>
                    {bullet.label}: <span className="text-foreground font-medium">{bullet.value}</span>
                  </span>
                </div>
              ))}

              {/* Progress bar */}
              {(phase === "generating" || phase === "preview" || phase === "pause") && (
                <div className="pt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        progress >= 100 ? "bg-execute" : "bg-brain animate-pulse"
                      }`}
                    />
                    <span>{progress >= 100 ? "✅ Generado" : "Generando..."}</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-surface-1" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Preview area */}
        <div className="flex-1 bg-surface-2 relative overflow-hidden">
          {!previewVisible ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Monitor className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  {phase === "generating"
                    ? "Construyendo sitio..."
                    : "Preview en vivo"}
                </p>
                {phase === "generating" && (
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="h-1 w-1 rounded-full bg-brain animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                opacity: previewVisible ? 1 : 0,
                transform: previewVisible ? "scale(1)" : "scale(0.95)",
              }}
            >
              <div className="w-full h-full overflow-hidden">
                <iframe
                  srcDoc={templateHtml}
                  title="Demo preview"
                  className="border-0 origin-top-left pointer-events-none"
                  style={{
                    width: "1280px",
                    height: "800px",
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                  }}
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Generates a mini HTML site for the demo preview based on template type
function getMiniPreviewHtml(templateId: string, businessName: string): string {
  const configs: Record<string, { gradient: string; accent: string; bg: string; items: string[] }> = {
    ecommerce: {
      gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
      accent: "#3b82f6",
      bg: "#0a0f18",
      items: ["👟 Air Max Pro — $189", "👟 Ultra Boost X — $220", "👟 Runner Elite — $165", "👟 Street King — $145", "👟 Cloud Step — $199", "👟 Turbo Sprint — $175"],
    },
    restaurant: {
      gradient: "linear-gradient(135deg, #d97706, #ea580c)",
      accent: "#d97706",
      bg: "#0f0a05",
      items: ["🥗 Ensalada César — $12.90", "🥩 Filete Mignon — $38.90", "🍝 Pasta Trufa — $26.90", "🐟 Salmón Grillé — $32.50", "🍰 Tiramisú — $11.90", "☕ Espresso — $4.50"],
    },
    portfolio: {
      gradient: "linear-gradient(135deg, #7c3aed, #6366f1)",
      accent: "#7c3aed",
      bg: "#0a0a0f",
      items: ["🛒 App E-commerce", "📊 Dashboard Analytics", "💬 Chat App", "📱 App Fitness", "🎨 Design System", "🌐 SaaS Platform"],
    },
  };
  const c = configs[templateId] || configs.portfolio;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:${c.bg};color:#e2e8f0;line-height:1.5}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid rgba(255,255,255,0.08)}
nav .logo{font-size:22px;font-weight:800;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent}
nav .links{display:flex;gap:24px;color:#94a3b8;font-size:14px}
.hero{text-align:center;padding:80px 40px 60px}
.hero h1{font-size:52px;font-weight:800;line-height:1.1;margin-bottom:16px;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:18px;color:#94a3b8;max-width:500px;margin:0 auto 32px}
.hero .cta{display:inline-block;padding:14px 32px;background:${c.gradient};color:#fff;border-radius:12px;font-weight:700;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:40px;max-width:1000px;margin:0 auto}
.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px}
.card .title{font-weight:600;font-size:15px;margin-bottom:4px}
.card .price{color:${c.accent};font-weight:700;font-size:14px}
.section-title{text-align:center;font-size:28px;font-weight:700;padding:40px 20px 8px}
.section-sub{text-align:center;color:#94a3b8;font-size:14px;margin-bottom:32px}
</style>
</head>
<body>
<nav><div class="logo">${businessName}</div><div class="links"><span>Inicio</span><span>Catálogo</span><span>Contacto</span></div></nav>
<div class="hero">
<h1>${templateId === "ecommerce" ? "Las mejores zapatillas del mercado" : templateId === "restaurant" ? "Una experiencia gastronómica única" : "Proyectos que hablan por sí mismos"}</h1>
<p>${templateId === "ecommerce" ? "Encuentra tu estilo con nuestra colección exclusiva" : templateId === "restaurant" ? "Sabores auténticos con ingredientes de primera" : "Diseño, código y creatividad en cada proyecto"}</p>
<span class="cta">${templateId === "ecommerce" ? "Ver Catálogo →" : templateId === "restaurant" ? "Reservar Mesa →" : "Ver Proyectos →"}</span>
</div>
<div class="section-title">${templateId === "ecommerce" ? "Productos Destacados" : templateId === "restaurant" ? "Nuestro Menú" : "Proyectos Recientes"}</div>
<div class="section-sub">${templateId === "ecommerce" ? "Lo más vendido esta semana" : templateId === "restaurant" ? "Selección del chef" : "Trabajos seleccionados"}</div>
<div class="grid">
${c.items.map(item => {
  const parts = item.split(" — ");
  return `<div class="card"><div class="title">${parts[0]}</div>${parts[1] ? `<div class="price">${parts[1]}</div>` : ""}</div>`;
}).join("\n")}
</div>
</body>
</html>`;
}

export default HeroDemo;
