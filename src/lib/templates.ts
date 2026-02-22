import { Template } from "@/types/builder";

export const templates: Template[] = [
  {
    id: "landing",
    name: "Landing Page",
    keywords: ["landing", "página principal", "home", "inicio", "pagina", "bienvenida", "presentación", "empresa", "negocio", "startup"],
    description: "Una landing page moderna con hero, features y CTA",
    planSteps: [
      "Crear estructura HTML base con SEO",
      "Agregar hero section con título y CTA",
      "Diseñar sección de características",
      "Agregar formulario de contacto",
      "Crear footer con links",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Empresa</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6}
a{color:#a78bfa;text-decoration:none}
.container{max-width:1100px;margin:0 auto;padding:0 2rem}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(10,10,15,0.85);border-bottom:1px solid #1e1e2e;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
nav .logo{font-size:1.3rem;font-weight:700;color:#e2e8f0}
nav .links{display:flex;gap:1.5rem;align-items:center}
nav .links a{color:#94a3b8;font-size:0.9rem;transition:color 0.2s}
nav .links a:hover{color:#a78bfa}
.hero{min-height:85vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;background:radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.12) 0%,transparent 60%)}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:800;margin-bottom:1rem;background:linear-gradient(135deg,#a78bfa,#818cf8,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:1.15rem;color:#94a3b8;max-width:600px;margin-bottom:2rem}
.btn{padding:0.85rem 2rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:10px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 15px rgba(124,58,237,0.3)}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(124,58,237,0.4)}
.btn-outline{background:transparent;border:1.5px solid #2d2d3f;color:#e2e8f0;box-shadow:none}
.btn-outline:hover{border-color:#7c3aed;box-shadow:0 4px 15px rgba(124,58,237,0.15)}
.features{padding:5rem 2rem;background:#0e0e16}
.features .header{text-align:center;margin-bottom:3rem}
.features .header h2{font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.features .header p{color:#94a3b8}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto}
.card{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:2rem;transition:transform 0.3s,border-color 0.3s}
.card:hover{transform:translateY(-4px);border-color:rgba(124,58,237,0.4)}
.card .icon{font-size:2rem;margin-bottom:1rem}
.card h3{font-size:1.15rem;font-weight:600;margin-bottom:0.5rem}
.card p{color:#94a3b8;font-size:0.95rem}
.contact{padding:5rem 2rem;text-align:center}
.contact h2{font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.contact>p{color:#94a3b8;margin-bottom:2rem}
.contact form{max-width:500px;margin:0 auto;display:flex;flex-direction:column;gap:1rem}
.contact input,.contact textarea{background:#12121a;border:1px solid #1e1e2e;border-radius:10px;padding:0.85rem 1rem;color:#e2e8f0;font-family:inherit;font-size:0.95rem;outline:none;transition:border-color 0.2s}
.contact input:focus,.contact textarea:focus{border-color:#7c3aed}
.contact textarea{resize:vertical;min-height:120px}
footer{border-top:1px solid #1e1e2e;padding:2rem;text-align:center;color:#64748b;font-size:0.85rem}
@media(max-width:768px){.hero h1{font-size:2.2rem}.grid{grid-template-columns:1fr}.nav .links{display:none}}
</style></head>
<body>
<nav><div class="logo">Mi Empresa</div><div class="links"><a href="#features">Características</a><a href="#contact">Contacto</a><button class="btn" style="padding:0.6rem 1.5rem;font-size:0.85rem">Empezar</button></div></nav>
<section class="hero">
<h1>Soluciones digitales para tu negocio</h1>
<p>Transformamos ideas en productos digitales excepcionales. Tecnología de punta al servicio de tu empresa.</p>
<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
<button class="btn">Comenzar Gratis →</button>
<button class="btn btn-outline">Ver Demo</button>
</div>
</section>
<section class="features" id="features">
<div class="header"><h2>¿Por qué elegirnos?</h2><p>Todo lo que necesitas para crecer tu negocio</p></div>
<div class="grid">
<div class="card"><div class="icon">⚡</div><h3>Ultra Rápido</h3><p>Rendimiento optimizado para una experiencia fluida y sin interrupciones en cada dispositivo.</p></div>
<div class="card"><div class="icon">🔒</div><h3>100% Seguro</h3><p>Protección de datos de nivel empresarial con cifrado end-to-end integrado.</p></div>
<div class="card"><div class="icon">🎨</div><h3>Personalizable</h3><p>Adapta cada aspecto a tu marca con nuestro sistema de diseño flexible y moderno.</p></div>
<div class="card"><div class="icon">📊</div><h3>Analytics</h3><p>Métricas en tiempo real para tomar decisiones informadas y crecer tu negocio.</p></div>
<div class="card"><div class="icon">🌐</div><h3>Multi-idioma</h3><p>Soporte para múltiples idiomas y regiones para alcanzar audiencias globales.</p></div>
<div class="card"><div class="icon">🤝</div><h3>Soporte 24/7</h3><p>Equipo de soporte dedicado disponible las 24 horas para ayudarte.</p></div>
</div>
</section>
<section class="contact" id="contact">
<h2>Contáctanos</h2>
<p>¿Listo para empezar? Envíanos un mensaje</p>
<form onsubmit="event.preventDefault();alert('¡Mensaje enviado!')">
<input type="text" placeholder="Tu nombre" required>
<input type="email" placeholder="tu@email.com" required>
<textarea placeholder="Tu mensaje..." required></textarea>
<button type="submit" class="btn">Enviar Mensaje</button>
</form>
</section>
<footer><p>© 2026 Mi Empresa. Todos los derechos reservados. Creado con DOKU AI.</p></footer>
</body></html>`,
  },
  {
    id: "restaurant",
    name: "Restaurante / Cafetería",
    keywords: ["restaurante", "cafeteria", "café", "cafe", "comida", "food", "restaurant", "bar", "cocina", "gastronomia", "pizzeria", "menu", "carta"],
    description: "Sitio web para restaurante con menú y reservaciones",
    planSteps: [
      "Crear navegación con nombre del restaurante",
      "Diseñar hero con imagen de fondo",
      "Generar menú gastronómico con precios",
      "Agregar sección de reservaciones",
      "Crear footer con ubicación y horarios",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Restaurante</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0f0a05;color:#fef3c7;line-height:1.6}
h1,h2,h3{font-family:'Playfair Display',serif}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(15,10,5,0.9);border-bottom:1px solid #302010;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
nav .logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700}
nav .links{display:flex;gap:1.5rem}
nav .links a{color:#b8a078;font-size:0.9rem;text-decoration:none;transition:color 0.2s}
nav .links a:hover{color:#f59e0b}
.hero{min-height:80vh;background:linear-gradient(135deg,rgba(15,10,5,0.8),rgba(20,15,8,0.9)),url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80');background-size:cover;background-position:center;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);margin-bottom:1rem;background:linear-gradient(135deg,#d97706,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:1.1rem;color:#b8a078;max-width:500px;margin-bottom:2rem}
.btn{padding:0.85rem 2rem;background:linear-gradient(135deg,#d97706,#ea580c);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;transition:transform 0.2s;font-size:0.95rem}
.btn:hover{transform:translateY(-2px)}
.menu-section{padding:5rem 2rem;max-width:900px;margin:0 auto}
.menu-section h2{text-align:center;font-size:2rem;margin-bottom:0.5rem}
.menu-section>p{text-align:center;color:#b8a078;margin-bottom:3rem}
.menu-cat{margin-bottom:2.5rem}
.menu-cat h3{color:#f59e0b;font-size:1.2rem;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #302010}
.menu-item{display:flex;justify-content:space-between;align-items:baseline;padding:0.75rem 0;border-bottom:1px dotted #302010}
.menu-item .name{font-weight:500}
.menu-item .desc{color:#b8a078;font-size:0.85rem}
.menu-item .price{color:#f59e0b;font-weight:700;font-size:1.1rem;white-space:nowrap;margin-left:1rem}
.reserve{padding:5rem 2rem;background:#140f08;text-align:center}
.reserve h2{font-size:2rem;margin-bottom:0.5rem}
.reserve>p{color:#b8a078;margin-bottom:2rem}
.reserve form{max-width:500px;margin:0 auto;display:flex;flex-direction:column;gap:1rem}
.reserve input,.reserve select{background:#1c1610;border:1px solid #302010;border-radius:10px;padding:0.85rem 1rem;color:#fef3c7;font-family:inherit;outline:none}
.reserve input:focus,.reserve select:focus{border-color:#d97706}
footer{border-top:1px solid #302010;padding:2rem;text-align:center;color:#b8a078;font-size:0.85rem}
footer .info{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin-bottom:1rem}
@media(max-width:768px){.hero h1{font-size:2.2rem}}
</style></head>
<body>
<nav><div class="logo">🍽️ Mi Restaurante</div><div class="links"><a href="#menu">Menú</a><a href="#reservar">Reservar</a><a href="#contacto">Contacto</a></div></nav>
<section class="hero">
<h1>Una experiencia gastronómica única</h1>
<p>Sabores auténticos preparados con los mejores ingredientes locales y pasión por la cocina.</p>
<button class="btn">Reservar Mesa →</button>
</section>
<section class="menu-section" id="menu">
<h2>Nuestro Menú</h2>
<p>Selección cuidada de platos con ingredientes frescos de temporada</p>
<div class="menu-cat"><h3>🥗 Entradas</h3>
<div class="menu-item"><div><div class="name">Ensalada Mediterránea</div><div class="desc">Mix de verdes, queso feta, aceitunas y vinagreta de limón</div></div><div class="price">$12.90</div></div>
<div class="menu-item"><div><div class="name">Carpaccio de Res</div><div class="desc">Finas láminas de res con rúcula, parmesano y aceite de trufa</div></div><div class="price">$16.50</div></div>
<div class="menu-item"><div><div class="name">Sopa del Día</div><div class="desc">Preparación fresca del chef con pan artesanal</div></div><div class="price">$9.90</div></div>
</div>
<div class="menu-cat"><h3>🥩 Platos Principales</h3>
<div class="menu-item"><div><div class="name">Filete Mignon</div><div class="desc">Corte premium 250g con puré trufado y vegetales grillados</div></div><div class="price">$38.90</div></div>
<div class="menu-item"><div><div class="name">Salmón a la Parrilla</div><div class="desc">Salmón noruego con risotto de espárragos y salsa de cítricos</div></div><div class="price">$32.50</div></div>
<div class="menu-item"><div><div class="name">Pasta Truffle</div><div class="desc">Tagliatelle fresco con crema de trufa negra y parmesano</div></div><div class="price">$26.90</div></div>
</div>
<div class="menu-cat"><h3>🍰 Postres</h3>
<div class="menu-item"><div><div class="name">Tiramisú Clásico</div><div class="desc">Receta tradicional italiana con mascarpone y café expreso</div></div><div class="price">$11.90</div></div>
<div class="menu-item"><div><div class="name">Crème Brûlée</div><div class="desc">Crema de vainilla con caramelo crujiente</div></div><div class="price">$10.50</div></div>
</div>
</section>
<section class="reserve" id="reservar">
<h2>Reserva tu Mesa</h2>
<p>Asegura tu lugar para una experiencia inolvidable</p>
<form onsubmit="event.preventDefault();alert('¡Reservación confirmada!')">
<input type="text" placeholder="Nombre completo" required>
<input type="tel" placeholder="Teléfono">
<input type="date" required>
<select><option>2 personas</option><option>4 personas</option><option>6 personas</option><option>8+ personas</option></select>
<button type="submit" class="btn">Confirmar Reserva</button>
</form>
</section>
<footer id="contacto">
<div class="info">
<span>📍 Av. Principal 123, Centro</span>
<span>📞 +1 234 567 890</span>
<span>🕐 Lun-Dom: 12:00 - 23:00</span>
</div>
<p>© 2026 Mi Restaurante. Creado con DOKU AI.</p>
</footer>
</body></html>`,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    keywords: ["portfolio", "portafolio", "proyectos", "galería", "trabajos", "curriculum", "cv", "freelancer", "fotografo", "diseñador"],
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6}
nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 3rem;border-bottom:1px solid #1e1e2e}
nav .logo{font-size:1.5rem;font-weight:700;color:#a78bfa}
nav .links{display:flex;gap:2rem}
nav a{color:#94a3b8;text-decoration:none;transition:color 0.2s;font-size:0.9rem}
nav a:hover{color:#a78bfa}
.about{display:flex;align-items:center;justify-content:center;gap:4rem;padding:6rem 3rem;max-width:1100px;margin:0 auto}
.about-text h1{font-size:2.5rem;margin-bottom:0.5rem;font-weight:800}
.about-text h1 span{color:#a78bfa}
.about-text p{color:#94a3b8;line-height:1.8;max-width:500px;margin-bottom:1.5rem}
.avatar{width:180px;height:180px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6366f1);display:flex;align-items:center;justify-content:center;font-size:4rem;flex-shrink:0}
.btn{padding:0.75rem 1.5rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:0.9rem}
.projects{padding:4rem 3rem;max-width:1100px;margin:0 auto}
.projects h2{font-size:2rem;margin-bottom:2rem;text-align:center;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.project{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;transition:transform 0.2s,border-color 0.2s}
.project:hover{transform:translateY(-4px);border-color:#7c3aed}
.project-img{height:180px;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;justify-content:center;font-size:3rem}
.project-info{padding:1.5rem}
.project-info h3{margin-bottom:0.25rem;font-weight:600}
.project-info p{color:#94a3b8;font-size:0.9rem}
.project-info .tags{display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap}
.project-info .tag{background:#7c3aed22;color:#a78bfa;padding:0.2rem 0.6rem;border-radius:99px;font-size:0.75rem}
.contact{padding:5rem 3rem;text-align:center;background:#0e0e16}
.contact h2{font-size:2rem;margin-bottom:2rem}
.contact form{max-width:500px;margin:0 auto;display:flex;flex-direction:column;gap:1rem}
.contact input,.contact textarea{background:#12121a;border:1px solid #1e1e2e;border-radius:10px;padding:0.85rem 1rem;color:#e2e8f0;font-family:inherit;outline:none}
.contact input:focus,.contact textarea:focus{border-color:#7c3aed}
.contact textarea{resize:vertical;min-height:100px}
footer{text-align:center;padding:2rem;border-top:1px solid #1e1e2e;color:#64748b;font-size:0.85rem}
@media(max-width:768px){.about{flex-direction:column;text-align:center;gap:2rem}.about-text h1{font-size:2rem}}
</style></head>
<body>
<nav><div class="logo">Portfolio</div><div class="links"><a href="#about">Sobre mí</a><a href="#projects">Proyectos</a><a href="#contact">Contacto</a></div></nav>
<section class="about" id="about"><div class="avatar">👨‍💻</div><div class="about-text"><h1>Hola, soy <span>Dev</span></h1><p>Desarrollador full-stack apasionado por crear experiencias web increíbles con las últimas tecnologías. +5 años de experiencia en React, Node.js y diseño UI/UX.</p><button class="btn">Descargar CV</button></div></section>
<section class="projects" id="projects"><h2>Proyectos</h2><div class="grid">
<div class="project"><div class="project-img">🛒</div><div class="project-info"><h3>App E-commerce</h3><p>Tienda online completa con pasarela de pagos y gestión de inventario.</p><div class="tags"><span class="tag">React</span><span class="tag">Node.js</span><span class="tag">Stripe</span></div></div></div>
<div class="project"><div class="project-img">📊</div><div class="project-info"><h3>Dashboard Analytics</h3><p>Panel de control con gráficos en tiempo real y reportes automáticos.</p><div class="tags"><span class="tag">TypeScript</span><span class="tag">D3.js</span><span class="tag">Supabase</span></div></div></div>
<div class="project"><div class="project-img">💬</div><div class="project-info"><h3>Chat App</h3><p>Aplicación de mensajería en tiempo real con videollamadas.</p><div class="tags"><span class="tag">React</span><span class="tag">WebRTC</span><span class="tag">Socket.io</span></div></div></div>
</div></section>
<section class="contact" id="contact"><h2>Contáctame</h2>
<form onsubmit="event.preventDefault();alert('¡Mensaje enviado!')">
<input type="text" placeholder="Tu nombre" required>
<input type="email" placeholder="tu@email.com" required>
<textarea placeholder="Tu mensaje..."></textarea>
<button type="submit" class="btn">Enviar</button>
</form></section>
<footer><p>© 2026 Portfolio. Creado con DOKU AI.</p></footer>
</body></html>`,
  },
  {
    id: "blog",
    name: "Blog",
    keywords: ["blog", "artículos", "posts", "noticias", "publicaciones", "contenido", "revista"],
    description: "Un blog con listado de artículos",
    planSteps: [
      "Crear header con navegación",
      "Diseñar listado de artículos",
      "Agregar sidebar con categorías",
      "Crear footer informativo",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Blog</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6}
header{padding:2rem 3rem;border-bottom:1px solid #1e1e2e;text-align:center}
header h1{font-size:2rem;color:#a78bfa;margin-bottom:0.5rem}
header p{color:#64748b}
.container{display:grid;grid-template-columns:1fr 300px;gap:2rem;max-width:1100px;margin:2rem auto;padding:0 2rem}
.posts{display:flex;flex-direction:column;gap:1.5rem}
.post{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:2rem;transition:border-color 0.2s}
.post:hover{border-color:#7c3aed}
.post .tag{display:inline-block;background:#7c3aed22;color:#a78bfa;padding:0.25rem 0.75rem;border-radius:99px;font-size:0.8rem;margin-bottom:0.75rem}
.post h2{font-size:1.4rem;margin-bottom:0.5rem}
.post p{color:#94a3b8}
.post .meta{margin-top:1rem;color:#64748b;font-size:0.85rem}
.sidebar{display:flex;flex-direction:column;gap:1.5rem}
.sidebar-card{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:1.5rem}
.sidebar-card h3{color:#a78bfa;margin-bottom:1rem;font-size:1.1rem}
.sidebar-card ul{list-style:none;display:flex;flex-direction:column;gap:0.5rem}
.sidebar-card li{color:#94a3b8;cursor:pointer;transition:color 0.2s}
.sidebar-card li:hover{color:#a78bfa}
footer{text-align:center;padding:2rem;border-top:1px solid #1e1e2e;color:#64748b;font-size:0.85rem;margin-top:2rem}
@media(max-width:768px){.container{grid-template-columns:1fr}}
</style></head>
<body>
<header><h1>✍️ Mi Blog</h1><p>Pensamientos sobre tecnología, diseño y desarrollo</p></header>
<div class="container">
<div class="posts">
<article class="post"><span class="tag">Desarrollo</span><h2>Cómo construir una API REST moderna</h2><p>Aprende las mejores prácticas para diseñar APIs escalables y mantenibles con Node.js y TypeScript.</p><div class="meta">15 Feb 2026 · 5 min lectura</div></article>
<article class="post"><span class="tag">Diseño</span><h2>Principios de UI/UX para desarrolladores</h2><p>No necesitas ser diseñador para crear interfaces hermosas. Estos principios básicos te ayudarán.</p><div class="meta">10 Feb 2026 · 8 min lectura</div></article>
<article class="post"><span class="tag">DevOps</span><h2>Deploy automático con GitHub Actions</h2><p>Configura pipelines de CI/CD para automatizar tu flujo de desarrollo de principio a fin.</p><div class="meta">5 Feb 2026 · 6 min lectura</div></article>
</div>
<aside class="sidebar">
<div class="sidebar-card"><h3>Categorías</h3><ul><li>📁 Desarrollo</li><li>🎨 Diseño</li><li>⚙️ DevOps</li><li>📚 Tutoriales</li></ul></div>
<div class="sidebar-card"><h3>Tags Populares</h3><ul><li>#react</li><li>#typescript</li><li>#nodejs</li><li>#css</li></ul></div>
</aside>
</div>
<footer><p>© 2026 Mi Blog. Creado con DOKU AI.</p></footer>
</body></html>`,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    keywords: ["dashboard", "panel", "admin", "administración", "estadísticas", "métricas", "analytics", "control"],
    description: "Un dashboard con métricas y gráficos",
    planSteps: [
      "Crear sidebar de navegación",
      "Diseñar cards de métricas principales",
      "Agregar área de gráficos",
      "Crear tabla de datos recientes",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;display:flex;min-height:100vh}
.sidebar{width:240px;background:#0f0f18;border-right:1px solid #1e1e2e;padding:1.5rem;display:flex;flex-direction:column;gap:0.5rem}
.sidebar h2{color:#a78bfa;margin-bottom:1rem;font-size:1.2rem}
.sidebar a{color:#94a3b8;text-decoration:none;padding:0.75rem 1rem;border-radius:10px;transition:all 0.2s;display:block;font-size:0.9rem}
.sidebar a:hover,.sidebar a.active{background:#7c3aed22;color:#a78bfa}
.main{flex:1;padding:2rem;overflow-y:auto}
.main h1{font-size:1.75rem;margin-bottom:1.5rem;font-weight:700}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
.metric{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:1.5rem}
.metric .label{color:#64748b;font-size:0.85rem;margin-bottom:0.5rem}
.metric .value{font-size:2rem;font-weight:700}
.metric .change{font-size:0.85rem;margin-top:0.25rem}
.metric .up{color:#34d399}
.metric .down{color:#f87171}
.chart-area{background:#12121a;border:1px solid #1e1e2e;border-radius:16px;padding:2rem;height:280px;display:flex;align-items:center;justify-content:center;color:#64748b;margin-bottom:2rem}
table{width:100%;background:#12121a;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden}
th,td{text-align:left;padding:1rem 1.5rem;font-size:0.9rem}
th{background:#0f0f18;color:#64748b;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em}
td{border-top:1px solid #1e1e2e}
.status{padding:0.25rem 0.75rem;border-radius:99px;font-size:0.8rem;font-weight:500}
.status.active{background:#34d39922;color:#34d399}
.status.pending{background:#fbbf2422;color:#fbbf24}
@media(max-width:768px){.sidebar{display:none}.metrics{grid-template-columns:repeat(2,1fr)}}
</style></head>
<body>
<div class="sidebar"><h2>📊 Dashboard</h2><a class="active" href="#">🏠 Inicio</a><a href="#">📈 Análisis</a><a href="#">👥 Usuarios</a><a href="#">💰 Ventas</a><a href="#">⚙️ Config</a></div>
<div class="main">
<h1>Panel de Control</h1>
<div class="metrics">
<div class="metric"><div class="label">Ingresos</div><div class="value">$48,590</div><div class="change up">↑ 12.5%</div></div>
<div class="metric"><div class="label">Usuarios</div><div class="value">2,847</div><div class="change up">↑ 8.2%</div></div>
<div class="metric"><div class="label">Pedidos</div><div class="value">1,234</div><div class="change down">↓ 3.1%</div></div>
<div class="metric"><div class="label">Conversión</div><div class="value">3.24%</div><div class="change up">↑ 1.8%</div></div>
</div>
<div class="chart-area">📈 Área de Gráfico (conectar librería de charts)</div>
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
    keywords: ["tienda", "ecommerce", "e-commerce", "shop", "productos", "comprar", "venta", "carrito", "store"],
    description: "Una tienda online con productos",
    planSteps: [
      "Crear navbar con carrito y búsqueda",
      "Diseñar banner de ofertas",
      "Crear grid de productos con precios",
      "Agregar footer de la tienda",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Tienda</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#06080f;color:#dbeafe;line-height:1.6}
nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 3rem;background:#0a0f18;border-bottom:1px solid #1a2a4a}
nav .logo{font-size:1.4rem;font-weight:700;color:#60a5fa}
nav .search{background:#0f1525;border:1px solid #1a2a4a;border-radius:10px;padding:0.6rem 1.25rem;color:#dbeafe;width:300px;outline:none;font-family:inherit}
nav .search:focus{border-color:#2563eb}
nav .cart{background:#2563eb22;color:#60a5fa;padding:0.6rem 1.25rem;border-radius:10px;border:none;cursor:pointer;font-weight:600;font-family:inherit}
.banner{background:linear-gradient(135deg,#0a0f18,#0f1525);padding:4rem 3rem;text-align:center}
.banner h1{font-size:2.5rem;margin-bottom:0.75rem;font-weight:800;background:linear-gradient(135deg,#2563eb,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.banner p{color:#7093c5;font-size:1.1rem}
.products{max-width:1200px;margin:2rem auto;padding:0 2rem}
.products h2{font-size:1.5rem;margin-bottom:1.5rem;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem}
.product{background:#0f1525;border:1px solid #1a2a4a;border-radius:16px;overflow:hidden;transition:all 0.2s}
.product:hover{border-color:#2563eb;transform:translateY(-2px)}
.product-img{height:200px;background:linear-gradient(135deg,#0f1525,#1a2a4a);display:flex;align-items:center;justify-content:center;font-size:3rem}
.product-info{padding:1.25rem}
.product-info h3{margin-bottom:0.25rem;font-weight:600}
.product-info .price{color:#60a5fa;font-size:1.25rem;font-weight:700;margin-bottom:0.75rem}
.product-info .add-btn{width:100%;padding:0.65rem;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;transition:opacity 0.2s;font-family:inherit}
.product-info .add-btn:hover{opacity:0.9}
footer{border-top:1px solid #1a2a4a;padding:2rem;text-align:center;color:#7093c5;font-size:0.85rem;margin-top:3rem}
@media(max-width:768px){nav{padding:1rem}nav .search{width:150px}.grid{grid-template-columns:1fr 1fr}}
</style></head>
<body>
<nav><div class="logo">🛒 Mi Tienda</div><input class="search" placeholder="Buscar productos..."><button class="cart">🛒 Carrito (0)</button></nav>
<div class="banner"><h1>Nuevas Ofertas de Temporada</h1><p>Hasta 50% de descuento en productos seleccionados</p></div>
<section class="products"><h2>Productos Destacados</h2><div class="grid">
<div class="product"><div class="product-img">👟</div><div class="product-info"><h3>Sneakers Premium</h3><div class="price">$129.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">🎧</div><div class="product-info"><h3>Auriculares Pro</h3><div class="price">$89.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">⌚</div><div class="product-info"><h3>Smart Watch</h3><div class="price">$249.99</div><button class="add-btn">Agregar al carrito</button></div></div>
<div class="product"><div class="product-img">📱</div><div class="product-info"><h3>Funda Designer</h3><div class="price">$34.99</div><button class="add-btn">Agregar al carrito</button></div></div>
</div></section>
<footer><p>© 2026 Mi Tienda. Creado con DOKU AI.</p></footer>
</body></html>`,
  },
  {
    id: "fitness",
    name: "Fitness / Gimnasio",
    keywords: ["gimnasio", "gym", "fitness", "ejercicio", "entrenamiento", "deporte", "crossfit", "yoga", "pilates"],
    description: "Sitio web para gimnasio con planes y horarios",
    planSteps: [
      "Crear navegación con logo del gym",
      "Diseñar hero con imagen motivacional",
      "Crear sección de planes y precios",
      "Agregar horarios y contacto",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Gym</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#060f0a;color:#d1fae5;line-height:1.6}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(6,15,10,0.9);border-bottom:1px solid #153025;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
nav .logo{font-size:1.3rem;font-weight:800;color:#34d399}
nav .links{display:flex;gap:1.5rem}
nav a{color:#6aab8a;text-decoration:none;font-size:0.9rem;transition:color 0.2s}
nav a:hover{color:#34d399}
.hero{min-height:85vh;background:linear-gradient(135deg,rgba(6,15,10,0.9),rgba(10,21,14,0.8));display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:900;margin-bottom:1rem;background:linear-gradient(135deg,#059669,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase}
.hero p{font-size:1.1rem;color:#6aab8a;max-width:550px;margin-bottom:2rem}
.btn{padding:0.85rem 2rem;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;transition:transform 0.2s;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.05em}
.btn:hover{transform:translateY(-2px)}
.plans{padding:5rem 2rem;background:#0a150e}
.plans h2{text-align:center;font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.plans>p{text-align:center;color:#6aab8a;margin-bottom:3rem}
.plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;max-width:1000px;margin:0 auto}
.plan{background:#0f1f15;border:1px solid #153025;border-radius:16px;padding:2rem;text-align:center;transition:transform 0.3s,border-color 0.3s}
.plan:hover{transform:translateY(-4px)}
.plan.featured{border-color:#059669;position:relative}
.plan.featured::before{content:'POPULAR';position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:0.2rem 1rem;border-radius:99px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em}
.plan h3{font-size:1.2rem;margin-bottom:0.5rem}
.plan .price{font-size:2.5rem;font-weight:800;color:#34d399;margin-bottom:1rem}
.plan .price span{font-size:1rem;color:#6aab8a;font-weight:400}
.plan ul{list-style:none;margin-bottom:1.5rem;text-align:left}
.plan li{padding:0.4rem 0;color:#6aab8a;font-size:0.9rem}
.plan li::before{content:'✓ ';color:#34d399;font-weight:700}
footer{border-top:1px solid #153025;padding:2rem;text-align:center;color:#6aab8a;font-size:0.85rem}
@media(max-width:768px){.hero h1{font-size:2.2rem}.plan-grid{grid-template-columns:1fr}}
</style></head>
<body>
<nav><div class="logo">💪 Mi Gym</div><div class="links"><a href="#plans">Planes</a><a href="#contact">Contacto</a><button class="btn" style="padding:0.5rem 1.2rem;font-size:0.8rem">Inscríbete</button></div></nav>
<section class="hero">
<h1>Transforma tu cuerpo</h1>
<p>Únete al gym más completo de la ciudad. Entrenadores certificados, equipos de última generación y una comunidad que te motiva.</p>
<button class="btn">Empieza tu Prueba Gratis →</button>
</section>
<section class="plans" id="plans">
<h2>Nuestros Planes</h2>
<p>Elige el plan perfecto para alcanzar tus objetivos</p>
<div class="plan-grid">
<div class="plan"><h3>Básico</h3><div class="price">$29<span>/mes</span></div><ul><li>Acceso a máquinas</li><li>Horario 6am-10pm</li><li>Casilleros</li><li>App de seguimiento</li></ul><button class="btn" style="width:100%">Elegir Plan</button></div>
<div class="plan featured"><h3>Premium</h3><div class="price">$49<span>/mes</span></div><ul><li>Todo lo Básico</li><li>Clases grupales</li><li>Entrenador personal 2x/sem</li><li>Nutricionista</li><li>Acceso 24/7</li></ul><button class="btn" style="width:100%">Elegir Plan</button></div>
<div class="plan"><h3>VIP</h3><div class="price">$79<span>/mes</span></div><ul><li>Todo lo Premium</li><li>Entrenador personal 5x/sem</li><li>Spa y sauna</li><li>Plan nutricional personalizado</li><li>Suplementos incluidos</li></ul><button class="btn" style="width:100%">Elegir Plan</button></div>
</div>
</section>
<footer id="contact">
<p>📍 Av. Fitness 456 · 📞 +1 234 567 890 · 🕐 24/7</p>
<p style="margin-top:0.5rem">© 2026 Mi Gym. Creado con DOKU AI.</p>
</footer>
</body></html>`,
  },
  {
    id: "agency",
    name: "Agencia / Servicios",
    keywords: ["agencia", "agency", "servicios", "consultoria", "marketing", "digital", "estudio", "studio", "creativa", "diseño"],
    description: "Sitio web para agencia digital",
    planSteps: [
      "Crear navegación con identidad de marca",
      "Diseñar hero con propuesta de valor",
      "Mostrar servicios y casos de éxito",
      "Agregar testimonios y contacto",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Agencia</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#060a0f;color:#cffafe;line-height:1.6}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(6,10,15,0.9);border-bottom:1px solid #152535;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center}
nav .logo{font-size:1.3rem;font-weight:700;color:#67e8f9}
nav .links{display:flex;gap:1.5rem}
nav a{color:#60a5b8;text-decoration:none;font-size:0.9rem;transition:color 0.2s}
nav a:hover{color:#06b6d4}
.hero{min-height:85vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;background:radial-gradient(ellipse at 50% 0%,rgba(6,182,212,0.1) 0%,transparent 60%)}
.hero h1{font-size:clamp(2.5rem,5vw,3.5rem);font-weight:800;margin-bottom:1rem;background:linear-gradient(135deg,#06b6d4,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:1.15rem;color:#60a5b8;max-width:600px;margin-bottom:2rem}
.btn{padding:0.85rem 2rem;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;transition:transform 0.2s;font-size:0.95rem}
.btn:hover{transform:translateY(-2px)}
.services{padding:5rem 2rem;background:#0a1018}
.services h2{text-align:center;font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.services>p{text-align:center;color:#60a5b8;margin-bottom:3rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto}
.card{background:#0f1820;border:1px solid #152535;border-radius:16px;padding:2rem;transition:transform 0.3s,border-color 0.3s}
.card:hover{transform:translateY(-4px);border-color:rgba(6,182,212,0.4)}
.card .icon{font-size:2rem;margin-bottom:1rem}
.card h3{font-size:1.1rem;font-weight:600;margin-bottom:0.5rem}
.card p{color:#60a5b8;font-size:0.9rem}
.testimonials{padding:5rem 2rem}
.testimonials h2{text-align:center;font-size:2rem;font-weight:700;margin-bottom:3rem}
.testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto}
.testimonial{background:#0f1820;border:1px solid #152535;border-radius:16px;padding:2rem}
.testimonial .stars{color:#fbbf24;margin-bottom:0.75rem}
.testimonial p{color:#60a5b8;font-style:italic;margin-bottom:1rem;font-size:0.95rem}
.testimonial .author{font-weight:600;font-size:0.9rem}
.testimonial .role{color:#60a5b8;font-size:0.8rem}
footer{border-top:1px solid #152535;padding:2rem;text-align:center;color:#60a5b8;font-size:0.85rem}
@media(max-width:768px){.hero h1{font-size:2.2rem}.grid{grid-template-columns:1fr}}
</style></head>
<body>
<nav><div class="logo">🚀 Mi Agencia</div><div class="links"><a href="#services">Servicios</a><a href="#testimonials">Clientes</a><a href="#contact">Contacto</a></div></nav>
<section class="hero">
<h1>Llevamos tu marca al siguiente nivel</h1>
<p>Somos expertos en estrategia digital, diseño y desarrollo. Creamos experiencias que conectan marcas con personas.</p>
<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
<button class="btn">Solicitar Cotización →</button>
<button class="btn" style="background:transparent;border:1.5px solid #152535">Ver Portfolio</button>
</div>
</section>
<section class="services" id="services">
<h2>Nuestros Servicios</h2>
<p>Soluciones integrales para potenciar tu presencia digital</p>
<div class="grid">
<div class="card"><div class="icon">🎨</div><h3>Diseño UI/UX</h3><p>Interfaces intuitivas y experiencias de usuario memorables que convierten visitantes en clientes.</p></div>
<div class="card"><div class="icon">💻</div><h3>Desarrollo Web</h3><p>Sitios web y apps con las tecnologías más modernas: React, Next.js, Node.js, TypeScript.</p></div>
<div class="card"><div class="icon">📈</div><h3>Marketing Digital</h3><p>Estrategias de SEO, SEM, redes sociales y email marketing para maximizar tu ROI.</p></div>
<div class="card"><div class="icon">📱</div><h3>Apps Móviles</h3><p>Aplicaciones nativas e híbridas para iOS y Android con experiencia fluida.</p></div>
<div class="card"><div class="icon">🔍</div><h3>SEO</h3><p>Posicionamiento orgánico en buscadores para generar tráfico cualificado constante.</p></div>
<div class="card"><div class="icon">📊</div><h3>Analytics</h3><p>Dashboards personalizados y reportes de rendimiento para tomar decisiones basadas en datos.</p></div>
</div>
</section>
<section class="testimonials" id="testimonials">
<h2>Lo que dicen nuestros clientes</h2>
<div class="testimonial-grid">
<div class="testimonial"><div class="stars">★★★★★</div><p>"Transformaron completamente nuestra presencia digital. Las ventas aumentaron un 180% en 3 meses."</p><div class="author">Ana García</div><div class="role">CEO, TechStart</div></div>
<div class="testimonial"><div class="stars">★★★★★</div><p>"El mejor equipo con el que hemos trabajado. Profesionales, creativos y siempre a tiempo."</p><div class="author">Carlos López</div><div class="role">Director, InnovaHub</div></div>
<div class="testimonial"><div class="stars">★★★★★</div><p>"Nuestra app móvil superó todas las expectativas. +50k descargas en el primer mes."</p><div class="author">María Torres</div><div class="role">Fundadora, FitLife</div></div>
</div>
</section>
<footer id="contact">
<p>📧 hola@miagencia.com · 📞 +1 234 567 890 · 📍 Ciudad, País</p>
<p style="margin-top:0.5rem">© 2026 Mi Agencia. Creado con DOKU AI.</p>
</footer>
</body></html>`,
  },
  {
    id: "login",
    name: "Página de Login",
    keywords: ["login", "inicio de sesion", "sesión", "iniciar sesion", "autenticacion", "registro", "signin", "signup", "auth", "acceso"],
    description: "Página de inicio de sesión con formulario",
    planSteps: [
      "Crear layout centrado con branding",
      "Diseñar formulario de login",
      "Agregar opciones de login social",
      "Agregar link de registro",
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Iniciar Sesión</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}
.container{display:flex;width:100%;max-width:1000px;min-height:600px;border-radius:20px;overflow:hidden;border:1px solid #1e1e2e;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
.left{flex:1;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;text-align:center}
.left h1{font-size:2rem;margin-bottom:1rem}
.left p{color:#94a3b8;max-width:300px;line-height:1.7}
.left .logo{font-size:3rem;margin-bottom:1.5rem}
.right{flex:1;background:#12121a;padding:3rem;display:flex;flex-direction:column;justify-content:center}
.right h2{font-size:1.5rem;margin-bottom:0.5rem;font-weight:700}
.right .subtitle{color:#64748b;margin-bottom:2rem;font-size:0.9rem}
.form-group{margin-bottom:1.25rem}
.form-group label{display:block;font-size:0.85rem;color:#94a3b8;margin-bottom:0.5rem;font-weight:500}
.form-group input{width:100%;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:10px;padding:0.85rem 1rem;color:#e2e8f0;font-family:inherit;outline:none;font-size:0.95rem;transition:border-color 0.2s}
.form-group input:focus{border-color:#7c3aed}
.btn{width:100%;padding:0.85rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:0.95rem;font-family:inherit;transition:transform 0.2s;margin-top:0.5rem}
.btn:hover{transform:translateY(-1px)}
.divider{display:flex;align-items:center;gap:1rem;margin:1.5rem 0;color:#64748b;font-size:0.85rem}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#1e1e2e}
.social{display:flex;gap:0.75rem}
.social button{flex:1;padding:0.75rem;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:10px;color:#94a3b8;cursor:pointer;font-family:inherit;font-size:0.85rem;transition:border-color 0.2s}
.social button:hover{border-color:#7c3aed;color:#e2e8f0}
.footer-link{text-align:center;margin-top:1.5rem;font-size:0.85rem;color:#64748b}
.footer-link a{color:#a78bfa;text-decoration:none}
.footer-link a:hover{text-decoration:underline}
.forgot{text-align:right;margin-top:-0.5rem;margin-bottom:1rem}
.forgot a{font-size:0.8rem;color:#a78bfa;text-decoration:none}
@media(max-width:768px){.container{flex-direction:column;max-width:400px}.left{padding:2rem;min-height:auto}}
</style></head>
<body>
<div class="container">
<div class="left">
<div class="logo">🔐</div>
<h1>Bienvenido</h1>
<p>Inicia sesión para acceder a tu cuenta y gestionar tus proyectos.</p>
</div>
<div class="right">
<h2>Iniciar Sesión</h2>
<p class="subtitle">Ingresa tus credenciales para continuar</p>
<form onsubmit="event.preventDefault();alert('¡Login exitoso!')">
<div class="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" required></div>
<div class="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" required></div>
<div class="forgot"><a href="#">¿Olvidaste tu contraseña?</a></div>
<button type="submit" class="btn">Iniciar Sesión</button>
</form>
<div class="divider">O continúa con</div>
<div class="social">
<button>🔵 Google</button>
<button>⚫ GitHub</button>
<button>🔷 Microsoft</button>
</div>
<div class="footer-link">¿No tienes cuenta? <a href="#">Regístrate aquí</a></div>
</div>
</div>
</body></html>`,
  },
];

export function findTemplate(input: string): Template | null {
  const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let best: Template | null = null;
  let bestScore = 0;

  for (const template of templates) {
    let score = 0;
    for (const kw of template.keywords) {
      const kwNorm = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(kwNorm)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = template;
    }
  }

  return bestScore > 0 ? best : null;
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
<body><div class="empty"><h2>👋 Bienvenido a DOKU AI</h2><p>Describe lo que quieres crear para ver el preview aquí</p></div></body></html>`;
}
