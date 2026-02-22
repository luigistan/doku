import { Link } from "react-router-dom";
import { Code2, GitBranch, Globe, Sparkles, Users, Zap, ArrowRight, Github, Heart, Brain, Blocks, Palette, Monitor, ChevronRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/doku-logo.png" alt="DOKU AI" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold">DOKU AI</span>
            <span className="rounded-full bg-brain/15 px-2.5 py-0.5 text-[10px] font-semibold text-brain tracking-wider">OPEN SOURCE</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/luigistan/doku" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Iniciar Sesión</Link>
            <Link to="/auth" className="rounded-lg bg-brain px-4 py-2 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brain/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brain/20 bg-brain/10 px-4 py-1.5 text-xs font-semibold text-brain mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            100% OPEN SOURCE & GRATUITO
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
            Crea sitios web
            <br />
            <span className="bg-gradient-to-r from-brain via-accent to-brain bg-clip-text text-transparent bg-[length:200%] animate-pulse">
              con inteligencia artificial
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe tu idea en lenguaje natural y DOKU AI genera sitios web profesionales al instante.
            Motor NLP propio. Sin APIs de pago. Sin costos ocultos.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl bg-brain px-7 py-3.5 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-all glow-brain">
              Empezar Gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://github.com/luigistan/doku" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-surface-2 transition-colors">
              <Github className="h-4 w-4" /> Ver en GitHub
            </a>
          </div>

          {/* Demo preview mockup */}
          <div className="mt-16 rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-execute/60" />
              </div>
              <div className="flex-1 mx-8">
                <div className="rounded-md bg-surface-2 px-3 py-1 text-xs text-muted-foreground text-center font-mono">www.doku.red</div>
              </div>
            </div>
            <div className="flex h-64 md:h-80">
              <div className="w-1/3 border-r border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Brain className="h-3.5 w-3.5 text-brain" />
                  <span className="font-medium">Brain Mode</span>
                </div>
                <div className="rounded-lg bg-brain/10 p-3 text-xs text-foreground">
                  "Quiero una landing para mi cafetería con menú y contacto"
                </div>
                <div className="rounded-lg bg-surface-2 p-3 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-execute" />
                    <span>Tipo: Cafetería</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-execute" />
                    <span>Secciones: 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-brain animate-pulse" />
                    <span>Generando...</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-surface-2 p-4 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Monitor className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Preview en vivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "12+", label: "Industrias" },
            { value: "15+", label: "Bloques UI" },
            { value: "13", label: "Paletas de color" },
            { value: "∞", label: "Sitios gratis" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-bold text-brain">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brain uppercase tracking-widest">Características</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">¿Qué hace DOKU AI?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un motor NLP propio que entiende lo que quieres crear y lo genera con código profesional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Generación Instantánea", desc: "Describe tu idea y obtén un sitio completo con diseño profesional en segundos. Soporta 12+ industrias.", color: "text-yellow-400" },
              { icon: Code2, title: "Código Profesional", desc: "HTML semántico, CSS moderno con variables, JavaScript interactivo, Google Fonts, imágenes de Unsplash.", color: "text-brain" },
              { icon: Globe, title: "Preview en Vivo", desc: "Ve los cambios al instante en el panel de preview. Prueba en desktop, tablet y móvil.", color: "text-execute" },
              { icon: Blocks, title: "Multi-Proyecto", desc: "Crea y gestiona múltiples proyectos. Cada uno con su historial y conversación guardada.", color: "text-orange-400" },
              { icon: Palette, title: "13 Paletas de Color", desc: "Desde elegant gold hasta neon pink. Cada paleta optimizada para WCAG AA con modo oscuro.", color: "text-pink-400" },
              { icon: Heart, title: "100% Gratuito", desc: "Sin límites, sin APIs de pago, sin costos ocultos. Motor NLP propio en edge functions.", color: "text-red-400" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group rounded-2xl border border-border bg-card p-6 hover:border-brain/40 hover:shadow-lg hover:shadow-brain/5 transition-all duration-300">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-execute uppercase tracking-widest">Proceso</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Así de fácil funciona</h2>
          </div>
          <div className="space-y-0">
            {[
              { step: "01", title: "Describe tu idea", desc: "Escribe en lenguaje natural qué sitio necesitas. DOKU entiende industria, secciones, colores y nombre.", icon: Brain },
              { step: "02", title: "Brain analiza", desc: "El modo Brain te muestra el análisis completo: tipo de sitio, secciones detectadas y plan de ejecución. Tú decides si ejecutar o ajustar.", icon: Sparkles },
              { step: "03", title: "Se genera al instante", desc: "DOKU genera HTML profesional con CSS, animaciones, responsive, SEO y accesibilidad. Todo en segundos.", icon: Zap },
              { step: "04", title: "Exporta y comparte", desc: "Descarga como ZIP, comparte con link público en doku.red, o copia el código para tu proyecto.", icon: Globe },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="flex gap-6 items-start relative">
                {i < 3 && <div className="absolute left-[23px] top-14 w-px h-[calc(100%-20px)] bg-border" />}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brain/10 border border-brain/20 text-brain font-bold text-sm z-10">
                  {step}
                </div>
                <div className="pb-10">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    {title} <Icon className="h-4 w-4 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborate */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brain uppercase tracking-widest">Comunidad</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">¿Cómo Colaborar?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              DOKU AI es open source. Cualquier persona puede contribuir y mejorar el motor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { step: "1", title: "Fork del Repo", desc: "Haz fork en GitHub y clónalo localmente" },
              { step: "2", title: "Crea una Rama", desc: "git checkout -b feature/mi-mejora" },
              { step: "3", title: "Desarrolla", desc: "Nuevos templates, industrias, mejoras NLP, bugs" },
              { step: "4", title: "Pull Request", desc: "Envía tu PR y el equipo revisará tu código" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start rounded-xl border border-border bg-card p-5 hover:border-brain/30 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brain text-brain-foreground font-bold text-xs">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-brain/20 bg-brain/5 p-6">
            <h3 className="font-semibold mb-3 text-brain text-sm">Áreas de contribución:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "🧠 Motor NLP (sinónimos, intents)",
                "🎨 Templates y bloques HTML/CSS",
                "🏭 Nuevas industrias",
                "🌐 Traducciones",
                "📱 Responsive design",
                "♿ Accesibilidad WCAG AA",
                "🧪 Tests automatizados",
                "📖 Documentación",
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-brain shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brain/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para crear?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Crea tu cuenta gratis y empieza a generar sitios web profesionales con DOKU AI.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl bg-brain px-8 py-4 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity glow-brain">
            Comenzar Ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 text-sm">
            <img src="/doku-logo.png" alt="DOKU AI" className="h-6 w-6 rounded" />
            <span className="font-semibold text-foreground">DOKU AI</span>
            <span className="text-muted-foreground">— Open Source Web Builder</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://github.com/luigistan/doku" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <span>MIT License</span>
            <span>www.doku.red</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
