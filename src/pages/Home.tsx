import { Link } from "react-router-dom";
import { Code2, GitBranch, Globe, Sparkles, Users, Zap, ArrowRight, Github, Heart } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brain text-brain-foreground text-sm font-bold">D</div>
          <span className="text-lg font-bold">DOKU AI</span>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">OPEN SOURCE</span>
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
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-brain/10 px-4 py-1.5 text-xs font-semibold text-brain mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          100% OPEN SOURCE & GRATUITO
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Crea sitios web con{" "}
          <span className="bg-gradient-to-r from-brain to-accent bg-clip-text text-transparent">
            inteligencia artificial
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          DOKU AI es un motor de IA open source que genera sitios web profesionales al instante.
          Describe tu idea en lenguaje natural y DOKU la construye con código de calidad profesional.
          Sin APIs externas, sin costos ocultos.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-brain px-6 py-3 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity glow-brain">
            Empezar Gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="https://github.com/luigistan/doku" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-2 transition-colors">
            <Github className="h-4 w-4" /> Ver en GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">¿Qué hace DOKU AI?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Un motor NLP propio que entiende lo que quieres crear y lo genera con código profesional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Generación Instantánea", desc: "Describe tu idea y obtén un sitio completo con diseño profesional en segundos. Soporta 8+ industrias." },
              { icon: Code2, title: "Código Profesional", desc: "HTML semántico, CSS moderno con variables, JavaScript interactivo, Google Fonts, imágenes reales de Unsplash." },
              { icon: Globe, title: "Preview en Vivo", desc: "Ve los cambios al instante en el panel de preview. Prueba en desktop, tablet y móvil." },
              { icon: Users, title: "Multi-Proyecto", desc: "Crea y gestiona múltiples proyectos. Cada uno con su historial de versiones y chat." },
              { icon: GitBranch, title: "Historial de Versiones", desc: "Cada cambio se guarda automáticamente. Restaura cualquier versión anterior con un clic." },
              { icon: Heart, title: "100% Gratuito", desc: "Sin límites, sin APIs de pago, sin costos ocultos. El motor NLP corre en edge functions gratuitas." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 hover:border-brain/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brain/10 mb-4">
                  <Icon className="h-5 w-5 text-brain" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Collaborate */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">¿Cómo Colaborar?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            DOKU AI es open source. Cualquier persona puede contribuir y mejorar el motor.
          </p>
          <div className="space-y-6">
            {[
              { step: "1", title: "Fork del Repositorio", desc: "Haz fork del repo en GitHub y clónalo a tu máquina local." },
              { step: "2", title: "Crea una Rama", desc: "Crea una rama para tu feature: git checkout -b feature/mi-mejora" },
              { step: "3", title: "Desarrolla y Prueba", desc: "Implementa tu mejora. Puede ser un nuevo template, una industria, mejoras al NLP, corrección de bugs o mejoras de UI." },
              { step: "4", title: "Envía un Pull Request", desc: "Haz push de tu rama y abre un PR describiendo los cambios. El equipo revisará y dará feedback." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brain text-brain-foreground font-bold text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-brain/30 bg-brain/5 p-6">
            <h3 className="font-semibold mb-2 text-brain">Áreas donde puedes contribuir:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "🧠 Mejorar el motor NLP (sinónimos, detección de intents)",
                "🎨 Nuevos templates y bloques HTML/CSS",
                "🏭 Nuevas industrias (clínica, inmobiliaria, escuela...)",
                "🌐 Traducciones a otros idiomas",
                "📱 Mejorar responsive design",
                "♿ Mejorar accesibilidad (WCAG AA)",
                "🧪 Escribir tests automatizados",
                "📖 Documentación y tutoriales",
              ].map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para crear?</h2>
          <p className="text-muted-foreground mb-8">
            Crea tu cuenta gratis y empieza a generar sitios web profesionales con DOKU AI.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-brain px-8 py-3.5 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity glow-brain">
            Comenzar Ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">DOKU AI</span> — Open Source Web Builder
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://github.com/luigistan/doku" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
