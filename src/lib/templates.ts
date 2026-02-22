import { Template } from "@/types/builder";

export const templates: Template[] = [
  {
    id: "landing",
    name: "Landing Page",
    keywords: ["landing", "página principal", "home", "inicio", "pagina", "bienvenida", "presentación"],
    description: "Una landing page moderna con hero, features y CTA",
    planSteps: [
      "Crear estructura HTML base",
      "Agregar hero section con título y CTA",
      "Diseñar sección de características",
      "Agregar footer con links",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Landing</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0f0f14;color:#e2e8f0}
.hero{min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)}
.hero h1{font-size:3.5rem;font-weight:800;margin-bottom:1rem;background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:1.25rem;color:#94a3b8;max-width:600px;margin-bottom:2rem}
.btn{padding:0.875rem 2rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:transform 0.2s}
.btn:hover{transform:translateY(-2px)}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;padding:4rem 2rem;max-width:1200px;margin:0 auto}
.feature-card{background:#1e1e2e;border:1px solid #2d2d3f;border-radius:16px;padding:2rem}
.feature-card h3{color:#a78bfa;margin-bottom:0.5rem;font-size:1.25rem}
.feature-card p{color:#94a3b8;line-height:1.6}
footer{text-align:center;padding:2rem;border-top:1px solid #2d2d3f;color:#64748b}
</style></head>
<body>
<section class="hero">
<h1>Tu Producto Increíble</h1>
<p>Una solución moderna para resolver tus problemas del día a día con tecnología de punta.</p>
<button class="btn">Comenzar Ahora →</button>
</section>
<section class="features">
<div class="feature-card"><h3>⚡ Rápido</h3><p>Rendimiento optimizado para una experiencia fluida y sin interrupciones.</p></div>
<div class="feature-card"><h3>🔒 Seguro</h3><p>Protección de datos de nivel empresarial integrada desde el primer momento.</p></div>
<div class="feature-card"><h3>🎨 Personalizable</h3><p>Adapta cada aspecto a tus necesidades con nuestro sistema flexible.</p></div>
</section>
<footer><p>© 2026 Tu Empresa. Todos los derechos reservados.</p></footer>
</body></html>`,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    keywords: ["portfolio", "portafolio", "proyectos", "galería", "trabajos", "curriculum", "cv"],
    description: "Un portfolio personal con galería de proyectos",
    planSteps: [
      "Crear header con nombre y navegación",
      "Diseñar sección de presentación personal",
      "Crear grid de proyectos",
      "Agregar sección de contacto",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Portfolio</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0}
nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 3rem;border-bottom:1px solid #1e1e2e}
nav .logo{font-size:1.5rem;font-weight:700;color:#a78bfa}
nav ul{display:flex;gap:2rem;list-style:none}
nav a{color:#94a3b8;text-decoration:none;transition:color 0.2s}
nav a:hover{color:#a78bfa}
.about{display:flex;align-items:center;justify-content:center;gap:4rem;padding:6rem 3rem;max-width:1100px;margin:0 auto}
.about-text h1{font-size:2.5rem;margin-bottom:0.5rem}
.about-text h1 span{color:#a78bfa}
.about-text p{color:#94a3b8;line-height:1.8;max-width:500px}
.avatar{width:180px;height:180px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6366f1);display:flex;align-items:center;justify-content:center;font-size:4rem}
.projects{padding:4rem 3rem;max-width:1100px;margin:0 auto}
.projects h2{font-size:2rem;margin-bottom:2rem;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.project{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;transition:transform 0.2s,border-color 0.2s}
.project:hover{transform:translateY(-4px);border-color:#7c3aed}
.project-img{height:180px;background:linear-gradient(135deg,#1a1a2e,#16213e)}
.project-info{padding:1.5rem}
.project-info h3{margin-bottom:0.5rem}
.project-info p{color:#94a3b8;font-size:0.9rem}
</style></head>
<body>
<nav><div class="logo">Portfolio</div><ul><li><a href="#">Inicio</a></li><li><a href="#">Proyectos</a></li><li><a href="#">Contacto</a></li></ul></nav>
<section class="about"><div class="avatar">👨‍💻</div><div class="about-text"><h1>Hola, soy <span>Dev</span></h1><p>Desarrollador full-stack apasionado por crear experiencias web increíbles con las últimas tecnologías.</p></div></section>
<section class="projects"><h2>Proyectos</h2><div class="grid">
<div class="project"><div class="project-img"></div><div class="project-info"><h3>App E-commerce</h3><p>Tienda online completa con pasarela de pagos.</p></div></div>
<div class="project"><div class="project-img"></div><div class="project-info"><h3>Dashboard Analytics</h3><p>Panel de control con gráficos en tiempo real.</p></div></div>
<div class="project"><div class="project-img"></div><div class="project-info"><h3>Red Social</h3><p>Plataforma social con chat y notificaciones.</p></div></div>
</div></section>
</body></html>`,
  },
  {
    id: "blog",
    name: "Blog",
    keywords: ["blog", "artículos", "posts", "noticias", "publicaciones", "contenido"],
    description: "Un blog con listado de artículos",
    planSteps: [
      "Crear header con navegación y búsqueda",
      "Diseñar listado de artículos en cards",
      "Agregar sidebar con categorías",
      "Crear footer informativo",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Blog</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0}
header{padding:2rem 3rem;border-bottom:1px solid #1e1e2e;text-align:center}
header h1{font-size:2rem;color:#a78bfa;margin-bottom:0.5rem}
header p{color:#64748b}
.container{display:grid;grid-template-columns:1fr 300px;gap:2rem;max-width:1100px;margin:2rem auto;padding:0 2rem}
.posts{display:flex;flex-direction:column;gap:1.5rem}
.post{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:2rem;transition:border-color 0.2s}
.post:hover{border-color:#7c3aed}
.post .tag{display:inline-block;background:#7c3aed22;color:#a78bfa;padding:0.25rem 0.75rem;border-radius:99px;font-size:0.8rem;margin-bottom:0.75rem}
.post h2{font-size:1.4rem;margin-bottom:0.5rem}
.post p{color:#94a3b8;line-height:1.6}
.post .meta{margin-top:1rem;color:#64748b;font-size:0.85rem}
.sidebar{display:flex;flex-direction:column;gap:1.5rem}
.sidebar-card{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:1.5rem}
.sidebar-card h3{color:#a78bfa;margin-bottom:1rem;font-size:1.1rem}
.sidebar-card ul{list-style:none;display:flex;flex-direction:column;gap:0.5rem}
.sidebar-card li{color:#94a3b8;cursor:pointer;transition:color 0.2s}
.sidebar-card li:hover{color:#a78bfa}
</style></head>
<body>
<header><h1>✍️ Mi Blog</h1><p>Pensamientos sobre tecnología, diseño y desarrollo</p></header>
<div class="container">
<div class="posts">
<article class="post"><span class="tag">Desarrollo</span><h2>Cómo construir una API REST moderna</h2><p>Aprende las mejores prácticas para diseñar APIs escalables y mantenibles con Node.js y TypeScript.</p><div class="meta">15 Feb 2026 · 5 min lectura</div></article>
<article class="post"><span class="tag">Diseño</span><h2>Principios de UI/UX para desarrolladores</h2><p>No necesitas ser diseñador para crear interfaces hermosas. Estos principios básicos te ayudarán enormemente.</p><div class="meta">10 Feb 2026 · 8 min lectura</div></article>
<article class="post"><span class="tag">DevOps</span><h2>Deploy automático con GitHub Actions</h2><p>Configura pipelines de CI/CD para automatizar tu flujo de desarrollo de principio a fin.</p><div class="meta">5 Feb 2026 · 6 min lectura</div></article>
</div>
<aside class="sidebar">
<div class="sidebar-card"><h3>Categorías</h3><ul><li>Desarrollo</li><li>Diseño</li><li>DevOps</li><li>Tutoriales</li></ul></div>
<div class="sidebar-card"><h3>Tags Populares</h3><ul><li>#react</li><li>#typescript</li><li>#nodejs</li><li>#css</li></ul></div>
</aside>
</div>
</body></html>`,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    keywords: ["dashboard", "panel", "admin", "administración", "estadísticas", "métricas", "analytics"],
    description: "Un dashboard con métricas y gráficos",
    planSteps: [
      "Crear sidebar de navegación",
      "Diseñar cards de métricas principales",
      "Agregar área de gráficos placeholder",
      "Crear tabla de datos recientes",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;min-height:100vh}
.sidebar{width:240px;background:#0f0f18;border-right:1px solid #1e1e2e;padding:1.5rem;display:flex;flex-direction:column;gap:0.5rem}
.sidebar h2{color:#a78bfa;margin-bottom:1rem;font-size:1.2rem}
.sidebar a{color:#94a3b8;text-decoration:none;padding:0.75rem 1rem;border-radius:10px;transition:all 0.2s;display:block}
.sidebar a:hover,.sidebar a.active{background:#7c3aed22;color:#a78bfa}
.main{flex:1;padding:2rem}
.main h1{font-size:1.75rem;margin-bottom:1.5rem}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
.metric{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:1.5rem}
.metric .label{color:#64748b;font-size:0.85rem;margin-bottom:0.5rem}
.metric .value{font-size:2rem;font-weight:700}
.metric .change{font-size:0.85rem;margin-top:0.25rem}
.metric .up{color:#34d399}
.metric .down{color:#f87171}
.chart-area{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:2rem;height:280px;display:flex;align-items:center;justify-content:center;color:#64748b;margin-bottom:2rem}
table{width:100%;background:#12121a;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden}
th,td{text-align:left;padding:1rem 1.5rem}
th{background:#0f0f18;color:#64748b;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em}
td{border-top:1px solid #1e1e2e}
.status{padding:0.25rem 0.75rem;border-radius:99px;font-size:0.8rem}
.status.active{background:#34d39922;color:#34d399}
.status.pending{background:#fbbf2422;color:#fbbf24}
</style></head>
<body>
<div class="sidebar"><h2>📊 Dashboard</h2><a class="active" href="#">Inicio</a><a href="#">Análisis</a><a href="#">Usuarios</a><a href="#">Ventas</a><a href="#">Configuración</a></div>
<div class="main">
<h1>Panel de Control</h1>
<div class="metrics">
<div class="metric"><div class="label">Ingresos</div><div class="value">$48,590</div><div class="change up">↑ 12.5%</div></div>
<div class="metric"><div class="label">Usuarios</div><div class="value">2,847</div><div class="change up">↑ 8.2%</div></div>
<div class="metric"><div class="label">Pedidos</div><div class="value">1,234</div><div class="change down">↓ 3.1%</div></div>
<div class="metric"><div class="label">Conversión</div><div class="value">3.24%</div><div class="change up">↑ 1.8%</div></div>
</div>
<div class="chart-area">📈 Área de Gráfico (conectar con librería de charts)</div>
<table><thead><tr><th>Cliente</th><th>Producto</th><th>Monto</th><th>Estado</th></tr></thead>
<tbody>
<tr><td>Ana García</td><td>Plan Premium</td><td>$299</td><td><span class="status active">Activo</span></td></tr>
<tr><td>Carlos López</td><td>Plan Básico</td><td>$99</td><td><span class="status active">Activo</span></td></tr>
<tr><td>María Rodríguez</td><td>Plan Pro</td><td>$199</td><td><span class="status pending">Pendiente</span></td></tr>
</tbody></table>
</div>
</body></html>`,
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    keywords: ["tienda", "ecommerce", "e-commerce", "shop", "productos", "comprar", "venta", "carrito"],
    description: "Una tienda online con productos",
    planSteps: [
      "Crear navbar con carrito y búsqueda",
      "Diseñar grid de productos con cards",
      "Agregar filtros y categorías",
      "Crear footer con información de la tienda",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Tienda</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0}
nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 3rem;background:#0f0f18;border-bottom:1px solid #1e1e2e}
nav .logo{font-size:1.4rem;font-weight:700;color:#a78bfa}
nav .search{background:#12121a;border:1px solid #1e1e2e;border-radius:10px;padding:0.6rem 1.25rem;color:#e2e8f0;width:300px;outline:none}
nav .cart{background:#7c3aed22;color:#a78bfa;padding:0.6rem 1.25rem;border-radius:10px;border:none;cursor:pointer;font-weight:600}
.banner{background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:4rem 3rem;text-align:center}
.banner h1{font-size:2.5rem;margin-bottom:0.75rem}
.banner p{color:#94a3b8;font-size:1.1rem}
.products{max-width:1200px;margin:2rem auto;padding:0 2rem}
.products h2{font-size:1.5rem;margin-bottom:1.5rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem}
.product{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;transition:all 0.2s}
.product:hover{border-color:#7c3aed;transform:translateY(-2px)}
.product-img{height:200px;background:linear-gradient(135deg,#1e1e2e,#252540);display:flex;align-items:center;justify-content:center;font-size:3rem}
.product-info{padding:1.25rem}
.product-info h3{margin-bottom:0.25rem}
.product-info .price{color:#a78bfa;font-size:1.25rem;font-weight:700;margin-bottom:0.75rem}
.product-info .add-btn{width:100%;padding:0.6rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;transition:opacity 0.2s}
.product-info .add-btn:hover{opacity:0.9}
</style></head>
<body>
<nav><div class="logo">🛒 ShopStudio</div><input class="search" placeholder="Buscar productos..."><button class="cart">🛒 Carrito (0)</button></nav>
<div class="banner"><h1>Nuevas Ofertas de Temporada</h1><p>Hasta 50% de descuento en productos seleccionados</p></div>
<section class="products"><h2>Productos Destacados</h2><div class="grid">
<div class="product"><div class="product-img">👟</div><div class="product-info"><h3>Sneakers Premium</h3><div class="price">$129.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">🎧</div><div class="product-info"><h3>Auriculares Pro</h3><div class="price">$89.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">⌚</div><div class="product-info"><h3>Smart Watch</h3><div class="price">$249.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">📱</div><div class="product-info"><h3>Funda Designer</h3><div class="price">$34.99</div><button class="add-btn">Agregar al carrito</button></div></div>
</div></section>
</body></html>`,
  },
];

export function findTemplate(input: string): Template | null {
  const lower = input.toLowerCase();
  let best: Template | null = null;
  let bestScore = 0;

  for (const template of templates) {
    let score = 0;
    for (const kw of template.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = template;
    }
  }

  return best;
}

export function getDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;color:#64748b;font-family:'Segoe UI',sans-serif}
.empty{text-align:center}
.empty h2{color:#94a3b8;margin-bottom:0.5rem}
</style></head>
<body><div class="empty"><h2>👋 Bienvenido</h2><p>Describe lo que quieres crear para ver el preview aquí</p></div></body></html>`;
}
