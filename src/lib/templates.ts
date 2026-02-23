import { Template } from "@/types/builder";
import { generateVariants, BaseTemplate } from "./templateVariants";

// Helper: wraps a React+TypeScript component in a full HTML page that renders via CDN
function reactWrap(componentCode: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}
input,textarea,select{font-family:inherit}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:#12121a}
::-webkit-scrollbar-thumb{background:#2d2d3f;border-radius:3px}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-type="module">
${componentCode}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
<\/script>
</body>
</html>`;
}

const baseTemplates: BaseTemplate[] = [
  {
    id: "landing",
    name: "Landing Page",
    keywords: ["landing", "página principal", "home", "inicio", "pagina", "bienvenida", "presentación", "empresa", "negocio", "startup", "saas", "tech", "tecnología"],
    description: "Landing page profesional con React y TypeScript",
    planSteps: [
      "Crear navegación responsive con React.useState",
      "Diseñar hero section profesional con imagen de Landing Page",
      "Generar sección de características con iconos y descripciones",
      "Agregar formulario de contacto con validación",
      "Crear footer profesional con navegación y links legales",
      "Aplicar paleta de colores: purple",
      "Inyectar animaciones de scroll con IntersectionObserver",
      "Agregar navbar sticky, back-to-top y contadores animados",
      "Optimizar SEO con meta tags y estructura semántica",
    ],
    html: reactWrap(`
const { useState, useEffect, useRef } = React;

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function Counter({ end, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, end]);
  return <div ref={ref} style={{textAlign:'center'}}><div style={{fontSize:'2.5rem',fontWeight:800,background:'linear-gradient(135deg,#a78bfa,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{count}+</div><div style={{color:'#94a3b8',fontSize:'0.9rem'}}>{label}</div></div>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(16px)',background:scrolled?'rgba(10,10,15,0.95)':'rgba(10,10,15,0.7)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'background 0.3s'}}>
    <div style={{fontSize:'1.3rem',fontWeight:700,color:'#e2e8f0'}}>Mi Empresa</div>
    <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
      {['Inicio','Servicios','Contacto'].map(l => <a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem',transition:'color 0.2s'}} onMouseOver={e=>e.target.style.color='#a78bfa'} onMouseOut={e=>e.target.style.color='#94a3b8'}>{l}</a>)}
      <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem',boxShadow:'0 4px 15px rgba(124,58,237,0.3)'}}>Empezar</button>
    </div>
  </nav>;
}

function Hero() {
  return <section id="inicio" style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.12) 0%,transparent 60%)'}}>
    <span style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid #7c3aed44'}}>✦ Innovación Digital</span>
    <h1 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#a78bfa,#818cf8,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',maxWidth:700}}>Soluciones modernas y escalables para tu negocio</h1>
    <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Transformamos ideas en productos digitales excepcionales con tecnología de última generación.</p>
    <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',justifyContent:'center'}}>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem',boxShadow:'0 4px 15px rgba(124,58,237,0.3)'}}>Comenzar Ahora →</button>
      <button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #2d2d3f',color:'#e2e8f0',borderRadius:10,fontWeight:600,fontSize:'0.95rem'}}>Saber Más</button>
    </div>
  </section>;
}

function Features() {
  const items = [
    { icon: '⚡', title: 'Ultra Rápido', desc: 'Rendimiento optimizado para una experiencia fluida en cada dispositivo.' },
    { icon: '🔒', title: '100% Seguro', desc: 'Protección de datos con cifrado end-to-end integrado.' },
    { icon: '🎨', title: 'Personalizable', desc: 'Adapta cada aspecto a tu marca con diseño flexible.' },
    { icon: '📊', title: 'Analytics', desc: 'Métricas en tiempo real para decisiones informadas.' },
    { icon: '🌐', title: 'Multi-idioma', desc: 'Soporte para múltiples idiomas y regiones.' },
    { icon: '🤝', title: 'Soporte 24/7', desc: 'Equipo dedicado disponible las 24 horas.' },
  ];
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return <section ref={ref} id="servicios" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
    <div style={{textAlign:'center',marginBottom:'3rem'}}><h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>¿Por qué elegirnos?</h2><p style={{color:'#94a3b8'}}>Todo lo que necesitas para crecer</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
      {items.map((f,i) => <div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',transition:'transform 0.3s,border-color 0.3s',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transitionDelay:\`\${i*80}ms\`}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'}} onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='#1e1e2e'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{f.icon}</div>
        <h3 style={{fontSize:'1.15rem',fontWeight:600,marginBottom:'0.5rem'}}>{f.title}</h3>
        <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{f.desc}</p>
      </div>)}
    </div>
  </section>;
}

function Stats() {
  return <section style={{padding:'4rem 2rem',display:'flex',justifyContent:'center',gap:'4rem',flexWrap:'wrap'}}>
    <Counter end={500} label="Proyectos" /><Counter end={50} label="Clientes" /><Counter end={99} label="% Satisfacción" /><Counter end={24} label="Soporte (hrs)" />
  </section>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  return <section id="contacto" style={{padding:'5rem 2rem',textAlign:'center'}}>
    <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>Contáctanos</h2>
    <p style={{color:'#94a3b8',marginBottom:'2rem'}}>¿Listo para empezar? Envíanos un mensaje</p>
    {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Mensaje enviado exitosamente!</p> :
    <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
      <input style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Tu nombre" required />
      <input type="email" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="tu@email.com" required />
      <textarea style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none',resize:'vertical',minHeight:120}} placeholder="Tu mensaje..." required />
      <button type="submit" style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem'}}>Enviar Mensaje</button>
    </form>}
  </section>;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!show) return null;
  return <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',fontSize:'1.2rem',zIndex:99,boxShadow:'0 4px 15px rgba(124,58,237,0.4)'}}>↑</button>;
}

function App() {
  return <><Navbar /><Hero /><Stats /><Features /><Contact /><footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Mi Empresa. Todos los derechos reservados. Creado con DOKU AI.</footer><BackToTop /></>;
}
`, "Mi Empresa"),
  },
  {
    id: "restaurant",
    name: "Restaurante / Cafetería",
    keywords: ["restaurante", "cafeteria", "café", "cafe", "comida", "food", "restaurant", "bar", "cocina", "gastronomia", "pizzeria", "menu", "carta"],
    description: "Sitio web para restaurante con React y TypeScript",
    planSteps: [
      "Crear navegación responsive con nombre del restaurante",
      "Diseñar hero con imagen de fondo",
      "Generar menú gastronómico con categorías y precios",
      "Agregar sección de reservaciones con formulario",
      "Crear footer con ubicación y horarios",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [formSent, setFormSent] = useState(false);
  const menuData = [
    { cat: '🥗 Entradas', items: [
      { name: 'Ensalada Mediterránea', desc: 'Mix de verdes, queso feta, aceitunas y vinagreta de limón', price: '$12.90' },
      { name: 'Carpaccio de Res', desc: 'Finas láminas de res con rúcula, parmesano y aceite de trufa', price: '$16.50' },
      { name: 'Sopa del Día', desc: 'Preparación fresca del chef con pan artesanal', price: '$9.90' },
    ]},
    { cat: '🥩 Platos Principales', items: [
      { name: 'Filete Mignon', desc: 'Corte premium 250g con puré trufado y vegetales grillados', price: '$38.90' },
      { name: 'Salmón a la Parrilla', desc: 'Salmón noruego con risotto de espárragos y salsa de cítricos', price: '$32.50' },
      { name: 'Pasta Truffle', desc: 'Tagliatelle fresco con crema de trufa negra y parmesano', price: '$26.90' },
    ]},
    { cat: '🍰 Postres', items: [
      { name: 'Tiramisú Clásico', desc: 'Receta tradicional italiana con mascarpone y café expreso', price: '$11.90' },
      { name: 'Crème Brûlée', desc: 'Crema de vainilla con caramelo crujiente', price: '$10.50' },
    ]},
  ];

  const navStyle = {position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(15,10,5,0.9)',borderBottom:'1px solid #302010',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'};
  const btnStyle = {padding:'0.85rem 2rem',background:'linear-gradient(135deg,#d97706,#ea580c)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:'0.95rem'};
  const inputStyle = {background:'#1c1610',border:'1px solid #302010',borderRadius:10,padding:'0.85rem 1rem',color:'#fef3c7',outline:'none',width:'100%'};

  return <>
    <nav style={navStyle}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',fontWeight:700,color:'#fef3c7'}}>🍽️ Mi Restaurante</div>
      <div style={{display:'flex',gap:'1.5rem'}}>{['Menú','Reservar','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#b8a078',fontSize:'0.9rem'}}>{l}</a>)}</div>
    </nav>

    <section style={{minHeight:'80vh',background:'linear-gradient(135deg,rgba(15,10,5,0.85),rgba(20,15,8,0.9))',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2.5rem,5vw,4rem)',marginBottom:'1rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Una experiencia gastronómica única</h1>
      <p style={{fontSize:'1.1rem',color:'#b8a078',maxWidth:500,marginBottom:'2rem'}}>Sabores auténticos preparados con los mejores ingredientes locales y pasión por la cocina.</p>
      <button style={btnStyle}>Reservar Mesa →</button>
    </section>

    <section id="menú" style={{padding:'5rem 2rem',maxWidth:900,margin:'0 auto'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",textAlign:'center',fontSize:'2rem',marginBottom:'0.5rem',color:'#fef3c7'}}>Nuestro Menú</h2>
      <p style={{textAlign:'center',color:'#b8a078',marginBottom:'3rem'}}>Selección cuidada de platos frescos de temporada</p>
      {menuData.map((cat,ci) => <div key={ci} style={{marginBottom:'2.5rem'}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",color:'#f59e0b',fontSize:'1.2rem',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid #302010'}}>{cat.cat}</h3>
        {cat.items.map((item,ii) => <div key={ii} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'0.75rem 0',borderBottom:'1px dotted #302010'}}>
          <div><div style={{fontWeight:500,color:'#fef3c7'}}>{item.name}</div><div style={{color:'#b8a078',fontSize:'0.85rem'}}>{item.desc}</div></div>
          <div style={{color:'#f59e0b',fontWeight:700,fontSize:'1.1rem',whiteSpace:'nowrap',marginLeft:'1rem'}}>{item.price}</div>
        </div>)}
      </div>)}
    </section>

    <section id="reservar" style={{padding:'5rem 2rem',background:'#140f08',textAlign:'center'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',marginBottom:'0.5rem',color:'#fef3c7'}}>Reserva tu Mesa</h2>
      <p style={{color:'#b8a078',marginBottom:'2rem'}}>Asegura tu lugar para una experiencia inolvidable</p>
      {formSent ? <p style={{color:'#34d399'}}>✅ ¡Reservación confirmada!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setFormSent(true)}}>
        <input style={inputStyle} placeholder="Nombre completo" required />
        <input style={inputStyle} type="tel" placeholder="Teléfono" />
        <input style={inputStyle} type="date" required />
        <select style={{...inputStyle,appearance:'auto'}}><option>2 personas</option><option>4 personas</option><option>6 personas</option><option>8+ personas</option></select>
        <button type="submit" style={btnStyle}>Confirmar Reserva</button>
      </form>}
    </section>

    <footer id="contacto" style={{borderTop:'1px solid #302010',padding:'2rem',textAlign:'center',color:'#b8a078',fontSize:'0.85rem'}}>
      <div style={{display:'flex',justifyContent:'center',gap:'2rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        <span>📍 Av. Principal 123, Centro</span><span>📞 +1 234 567 890</span><span>🕐 Lun-Dom: 12:00 - 23:00</span>
      </div>
      <p>© 2026 Mi Restaurante. Creado con DOKU AI.</p>
    </footer>
  </>;
}
`, "Mi Restaurante"),
  },
  {
    id: "portfolio",
    name: "Portfolio",
    keywords: ["portfolio", "portafolio", "proyectos", "galería", "trabajos", "curriculum", "cv", "freelancer", "fotografo", "diseñador"],
    description: "Portfolio personal con React y TypeScript",
    planSteps: [
      "Crear header con navegación",
      "Diseñar sección de presentación personal",
      "Crear grid de proyectos con filtros",
      "Agregar sección de skills y contacto",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [filter, setFilter] = useState('all');
  const projects = [
    { title:'App E-commerce', desc:'Tienda online con pasarela de pagos y gestión de inventario.', icon:'🛒', tags:['React','Node.js','Stripe'], cat:'web' },
    { title:'Dashboard Analytics', desc:'Panel de control con gráficos en tiempo real y reportes automáticos.', icon:'📊', tags:['TypeScript','D3.js','Supabase'], cat:'web' },
    { title:'Chat App', desc:'Mensajería en tiempo real con videollamadas.', icon:'💬', tags:['React','WebRTC','Socket.io'], cat:'mobile' },
    { title:'App Fitness', desc:'Seguimiento de entrenamientos y nutrición personalizada.', icon:'💪', tags:['React Native','Firebase'], cat:'mobile' },
    { title:'Landing SaaS', desc:'Página de conversión con A/B testing integrado.', icon:'🚀', tags:['Next.js','Tailwind','Vercel'], cat:'web' },
    { title:'API REST', desc:'Microservicios escalables con autenticación JWT.', icon:'⚙️', tags:['Node.js','Express','PostgreSQL'], cat:'backend' },
  ];
  const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter);

  return <>
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.5rem 3rem',borderBottom:'1px solid #1e1e2e'}}>
      <div style={{fontSize:'1.5rem',fontWeight:700,color:'#a78bfa'}}>Portfolio</div>
      <div style={{display:'flex',gap:'2rem'}}>{['Sobre mí','Proyectos','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase().replace(' ','-')}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}</div>
    </nav>

    <section id="sobre-mí" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4rem',padding:'6rem 3rem',maxWidth:1100,margin:'0 auto',flexWrap:'wrap'}}>
      <div style={{width:180,height:180,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem',flexShrink:0}}>👨‍💻</div>
      <div>
        <h1 style={{fontSize:'2.5rem',marginBottom:'0.5rem',fontWeight:800}}>Hola, soy <span style={{color:'#a78bfa'}}>Dev</span></h1>
        <p style={{color:'#94a3b8',lineHeight:1.8,maxWidth:500,marginBottom:'1.5rem'}}>Desarrollador full-stack apasionado por crear experiencias web increíbles. +5 años en React, TypeScript, Node.js y diseño UI/UX.</p>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
          {['React','TypeScript','Node.js','PostgreSQL','Tailwind CSS','Docker'].map(s=><span key={s} style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.3rem 0.8rem',borderRadius:99,fontSize:'0.8rem'}}>{s}</span>)}
        </div>
        <button style={{padding:'0.75rem 1.5rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.9rem'}}>Descargar CV</button>
      </div>
    </section>

    <section id="proyectos" style={{padding:'4rem 3rem',maxWidth:1100,margin:'0 auto'}}>
      <h2 style={{fontSize:'2rem',marginBottom:'1.5rem',textAlign:'center',fontWeight:700}}>Proyectos</h2>
      <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'2rem'}}>
        {[['all','Todos'],['web','Web'],['mobile','Mobile'],['backend','Backend']].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} style={{padding:'0.5rem 1.2rem',borderRadius:99,border:'none',background:filter===k?'linear-gradient(135deg,#7c3aed,#6366f1)':'#12121a',color:filter===k?'#fff':'#94a3b8',fontWeight:500,fontSize:'0.85rem'}}>{l}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem'}}>
        {filtered.map((p,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,overflow:'hidden',transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#7c3aed'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#1e1e2e'}}>
          <div style={{height:160,background:'linear-gradient(135deg,#1a1a2e,#16213e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>{p.icon}</div>
          <div style={{padding:'1.5rem'}}><h3 style={{marginBottom:'0.25rem',fontWeight:600}}>{p.title}</h3><p style={{color:'#94a3b8',fontSize:'0.9rem'}}>{p.desc}</p>
          <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem',flexWrap:'wrap'}}>{p.tags.map(t=><span key={t} style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.2rem 0.6rem',borderRadius:99,fontSize:'0.75rem'}}>{t}</span>)}</div></div>
        </div>)}
      </div>
    </section>

    <section id="contacto" style={{padding:'5rem 3rem',textAlign:'center',background:'#0e0e16'}}>
      <h2 style={{fontSize:'2rem',marginBottom:'2rem'}}>Contáctame</h2>
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();alert('¡Mensaje enviado!')}}>
        <input style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Tu nombre" required />
        <input type="email" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="tu@email.com" required />
        <textarea style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none',resize:'vertical',minHeight:100}} placeholder="Tu mensaje..." />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Enviar</button>
      </form>
    </section>

    <footer style={{textAlign:'center',padding:'2rem',borderTop:'1px solid #1e1e2e',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Portfolio. Creado con DOKU AI.</footer>
  </>;
}
`, "Portfolio"),
  },
  {
    id: "blog",
    name: "Blog",
    keywords: ["blog", "artículos", "posts", "noticias", "publicaciones", "contenido", "revista"],
    description: "Blog con React y TypeScript",
    planSteps: [
      "Crear header con navegación y búsqueda",
      "Diseñar listado de artículos con componentes React",
      "Agregar sidebar con categorías y tags",
      "Crear footer informativo",
    ],
    html: reactWrap(`
const { useState } = React;

const postsData = [
  { tag:'Desarrollo',title:'Cómo construir una API REST con TypeScript',excerpt:'Aprende las mejores prácticas para diseñar APIs escalables y mantenibles con Node.js y TypeScript.',date:'15 Feb 2026',time:'5 min' },
  { tag:'React',title:'React 19: Novedades y Server Components',excerpt:'Todo lo nuevo en React 19 incluyendo server components, actions y el nuevo compilador.',date:'12 Feb 2026',time:'8 min' },
  { tag:'TypeScript',title:'Patrones avanzados de TypeScript',excerpt:'Generics, utility types, mapped types y más patrones para código robusto y type-safe.',date:'10 Feb 2026',time:'10 min' },
  { tag:'DevOps',title:'Deploy automático con GitHub Actions',excerpt:'Configura pipelines de CI/CD para automatizar tu flujo de desarrollo.',date:'5 Feb 2026',time:'6 min' },
  { tag:'Diseño',title:'Sistema de diseño con Tailwind CSS',excerpt:'Crea un design system completo y consistente usando Tailwind CSS y CSS variables.',date:'1 Feb 2026',time:'7 min' },
];

function App() {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const tags = [...new Set(postsData.map(p=>p.tag))];
  const filtered = postsData.filter(p => {
    if (selectedTag && p.tag !== selectedTag) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cardStyle = {background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',transition:'border-color 0.2s',cursor:'pointer'};

  return <>
    <header style={{padding:'2rem 3rem',borderBottom:'1px solid #1e1e2e',textAlign:'center'}}>
      <h1 style={{fontSize:'2rem',color:'#a78bfa',marginBottom:'0.5rem'}}>✍️ Mi Blog</h1>
      <p style={{color:'#64748b'}}>Pensamientos sobre tecnología, React y TypeScript</p>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar artículos..." style={{marginTop:'1rem',background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.6rem 1rem',color:'#e2e8f0',outline:'none',width:'100%',maxWidth:400}} />
    </header>

    <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'2rem',maxWidth:1100,margin:'2rem auto',padding:'0 2rem'}}>
      <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        {filtered.length === 0 && <p style={{color:'#64748b'}}>No se encontraron artículos.</p>}
        {filtered.map((p,i)=><article key={i} style={cardStyle} onMouseOver={e=>e.currentTarget.style.borderColor='#7c3aed'} onMouseOut={e=>e.currentTarget.style.borderColor='#1e1e2e'}>
          <span style={{display:'inline-block',background:'#7c3aed22',color:'#a78bfa',padding:'0.25rem 0.75rem',borderRadius:99,fontSize:'0.8rem',marginBottom:'0.75rem'}}>{p.tag}</span>
          <h2 style={{fontSize:'1.4rem',marginBottom:'0.5rem'}}>{p.title}</h2>
          <p style={{color:'#94a3b8'}}>{p.excerpt}</p>
          <div style={{marginTop:'1rem',color:'#64748b',fontSize:'0.85rem'}}>{p.date} · {p.time} lectura</div>
        </article>)}
      </div>
      <aside style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        <div style={{...cardStyle,padding:'1.5rem'}}><h3 style={{color:'#a78bfa',marginBottom:'1rem',fontSize:'1.1rem'}}>Categorías</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <div onClick={()=>setSelectedTag('')} style={{color:!selectedTag?'#a78bfa':'#94a3b8',cursor:'pointer',fontSize:'0.9rem'}}>📁 Todas</div>
            {tags.map(t=><div key={t} onClick={()=>setSelectedTag(t===selectedTag?'':t)} style={{color:selectedTag===t?'#a78bfa':'#94a3b8',cursor:'pointer',fontSize:'0.9rem'}}>📄 {t}</div>)}
          </div>
        </div>
        <div style={{...cardStyle,padding:'1.5rem'}}><h3 style={{color:'#a78bfa',marginBottom:'1rem',fontSize:'1.1rem'}}>Tags Populares</h3>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>{['#react','#typescript','#nodejs','#css','#nextjs','#tailwind'].map(t=><span key={t} style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.2rem 0.6rem',borderRadius:99,fontSize:'0.75rem'}}>{t}</span>)}</div>
        </div>
      </aside>
    </div>

    <footer style={{textAlign:'center',padding:'2rem',borderTop:'1px solid #1e1e2e',color:'#64748b',fontSize:'0.85rem',marginTop:'2rem'}}>© 2026 Mi Blog. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Blog"),
  },
  {
    id: "dashboard",
    name: "Dashboard",
    keywords: ["dashboard", "panel", "admin", "administración", "estadísticas", "métricas", "analytics", "control"],
    description: "Dashboard con React y TypeScript",
    planSteps: [
      "Crear sidebar de navegación con React state",
      "Diseñar cards de métricas con animaciones",
      "Agregar tabla de datos con ordenamiento",
      "Crear área de gráficos placeholder",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [activeNav, setActiveNav] = useState('inicio');
  const [sortCol, setSortCol] = useState('');
  const metrics = [
    { label:'Ingresos', value:'$48,590', change:'+12.5%', up:true },
    { label:'Usuarios', value:'2,847', change:'+8.2%', up:true },
    { label:'Pedidos', value:'1,234', change:'-3.1%', up:false },
    { label:'Conversión', value:'3.24%', change:'+1.8%', up:true },
  ];
  const rows = [
    { client:'Ana García', product:'Plan Premium', amount:'$299', status:'Activo' },
    { client:'Carlos López', product:'Plan Básico', amount:'$99', status:'Activo' },
    { client:'María Rodríguez', product:'Plan Pro', amount:'$199', status:'Pendiente' },
    { client:'Juan Martínez', product:'Plan Premium', amount:'$299', status:'Activo' },
    { client:'Laura Fernández', product:'Plan Básico', amount:'$99', status:'Cancelado' },
  ];
  const navItems = [{id:'inicio',icon:'🏠',label:'Inicio'},{id:'analytics',icon:'📈',label:'Análisis'},{id:'users',icon:'👥',label:'Usuarios'},{id:'sales',icon:'💰',label:'Ventas'},{id:'config',icon:'⚙️',label:'Config'}];

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <div style={{width:240,background:'#0f0f18',borderRight:'1px solid #1e1e2e',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
      <h2 style={{color:'#a78bfa',marginBottom:'1rem',fontSize:'1.2rem'}}>📊 Dashboard</h2>
      {navItems.map(n=><button key={n.id} onClick={()=>setActiveNav(n.id)} style={{background:activeNav===n.id?'#7c3aed22':'transparent',color:activeNav===n.id?'#a78bfa':'#94a3b8',border:'none',padding:'0.75rem 1rem',borderRadius:10,textAlign:'left',fontSize:'0.9rem',transition:'all 0.2s'}}>{n.icon} {n.label}</button>)}
    </div>
    <div style={{flex:1,padding:'2rem',overflowY:'auto'}}>
      <h1 style={{fontSize:'1.75rem',marginBottom:'1.5rem',fontWeight:700}}>Panel de Control</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {metrics.map((m,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'1.5rem'}}>
          <div style={{color:'#64748b',fontSize:'0.85rem',marginBottom:'0.5rem'}}>{m.label}</div>
          <div style={{fontSize:'2rem',fontWeight:700}}>{m.value}</div>
          <div style={{fontSize:'0.85rem',marginTop:'0.25rem',color:m.up?'#34d399':'#f87171'}}>{m.up?'↑':'↓'} {m.change}</div>
        </div>)}
      </div>
      <div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',height:250,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',marginBottom:'2rem',fontSize:'1.1rem'}}>📈 Área de Gráfico — Conectar Recharts / D3.js</div>
      <div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Cliente','Producto','Monto','Estado'].map(h=><th key={h} style={{textAlign:'left',padding:'1rem 1.5rem',background:'#0f0f18',color:'#64748b',fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em',cursor:'pointer'}} onClick={()=>setSortCol(h)}>{h} {sortCol===h?'▼':''}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=><tr key={i}><td style={{padding:'1rem 1.5rem',borderTop:'1px solid #1e1e2e'}}>{r.client}</td><td style={{padding:'1rem 1.5rem',borderTop:'1px solid #1e1e2e'}}>{r.product}</td><td style={{padding:'1rem 1.5rem',borderTop:'1px solid #1e1e2e'}}>{r.amount}</td><td style={{padding:'1rem 1.5rem',borderTop:'1px solid #1e1e2e'}}><span style={{padding:'0.25rem 0.75rem',borderRadius:99,fontSize:'0.8rem',fontWeight:500,background:r.status==='Activo'?'#34d39922':r.status==='Pendiente'?'#fbbf2422':'#f8717122',color:r.status==='Activo'?'#34d399':r.status==='Pendiente'?'#fbbf24':'#f87171'}}>{r.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}
`, "Dashboard"),
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    keywords: ["tienda", "ecommerce", "e-commerce", "shop", "productos", "comprar", "venta", "carrito", "store"],
    description: "Tienda online con React y TypeScript",
    planSteps: [
      "Crear navbar con carrito y búsqueda con React state",
      "Diseñar banner de ofertas",
      "Crear grid de productos con botón agregar al carrito",
      "Implementar contador de carrito funcional",
    ],
    html: reactWrap(`
const { useState } = React;

const productsData = [
  { name:'Sneakers Premium', price:129.99, icon:'👟', cat:'calzado' },
  { name:'Auriculares Pro', price:89.99, icon:'🎧', cat:'tech' },
  { name:'Smart Watch', price:249.99, icon:'⌚', cat:'tech' },
  { name:'Funda Designer', price:34.99, icon:'📱', cat:'accesorios' },
  { name:'Mochila Urban', price:79.99, icon:'🎒', cat:'accesorios' },
  { name:'Cámara Digital', price:449.99, icon:'📷', cat:'tech' },
  { name:'Teclado Mecánico', price:159.99, icon:'⌨️', cat:'tech' },
  { name:'Zapatillas Running', price:119.99, icon:'🏃', cat:'calzado' },
];

function App() {
  const [cart, setCart] = useState(0);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const filtered = productsData.filter(p => {
    if (cat !== 'all' && p.cat !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return <>
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.25rem 3rem',background:'#0a0f18',borderBottom:'1px solid #1a2a4a'}}>
      <div style={{fontSize:'1.4rem',fontWeight:700,color:'#60a5fa'}}>🛒 Mi Tienda</div>
      <input value={search} onChange={e=>setSearch(e.target.value)} style={{background:'#0f1525',border:'1px solid #1a2a4a',borderRadius:10,padding:'0.6rem 1.25rem',color:'#dbeafe',width:300,outline:'none'}} placeholder="Buscar productos..." />
      <button style={{background:'#2563eb22',color:'#60a5fa',padding:'0.6rem 1.25rem',borderRadius:10,border:'none',fontWeight:600}}>🛒 Carrito ({cart})</button>
    </nav>

    <div style={{background:'linear-gradient(135deg,#0a0f18,#0f1525)',padding:'4rem 3rem',textAlign:'center'}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'0.75rem',fontWeight:800,background:'linear-gradient(135deg,#2563eb,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Nuevas Ofertas de Temporada</h1>
      <p style={{color:'#7093c5',fontSize:'1.1rem'}}>Hasta 50% de descuento en productos seleccionados</p>
    </div>

    <section style={{maxWidth:1200,margin:'2rem auto',padding:'0 2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
        <h2 style={{fontSize:'1.5rem',fontWeight:700}}>Productos Destacados</h2>
        <div style={{display:'flex',gap:'0.5rem'}}>
          {[['all','Todos'],['tech','Tech'],['calzado','Calzado'],['accesorios','Accesorios']].map(([k,l])=><button key={k} onClick={()=>setCat(k)} style={{padding:'0.4rem 1rem',borderRadius:99,border:'none',background:cat===k?'linear-gradient(135deg,#2563eb,#3b82f6)':'#0f1525',color:cat===k?'#fff':'#7093c5',fontSize:'0.85rem',fontWeight:500}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.5rem'}}>
        {filtered.map((p,i)=><div key={i} style={{background:'#0f1525',border:'1px solid #1a2a4a',borderRadius:16,overflow:'hidden',transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1a2a4a';e.currentTarget.style.transform=''}}>
          <div style={{height:200,background:'linear-gradient(135deg,#0f1525,#1a2a4a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>{p.icon}</div>
          <div style={{padding:'1.25rem'}}>
            <h3 style={{marginBottom:'0.25rem',fontWeight:600}}>{p.name}</h3>
            <div style={{color:'#60a5fa',fontSize:'1.25rem',fontWeight:700,marginBottom:'0.75rem'}}>{'$'}{p.price}</div>
            <button onClick={()=>setCart(c=>c+1)} style={{width:'100%',padding:'0.65rem',background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Agregar al carrito</button>
          </div>
        </div>)}
      </div>
    </section>

    <footer style={{borderTop:'1px solid #1a2a4a',padding:'2rem',textAlign:'center',color:'#7093c5',fontSize:'0.85rem',marginTop:'3rem'}}>© 2026 Mi Tienda. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Tienda"),
  },
  {
    id: "fitness",
    name: "Fitness / Gimnasio",
    keywords: ["gimnasio", "gym", "fitness", "ejercicio", "entrenamiento", "deporte", "crossfit", "yoga", "pilates"],
    description: "Sitio web para gimnasio con React y TypeScript",
    planSteps: [
      "Crear navegación responsive con logo del gym",
      "Diseñar hero con motivación",
      "Crear sección de planes y precios con React components",
      "Agregar horarios y contacto",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const plans = [
    { name:'Básico', price:29, features:['Acceso a máquinas','Horario 6am-10pm','Casilleros','App de seguimiento'], featured:false },
    { name:'Premium', price:49, features:['Todo lo Básico','Clases grupales','Entrenador personal 2x/sem','Nutricionista','Acceso 24/7'], featured:true },
    { name:'VIP', price:79, features:['Todo lo Premium','Entrenador personal 5x/sem','Spa y sauna','Plan nutricional personalizado','Suplementos incluidos'], featured:false },
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(6,15,10,0.9)',borderBottom:'1px solid #153025',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:800,color:'#34d399'}}>💪 Mi Gym</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Planes','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#6aab8a',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.5rem 1.2rem',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Inscríbete</button>
      </div>
    </nav>

    <section style={{minHeight:'85vh',background:'linear-gradient(135deg,rgba(6,15,10,0.9),rgba(10,21,14,0.8))',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,marginBottom:'1rem',background:'linear-gradient(135deg,#059669,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textTransform:'uppercase'}}>Transforma tu cuerpo</h1>
      <p style={{fontSize:'1.1rem',color:'#6aab8a',maxWidth:550,marginBottom:'2rem'}}>Únete al gym más completo de la ciudad. Entrenadores certificados, equipos de última generación y una comunidad que te motiva.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:'0.95rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Empieza tu Prueba Gratis →</button>
    </section>

    <section id="planes" style={{padding:'5rem 2rem',background:'#0a150e'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem',color:'#d1fae5'}}>Nuestros Planes</h2>
      <p style={{textAlign:'center',color:'#6aab8a',marginBottom:'3rem'}}>Elige el plan perfecto para alcanzar tus objetivos</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {plans.map((p,i)=><div key={i} style={{background:'#0f1f15',border:p.featured?'2px solid #059669':'1px solid #153025',borderRadius:16,padding:'2rem',textAlign:'center',position:'relative',transition:'transform 0.3s',transform:selectedPlan===p.name?'scale(1.03)':''}} onClick={()=>setSelectedPlan(p.name)} onMouseOver={e=>e.currentTarget.style.transform='translateY(-4px)'} onMouseOut={e=>e.currentTarget.style.transform=''}>
          {p.featured && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',padding:'0.2rem 1rem',borderRadius:99,fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.1em'}}>POPULAR</div>}
          <h3 style={{fontSize:'1.2rem',marginBottom:'0.5rem',color:'#d1fae5'}}>{p.name}</h3>
          <div style={{fontSize:'2.5rem',fontWeight:800,color:'#34d399',marginBottom:'1rem'}}>{'$'}{p.price}<span style={{fontSize:'1rem',color:'#6aab8a',fontWeight:400}}>/mes</span></div>
          <ul style={{listStyle:'none',marginBottom:'1.5rem',textAlign:'left'}}>{p.features.map((f,j)=><li key={j} style={{padding:'0.4rem 0',color:'#6aab8a',fontSize:'0.9rem'}}>✓ {f}</li>)}</ul>
          <button style={{width:'100%',padding:'0.75rem',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Elegir Plan</button>
        </div>)}
      </div>
    </section>

    <footer id="contacto" style={{borderTop:'1px solid #153025',padding:'2rem',textAlign:'center',color:'#6aab8a',fontSize:'0.85rem'}}>
      <p>📍 Av. Fitness 456 · 📞 +1 234 567 890 · 🕐 24/7</p>
      <p style={{marginTop:'0.5rem'}}>© 2026 Mi Gym. Creado con DOKU AI.</p>
    </footer>
  </>;
}
`, "Mi Gym"),
  },
  {
    id: "agency",
    name: "Agencia / Servicios",
    keywords: ["agencia", "agency", "servicios", "consultoria", "marketing", "digital", "estudio", "studio", "creativa", "diseño"],
    description: "Sitio web para agencia con React y TypeScript",
    planSteps: [
      "Crear navegación con identidad de marca",
      "Diseñar hero con propuesta de valor",
      "Mostrar servicios con iconos React",
      "Agregar testimonios y contacto",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const services = [
    { icon:'🎨', title:'Diseño UI/UX', desc:'Interfaces intuitivas y experiencias de usuario que convierten visitantes en clientes.' },
    { icon:'💻', title:'Desarrollo Web', desc:'Aplicaciones web modernas con React, TypeScript y las mejores prácticas.' },
    { icon:'📱', title:'Apps Móviles', desc:'Aplicaciones nativas y cross-platform para iOS y Android.' },
    { icon:'📈', title:'Marketing Digital', desc:'Estrategias de SEO, SEM y redes sociales para hacer crecer tu negocio.' },
    { icon:'☁️', title:'Cloud & DevOps', desc:'Infraestructura escalable en AWS, GCP o Azure con CI/CD.' },
    { icon:'🤖', title:'Inteligencia Artificial', desc:'Soluciones con IA y machine learning para automatizar procesos.' },
  ];
  const testimonials = [
    { name:'María González', role:'CEO, TechStartup', text:'Excelente equipo. Entregaron nuestra app 2 semanas antes del deadline con calidad impecable.' },
    { name:'Carlos Ramírez', role:'Fundador, FoodApp', text:'Transformaron nuestra idea en una plataforma que ahora tiene +50K usuarios activos.' },
    { name:'Laura Mendoza', role:'CMO, RetailCo', text:'Nuestras ventas online aumentaron un 340% después de rediseñar con esta agencia.' },
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(6,10,15,0.9)',borderBottom:'1px solid #152535',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#67e8f9'}}>🚀 Mi Agencia</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Testimonios','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#60a5b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Cotizar</button>
      </div>
    </nav>

    <section style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(6,182,212,0.1) 0%,transparent 60%)'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#06b6d4,#67e8f9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Creamos experiencias digitales que impactan</h1>
      <p style={{fontSize:'1.15rem',color:'#60a5b8',maxWidth:600,marginBottom:'2rem'}}>Somos una agencia de tecnología que transforma negocios a través de soluciones digitales innovadoras.</p>
      <div style={{display:'flex',gap:'1rem'}}><button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Ver Proyectos</button><button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #152535',color:'#cffafe',borderRadius:10,fontWeight:600}}>Contactar</button></div>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem',background:'#060f14'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#cffafe'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#0a151d',border:'1px solid #152535',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#06b6d4'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#152535'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontSize:'1.15rem',fontWeight:600,marginBottom:'0.5rem',color:'#cffafe'}}>{s.title}</h3>
          <p style={{color:'#60a5b8',fontSize:'0.95rem'}}>{s.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="testimonios" style={{padding:'5rem 2rem',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#cffafe'}}>Lo que dicen nuestros clientes</h2>
      <div style={{maxWidth:600,margin:'0 auto',background:'#0a151d',border:'1px solid #152535',borderRadius:16,padding:'2.5rem'}}>
        <p style={{fontSize:'1.1rem',color:'#60a5b8',fontStyle:'italic',marginBottom:'1.5rem'}}>"{testimonials[activeTestimonial].text}"</p>
        <div style={{fontWeight:600,color:'#cffafe'}}>{testimonials[activeTestimonial].name}</div>
        <div style={{color:'#06b6d4',fontSize:'0.9rem'}}>{testimonials[activeTestimonial].role}</div>
        <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginTop:'1.5rem'}}>
          {testimonials.map((_,i)=><button key={i} onClick={()=>setActiveTestimonial(i)} style={{width:10,height:10,borderRadius:'50%',border:'none',background:i===activeTestimonial?'#06b6d4':'#152535',cursor:'pointer'}} />)}
        </div>
      </div>
    </section>

    <footer id="contacto" style={{borderTop:'1px solid #152535',padding:'2rem',textAlign:'center',color:'#60a5b8',fontSize:'0.85rem'}}>
      <p>📧 hola@miagencia.com · 📞 +1 234 567 890</p>
      <p style={{marginTop:'0.5rem'}}>© 2026 Mi Agencia. Creado con DOKU AI.</p>
    </footer>
  </>;
}
`, "Mi Agencia"),
  },
  {
    id: "login",
    name: "Página de Login",
    keywords: ["login", "iniciar sesión", "inicio de sesión", "autenticación", "auth", "registro", "signup", "sign in", "acceso", "cuenta"],
    description: "Página de autenticación con React y TypeScript",
    planSteps: [
      "Crear layout split-screen con componentes React",
      "Diseñar formulario de login con validación",
      "Agregar toggle entre login y registro",
      "Implementar botones de login social",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Todos los campos son obligatorios'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); alert(isLogin ? '¡Bienvenido!' : '¡Cuenta creada!'); }, 1500);
  };

  const inputStyle = {width:'100%',background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none',fontSize:'0.95rem'};
  const socialBtn = {flex:1,padding:'0.75rem',background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,color:'#e2e8f0',fontSize:'0.9rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'};

  return <div style={{minHeight:'100vh',display:'flex'}}>
    <div style={{flex:1,background:'linear-gradient(135deg,#0a0a0f,#12121a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem'}}>
      <div style={{maxWidth:400,width:'100%'}}>
        <div style={{marginBottom:'2rem',textAlign:'center'}}>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:'0.5rem',background:'linear-gradient(135deg,#a78bfa,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p style={{color:'#94a3b8'}}>{isLogin ? 'Inicia sesión en tu cuenta' : 'Regístrate para comenzar'}</p>
        </div>

        <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.5rem'}}>
          <button style={socialBtn}>🔵 Google</button>
          <button style={socialBtn}>⚫ GitHub</button>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
          <div style={{flex:1,height:1,background:'#1e1e2e'}} />
          <span style={{color:'#64748b',fontSize:'0.85rem'}}>o</span>
          <div style={{flex:1,height:1,background:'#1e1e2e'}} />
        </div>

        {error && <div style={{background:'#f8717122',color:'#f87171',padding:'0.75rem',borderRadius:10,marginBottom:'1rem',fontSize:'0.9rem',textAlign:'center'}}>{error}</div>}

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {!isLogin && <input style={inputStyle} placeholder="Nombre completo" value={name} onChange={e=>setName(e.target.value)} required />}
          <input style={inputStyle} type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
          {isLogin && <div style={{textAlign:'right'}}><a href="#" style={{color:'#a78bfa',fontSize:'0.85rem'}}>¿Olvidaste tu contraseña?</a></div>}
          <button type="submit" disabled={loading} style={{padding:'0.85rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem',opacity:loading?0.7:1}}>{loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</button>
        </form>

        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#94a3b8',fontSize:'0.9rem'}}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button onClick={()=>{setIsLogin(!isLogin);setError('')}} style={{background:'none',border:'none',color:'#a78bfa',fontWeight:600,cursor:'pointer',fontSize:'0.9rem'}}>{isLogin ? 'Regístrate' : 'Inicia sesión'}</button>
        </p>
      </div>
    </div>

    <div style={{flex:1,background:'linear-gradient(135deg,#1a1040,#0f0a2e)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem'}}>
      <div style={{fontSize:'4rem',marginBottom:'1.5rem'}}>🚀</div>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'1rem',color:'#e2e8f0',textAlign:'center'}}>Construye el futuro</h2>
      <p style={{color:'#94a3b8',textAlign:'center',maxWidth:400,fontSize:'1.05rem'}}>Accede a herramientas de desarrollo potenciadas por inteligencia artificial. Crea sitios web profesionales en minutos.</p>
      <div style={{display:'flex',gap:'2rem',marginTop:'2.5rem',color:'#64748b',fontSize:'0.9rem'}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:'1.5rem',fontWeight:700,color:'#a78bfa'}}>10K+</div>Usuarios</div>
        <div style={{textAlign:'center'}}><div style={{fontSize:'1.5rem',fontWeight:700,color:'#a78bfa'}}>50K+</div>Proyectos</div>
        <div style={{textAlign:'center'}}><div style={{fontSize:'1.5rem',fontWeight:700,color:'#a78bfa'}}>99%</div>Uptime</div>
      </div>
    </div>
  </div>;
}
`, "Login"),
  },
  {
    id: "medical",
    name: "Clínica / Consultorio",
    keywords: ["clínica", "clinica", "médico", "medico", "doctor", "salud", "hospital", "consultorio", "dental", "dentista", "veterinaria", "farmacia"],
    description: "Sitio web para clínica o consultorio médico con React",
    planSteps: [
      "Crear navegación profesional médica",
      "Diseñar hero con servicios médicos",
      "Crear sección de doctores y especialidades",
      "Agregar formulario de citas",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [booked, setBooked] = useState(false);
  const doctors = [
    { name:'Dra. Ana Martínez', specialty:'Medicina General', icon:'👩‍⚕️' },
    { name:'Dr. Carlos Ruiz', specialty:'Cardiología', icon:'👨‍⚕️' },
    { name:'Dra. Laura Sánchez', specialty:'Dermatología', icon:'👩‍⚕️' },
    { name:'Dr. Miguel Torres', specialty:'Pediatría', icon:'👨‍⚕️' },
  ];
  const services = [
    { icon:'🩺', title:'Consulta General', desc:'Evaluación médica completa con diagnóstico personalizado.' },
    { icon:'💉', title:'Vacunación', desc:'Programa completo de inmunización para todas las edades.' },
    { icon:'🔬', title:'Laboratorio', desc:'Análisis clínicos con resultados rápidos y precisos.' },
    { icon:'🏥', title:'Urgencias', desc:'Atención de emergencias 24/7 con equipo especializado.' },
  ];

  const inputStyle = {width:'100%',background:'#0f1a1f',border:'1px solid #15303a',borderRadius:10,padding:'0.85rem 1rem',color:'#e0f2fe',outline:'none'};

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(8,15,20,0.95)',borderBottom:'1px solid #15303a',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#38bdf8'}}>🏥 Mi Clínica</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Doctores','Citas'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#7cb8d0',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#0284c7,#38bdf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Agendar Cita</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(56,189,248,0.08) 0%,transparent 60%)'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#0284c7,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Tu salud es nuestra prioridad</h1>
      <p style={{fontSize:'1.15rem',color:'#7cb8d0',maxWidth:600,marginBottom:'2rem'}}>Atención médica de calidad con profesionales especializados y tecnología de vanguardia.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#0284c7,#38bdf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Agendar Consulta →</button>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem',background:'#060f15'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#e0f2fe'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#0a1520',border:'1px solid #15303a',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#0284c7'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#15303a'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem',color:'#e0f2fe'}}>{s.title}</h3>
          <p style={{color:'#7cb8d0',fontSize:'0.95rem'}}>{s.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="doctores" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#e0f2fe'}}>Nuestro Equipo</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {doctors.map((d,i)=><div key={i} style={{background:'#0a1520',border:'1px solid #15303a',borderRadius:16,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>{d.icon}</div>
          <h3 style={{fontWeight:600,color:'#e0f2fe'}}>{d.name}</h3>
          <p style={{color:'#38bdf8',fontSize:'0.9rem'}}>{d.specialty}</p>
        </div>)}
      </div>
    </section>

    <section id="citas" style={{padding:'5rem 2rem',background:'#060f15',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#e0f2fe'}}>Agenda tu Cita</h2>
      {booked ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Cita agendada exitosamente!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setBooked(true)}}>
        <input style={inputStyle} placeholder="Nombre completo" required />
        <input style={inputStyle} type="tel" placeholder="Teléfono" required />
        <select style={{...inputStyle,appearance:'auto'}}><option>Medicina General</option><option>Cardiología</option><option>Dermatología</option><option>Pediatría</option></select>
        <input style={inputStyle} type="date" required />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#0284c7,#38bdf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Confirmar Cita</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #15303a',padding:'2rem',textAlign:'center',color:'#7cb8d0',fontSize:'0.85rem'}}>
      <p>📍 Av. Salud 789 · 📞 +1 234 567 890 · 🕐 Lun-Sáb: 8:00 - 20:00</p>
      <p style={{marginTop:'0.5rem'}}>© 2026 Mi Clínica. Creado con DOKU AI.</p>
    </footer>
  </>;
}
`, "Mi Clínica"),
  },
  {
    id: "education",
    name: "Educación / Cursos",
    keywords: ["educación", "educacion", "escuela", "universidad", "cursos", "academia", "aprendizaje", "tutoriales", "clases", "enseñanza", "capacitación"],
    description: "Plataforma educativa con React y TypeScript",
    planSteps: [
      "Crear navegación con identidad educativa",
      "Diseñar hero con propuesta de valor",
      "Crear catálogo de cursos con filtros",
      "Agregar sección de precios y CTA",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [cat, setCat] = useState('all');
  const courses = [
    { title:'React & TypeScript Avanzado', desc:'Aprende a construir apps production-ready con React 19 y TypeScript 5.', icon:'⚛️', cat:'frontend', students:2340, rating:4.9, price:'$49' },
    { title:'Node.js & Express API', desc:'Backend profesional con autenticación, base de datos y deploy.', icon:'🟢', cat:'backend', students:1890, rating:4.8, price:'$39' },
    { title:'Python para Data Science', desc:'Análisis de datos, ML y visualización con Python y Jupyter.', icon:'🐍', cat:'data', students:3120, rating:4.7, price:'$59' },
    { title:'Flutter Mobile Development', desc:'Apps nativas para iOS y Android con un solo código base.', icon:'📱', cat:'mobile', students:1560, rating:4.8, price:'$45' },
    { title:'DevOps & Cloud', desc:'Docker, Kubernetes, CI/CD y despliegue en la nube.', icon:'☁️', cat:'devops', students:980, rating:4.6, price:'$55' },
    { title:'UI/UX Design con Figma', desc:'Diseño de interfaces y prototipos interactivos profesionales.', icon:'🎨', cat:'design', students:2780, rating:4.9, price:'$35' },
  ];
  const filtered = cat === 'all' ? courses : courses.filter(c => c.cat === cat);

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#f59e0b'}}>🎓 Mi Academia</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Cursos','Planes','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Inscríbete</button>
      </div>
    </nav>

    <section style={{minHeight:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.08) 0%,transparent 60%)'}}>
      <span style={{background:'#d9770622',color:'#f59e0b',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid #d9770644'}}>🎓 +10,000 estudiantes activos</span>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Aprende las habilidades del futuro</h1>
      <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Cursos prácticos de desarrollo web, mobile, data science y más. Aprende a tu ritmo con proyectos reales.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Explorar Cursos →</button>
    </section>

    <section id="cursos" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'1.5rem'}}>Catálogo de Cursos</h2>
      <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'2.5rem',flexWrap:'wrap'}}>
        {[['all','Todos'],['frontend','Frontend'],['backend','Backend'],['data','Data'],['mobile','Mobile'],['devops','DevOps'],['design','Diseño']].map(([k,l])=><button key={k} onClick={()=>setCat(k)} style={{padding:'0.5rem 1rem',borderRadius:99,border:'none',background:cat===k?'linear-gradient(135deg,#d97706,#f59e0b)':'#12121a',color:cat===k?'#fff':'#94a3b8',fontSize:'0.85rem',fontWeight:500}}>{l}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {filtered.map((c,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#d97706'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#1e1e2e'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>{c.icon}</div>
          <h3 style={{fontSize:'1.15rem',fontWeight:600,marginBottom:'0.5rem'}}>{c.title}</h3>
          <p style={{color:'#94a3b8',fontSize:'0.9rem',marginBottom:'1rem'}}>{c.desc}</p>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',gap:'1rem',fontSize:'0.8rem',color:'#64748b'}}><span>⭐ {c.rating}</span><span>👥 {c.students}</span></div>
            <div style={{color:'#f59e0b',fontWeight:700,fontSize:'1.2rem'}}>{c.price}</div>
          </div>
          <button style={{width:'100%',marginTop:'1rem',padding:'0.7rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Inscribirme</button>
        </div>)}
      </div>
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Mi Academia. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Academia"),
  },
  {
    id: "realestate",
    name: "Inmobiliaria",
    keywords: ["inmobiliaria", "bienes raíces", "propiedad", "casa", "departamento", "apartamento", "renta", "alquiler", "venta de casas", "real estate", "propiedades"],
    description: "Sitio inmobiliario con React y TypeScript",
    planSteps: [
      "Crear navegación inmobiliaria",
      "Diseñar hero con búsqueda de propiedades",
      "Crear grid de propiedades con filtros",
      "Agregar contacto y CTA",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [filter, setFilter] = useState('all');
  const properties = [
    { title:'Casa Moderna', location:'Col. Del Valle', price:'$3,200,000', beds:3, baths:2, area:'180m²', icon:'🏠', type:'venta' },
    { title:'Departamento Loft', location:'Polanco', price:'$18,500/mes', beds:1, baths:1, area:'85m²', icon:'🏢', type:'renta' },
    { title:'Residencia Premium', location:'Santa Fe', price:'$8,500,000', beds:5, baths:4, area:'420m²', icon:'🏡', type:'venta' },
    { title:'Oficina Ejecutiva', location:'Reforma', price:'$45,000/mes', beds:0, baths:2, area:'200m²', icon:'🏗️', type:'renta' },
    { title:'Penthouse Vista Mar', location:'Cancún', price:'$12,000,000', beds:4, baths:3, area:'350m²', icon:'🌊', type:'venta' },
    { title:'Studio Céntrico', location:'Roma Norte', price:'$12,000/mes', beds:1, baths:1, area:'45m²', icon:'🏙️', type:'renta' },
  ];
  const filtered = filter === 'all' ? properties : properties.filter(p => p.type === filter);

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#f43f5e'}}>🏠 Mi Inmobiliaria</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Propiedades','Nosotros','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#e11d48,#f43f5e)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Publicar</button>
      </div>
    </nav>

    <section style={{minHeight:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(244,63,94,0.08) 0%,transparent 60%)'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#e11d48,#f43f5e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Encuentra tu hogar ideal</h1>
      <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Las mejores propiedades en venta y renta. Tu próximo hogar te está esperando.</p>
      <div style={{display:'flex',gap:'0.75rem',background:'#12121a',border:'1px solid #1e1e2e',borderRadius:12,padding:'0.75rem',maxWidth:600,width:'100%'}}>
        <input style={{flex:1,background:'transparent',border:'none',color:'#e2e8f0',outline:'none',padding:'0.5rem',fontSize:'0.95rem'}} placeholder="Buscar por ubicación..." />
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#e11d48,#f43f5e)',color:'#fff',border:'none',borderRadius:8,fontWeight:600}}>Buscar</button>
      </div>
    </section>

    <section id="propiedades" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',maxWidth:1100,margin:'0 auto 2rem',flexWrap:'wrap',gap:'1rem'}}>
        <h2 style={{fontSize:'2rem',fontWeight:700}}>Propiedades</h2>
        <div style={{display:'flex',gap:'0.5rem'}}>
          {[['all','Todas'],['venta','Venta'],['renta','Renta']].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} style={{padding:'0.5rem 1.2rem',borderRadius:99,border:'none',background:filter===k?'linear-gradient(135deg,#e11d48,#f43f5e)':'#12121a',color:filter===k?'#fff':'#94a3b8',fontSize:'0.85rem',fontWeight:500}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {filtered.map((p,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,overflow:'hidden',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#e11d48'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#1e1e2e'}}>
          <div style={{height:180,background:'linear-gradient(135deg,#1a1a2e,#16213e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem',position:'relative'}}>
            {p.icon}
            <span style={{position:'absolute',top:12,right:12,background:p.type==='venta'?'#e11d48':'#0284c7',color:'#fff',padding:'0.2rem 0.8rem',borderRadius:99,fontSize:'0.75rem',fontWeight:600,textTransform:'uppercase'}}>{p.type}</span>
          </div>
          <div style={{padding:'1.5rem'}}>
            <h3 style={{fontWeight:600,marginBottom:'0.25rem'}}>{p.title}</h3>
            <p style={{color:'#94a3b8',fontSize:'0.9rem',marginBottom:'0.75rem'}}>📍 {p.location}</p>
            <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#64748b'}}>
              {p.beds > 0 && <span>🛏️ {p.beds}</span>}<span>🚿 {p.baths}</span><span>📐 {p.area}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'#f43f5e',fontSize:'1.2rem',fontWeight:700}}>{p.price}</div>
              <button style={{padding:'0.5rem 1rem',background:'linear-gradient(135deg,#e11d48,#f43f5e)',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:'0.85rem'}}>Ver más</button>
            </div>
          </div>
        </div>)}
      </div>
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Mi Inmobiliaria. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Inmobiliaria"),
  },
  {
    id: "event",
    name: "Evento / Conferencia",
    keywords: ["evento", "conferencia", "congreso", "summit", "meetup", "webinar", "taller", "workshop", "hackathon", "fiesta", "boda"],
    description: "Página de evento con React y TypeScript",
    planSteps: [
      "Crear hero con countdown del evento",
      "Diseñar agenda con horarios",
      "Crear sección de speakers",
      "Agregar registro al evento",
    ],
    html: reactWrap(`
const { useState, useEffect } = React;

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days:0, hours:0, minutes:0, seconds:0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { clearInterval(timer); return; }
      setTime({
        days: Math.floor(diff / (1000*60*60*24)),
        hours: Math.floor((diff / (1000*60*60)) % 24),
        minutes: Math.floor((diff / (1000*60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  const boxStyle = {background:'#12121a',border:'1px solid #1e1e2e',borderRadius:12,padding:'1.5rem 1rem',textAlign:'center',minWidth:80};
  return <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
    {Object.entries(time).map(([k,v])=><div key={k} style={boxStyle}><div style={{fontSize:'2rem',fontWeight:800,color:'#f59e0b'}}>{String(v).padStart(2,'0')}</div><div style={{color:'#64748b',fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>{k}</div></div>)}
  </div>;
}

function App() {
  const [registered, setRegistered] = useState(false);
  const speakers = [
    { name:'Sarah Johnson', role:'CEO, TechCorp', topic:'El futuro de la IA', icon:'👩‍💼' },
    { name:'Miguel Ángel', role:'CTO, DataFlow', topic:'Arquitectura cloud', icon:'👨‍💻' },
    { name:'Laura Chen', role:'VP Eng, StartupX', topic:'Scaling teams', icon:'👩‍🔬' },
  ];
  const agenda = [
    { time:'09:00', title:'Registro y Networking', speaker:'—' },
    { time:'10:00', title:'Keynote: El futuro de la IA', speaker:'Sarah Johnson' },
    { time:'11:30', title:'Arquitectura cloud a escala', speaker:'Miguel Ángel' },
    { time:'13:00', title:'Almuerzo', speaker:'—' },
    { time:'14:30', title:'Scaling engineering teams', speaker:'Laura Chen' },
    { time:'16:00', title:'Panel de discusión', speaker:'Todos' },
    { time:'17:30', title:'Networking y cierre', speaker:'—' },
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#f59e0b'}}>🎤 Tech Summit 2026</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Agenda','Speakers','Registro'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Registrarse</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.08) 0%,transparent 60%)'}}>
      <span style={{background:'#d9770622',color:'#f59e0b',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem'}}>📅 15 de Julio, 2026 · Ciudad de México</span>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Tech Summit 2026</h1>
      <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'3rem'}}>La conferencia de tecnología más importante del año. Speakers internacionales, workshops y networking.</p>
      <Countdown targetDate="2026-07-15T09:00:00" />
    </section>

    <section id="agenda" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Agenda</h2>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        {agenda.map((a,i)=><div key={i} style={{display:'flex',gap:'2rem',padding:'1rem 0',borderBottom:'1px solid #1e1e2e',alignItems:'center'}}>
          <div style={{color:'#f59e0b',fontWeight:700,minWidth:60,fontSize:'1.1rem'}}>{a.time}</div>
          <div><div style={{fontWeight:600}}>{a.title}</div><div style={{color:'#64748b',fontSize:'0.85rem'}}>{a.speaker}</div></div>
        </div>)}
      </div>
    </section>

    <section id="speakers" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Speakers</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {speakers.map((s,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.25rem'}}>{s.name}</h3>
          <div style={{color:'#f59e0b',fontSize:'0.9rem',marginBottom:'0.5rem'}}>{s.role}</div>
          <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>"{s.topic}"</p>
        </div>)}
      </div>
    </section>

    <section id="registro" style={{padding:'5rem 2rem',background:'#0e0e16',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem'}}>Regístrate Ahora</h2>
      {registered ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Registro confirmado! Te enviaremos los detalles por email.</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setRegistered(true)}}>
        <input style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Nombre completo" required />
        <input type="email" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="tu@email.com" required />
        <input style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Empresa" />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Confirmar Registro — Gratis</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Tech Summit. Creado con DOKU AI.</footer>
  </>;
}
`, "Tech Summit 2026"),
  },
  {
    id: "saas",
    name: "SaaS / Producto",
    keywords: ["saas", "producto", "software", "plataforma", "herramienta", "tool", "app web", "aplicación", "servicio"],
    description: "Landing SaaS con React y TypeScript",
    planSteps: [
      "Crear navegación SaaS profesional",
      "Diseñar hero con demo/mockup del producto",
      "Crear sección de features y pricing",
      "Agregar FAQ y CTA final",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(-1);
  const features = [
    { icon:'⚡', title:'Velocidad', desc:'Despliega en segundos, no minutos. Infraestructura optimizada globalmente.' },
    { icon:'🔄', title:'Automatización', desc:'Workflows automáticos que ahorran horas de trabajo repetitivo.' },
    { icon:'📊', title:'Analytics', desc:'Dashboards en tiempo real con métricas que importan.' },
    { icon:'🔐', title:'Seguridad', desc:'SOC2 compliant. Encriptación end-to-end por defecto.' },
    { icon:'🌍', title:'Escalable', desc:'De 0 a millones de usuarios sin cambiar una línea de código.' },
    { icon:'🔌', title:'Integraciones', desc:'Conecta con +100 herramientas que ya usas (Slack, GitHub, etc).' },
  ];
  const plans = [
    { name:'Starter', price:billing==='monthly'?0:0, desc:'Para proyectos personales', features:['1 proyecto','1K requests/mes','Comunidad'], cta:'Empezar Gratis' },
    { name:'Pro', price:billing==='monthly'?29:24, desc:'Para equipos en crecimiento', features:['Proyectos ilimitados','100K requests/mes','Soporte prioritario','Analytics avanzados','Custom domain'], cta:'Comenzar Prueba', featured:true },
    { name:'Enterprise', price:billing==='monthly'?99:84, desc:'Para grandes organizaciones', features:['Todo en Pro','Requests ilimitados','SLA 99.99%','Soporte dedicado','On-premise option','SSO/SAML'], cta:'Contactar Ventas' },
  ];
  const faqs = [
    { q:'¿Puedo cambiar de plan después?', a:'Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea el cobro.' },
    { q:'¿Ofrecen prueba gratuita?', a:'Sí, todos los planes de pago incluyen 14 días de prueba gratuita sin tarjeta de crédito.' },
    { q:'¿Cómo funciona el soporte?', a:'Starter tiene acceso a la comunidad. Pro incluye soporte por email con respuesta en 24h. Enterprise tiene soporte dedicado 24/7.' },
    { q:'¿Puedo cancelar cuando quiera?', a:'Absolutamente. Sin contratos de permanencia. Cancela cuando quieras sin penalizaciones.' },
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#a78bfa'}}>⚡ ProductoAI</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Features','Pricing','FAQ'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.5rem 1rem',background:'transparent',border:'1px solid #2d2d3f',color:'#e2e8f0',borderRadius:8,fontSize:'0.85rem',marginRight:'0.5rem'}}>Login</button>
        <button style={{padding:'0.5rem 1rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:8,fontSize:'0.85rem',fontWeight:600}}>Sign Up Free</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.1) 0%,transparent 60%)'}}>
      <span style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid #7c3aed44'}}>🎉 Lanzamiento v2.0 — Nuevas features</span>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#a78bfa,#818cf8,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',maxWidth:800}}>La plataforma que tu equipo necesita</h1>
      <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Automatiza workflows, monitorea métricas y escala tu producto. Todo en una sola plataforma.</p>
      <div style={{display:'flex',gap:'1rem'}}>
        <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,boxShadow:'0 4px 15px rgba(124,58,237,0.3)'}}>Empezar Gratis →</button>
        <button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #2d2d3f',color:'#e2e8f0',borderRadius:10,fontWeight:600}}>Ver Demo</button>
      </div>
    </section>

    <section id="features" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Todo lo que necesitas</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {features.map((f,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem'}}><div style={{fontSize:'2rem',marginBottom:'1rem'}}>{f.icon}</div><h3 style={{fontWeight:600,marginBottom:'0.5rem'}}>{f.title}</h3><p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{f.desc}</p></div>)}
      </div>
    </section>

    <section id="pricing" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>Precios simples y transparentes</h2>
      <p style={{textAlign:'center',color:'#94a3b8',marginBottom:'2rem'}}>Sin costos ocultos. Cancela cuando quieras.</p>
      <div style={{display:'flex',justifyContent:'center',gap:'0.25rem',marginBottom:'3rem',background:'#12121a',borderRadius:99,padding:'0.25rem',width:'fit-content',margin:'0 auto 3rem'}}>
        {['monthly','yearly'].map(b=><button key={b} onClick={()=>setBilling(b)} style={{padding:'0.5rem 1.5rem',borderRadius:99,border:'none',background:billing===b?'linear-gradient(135deg,#7c3aed,#6366f1)':'transparent',color:billing===b?'#fff':'#94a3b8',fontSize:'0.85rem',fontWeight:500}}>{b==='monthly'?'Mensual':'Anual (-20%)'}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {plans.map((p,i)=><div key={i} style={{background:'#12121a',border:p.featured?'2px solid #7c3aed':'1px solid #1e1e2e',borderRadius:16,padding:'2rem',position:'relative'}}>
          {p.featured && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',padding:'0.2rem 1rem',borderRadius:99,fontSize:'0.7rem',fontWeight:700}}>POPULAR</div>}
          <h3 style={{fontSize:'1.2rem',marginBottom:'0.25rem'}}>{p.name}</h3>
          <p style={{color:'#64748b',fontSize:'0.85rem',marginBottom:'1rem'}}>{p.desc}</p>
          <div style={{fontSize:'2.5rem',fontWeight:800,marginBottom:'1rem'}}>{p.price===0?'Gratis':\`$\${p.price}\`}{p.price>0 && <span style={{fontSize:'1rem',color:'#64748b',fontWeight:400}}>/mes</span>}</div>
          <ul style={{listStyle:'none',marginBottom:'1.5rem'}}>{p.features.map((f,j)=><li key={j} style={{padding:'0.35rem 0',color:'#94a3b8',fontSize:'0.9rem'}}>✓ {f}</li>)}</ul>
          <button style={{width:'100%',padding:'0.75rem',background:p.featured?'linear-gradient(135deg,#7c3aed,#6366f1)':'transparent',border:p.featured?'none':'1px solid #2d2d3f',color:'#fff',borderRadius:10,fontWeight:600}}>{p.cta}</button>
        </div>)}
      </div>
    </section>

    <section id="faq" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Preguntas Frecuentes</h2>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        {faqs.map((f,i)=><div key={i} style={{borderBottom:'1px solid #1e1e2e'}}>
          <button onClick={()=>setOpenFaq(openFaq===i?-1:i)} style={{width:'100%',padding:'1.25rem 0',background:'none',border:'none',color:'#e2e8f0',fontSize:'1rem',fontWeight:600,textAlign:'left',display:'flex',justifyContent:'space-between',cursor:'pointer'}}>
            {f.q}<span style={{color:'#a78bfa'}}>{openFaq===i?'−':'+'}</span>
          </button>
          {openFaq===i && <p style={{color:'#94a3b8',paddingBottom:'1.25rem',fontSize:'0.95rem'}}>{f.a}</p>}
        </div>)}
      </div>
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 ProductoAI. Creado con DOKU AI.</footer>
  </>;
}
`, "ProductoAI"),
  },
  {
    id: "notfound",
    name: "Página 404",
    keywords: ["404", "error", "not found", "no encontrado", "pagina no encontrada", "perdido"],
    description: "Página 404 creativa con React y TypeScript",
    planSteps: [
      "Crear componente 404 con animación",
      "Agregar ilustración y mensaje amigable",
      "Incluir botón de regreso al inicio",
    ],
    html: reactWrap(`
const { useState, useEffect } = React;

// TypeScript interfaces
// interface AnimState { x: number; y: number; }

function App() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [found, setFound] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% 50%,rgba(124,58,237,0.08) 0%,#0a0a0f 70%)',padding:'2rem',textAlign:'center',position:'relative',overflow:'hidden'}}>
    {/* Floating orbs */}
    <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:'rgba(124,58,237,0.06)',filter:'blur(40px)',left:\`\${pos.x}%\`,top:\`\${pos.y}%\`,transition:'all 2s ease-in-out',transform:'translate(-50%,-50%)'}} />
    <div style={{position:'absolute',width:150,height:150,borderRadius:'50%',background:'rgba(99,102,241,0.05)',filter:'blur(30px)',right:\`\${100-pos.x}%\`,bottom:\`\${100-pos.y}%\`,transition:'all 2.5s ease-in-out',transform:'translate(50%,50%)'}} />

    <div style={{fontSize:'8rem',fontWeight:900,background:'linear-gradient(135deg,#a78bfa,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1,marginBottom:'1rem'}}>404</div>
    <h1 style={{fontSize:'1.8rem',fontWeight:700,marginBottom:'0.75rem',color:'#e2e8f0'}}>Página no encontrada</h1>
    <p style={{color:'#94a3b8',maxWidth:450,marginBottom:'2rem',fontSize:'1.05rem'}}>Parece que te has perdido en el espacio digital. La página que buscas no existe o fue movida.</p>
    
    <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',justifyContent:'center'}}>
      <button onClick={()=>window.location.href='/'} style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem',boxShadow:'0 4px 15px rgba(124,58,237,0.3)',cursor:'pointer'}}>← Volver al Inicio</button>
      <button onClick={()=>setFound(!found)} style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #2d2d3f',color:'#e2e8f0',borderRadius:10,fontWeight:600,fontSize:'0.95rem',cursor:'pointer'}}>{found ? '🎉 ¡Encontrado!' : '🔍 Buscar'}</button>
    </div>

    {found && <p style={{marginTop:'2rem',color:'#34d399',fontSize:'1rem'}}>Solo bromeaba... esta página realmente no existe 😄</p>}

    <div style={{marginTop:'4rem',color:'#64748b',fontSize:'0.8rem'}}>
      <p>Código de error: 404 · Creado con DOKU AI</p>
    </div>
  </div>;
}
`, "404 - Página no encontrada"),
  },
  {
    id: "pricing",
    name: "Página de Precios",
    keywords: ["precios", "pricing", "planes", "tarifas", "suscripcion", "membresía", "paquetes", "costos"],
    description: "Página de precios con React y TypeScript",
    planSteps: [
      "Crear toggle mensual/anual con React.useState",
      "Diseñar cards de planes con features",
      "Agregar sección de FAQ con accordion",
      "Incluir CTA y garantía de satisfacción",
    ],
    html: reactWrap(`
const { useState } = React;

// TypeScript interfaces for type safety
// interface Plan { name: string; price: number; desc: string; features: string[]; cta: string; featured?: boolean; }
// interface FAQ { q: string; a: string; }

function App() {
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(-1);

  const plans = [
    { name:'Básico', price:billing==='monthly'?0:0, desc:'Para empezar', features:['1 proyecto','500 visitas/mes','Soporte por email','Templates básicos'], cta:'Empezar Gratis' },
    { name:'Profesional', price:billing==='monthly'?29:23, desc:'Para negocios', features:['10 proyectos','50K visitas/mes','Soporte prioritario','Todos los templates','Dominio personalizado','Analytics avanzados'], cta:'Probar 14 días gratis', featured:true },
    { name:'Empresa', price:billing==='monthly'?79:63, desc:'Para equipos grandes', features:['Proyectos ilimitados','Visitas ilimitadas','Soporte dedicado 24/7','API access','White-label','SSO/SAML','SLA 99.99%'], cta:'Contactar Ventas' },
  ];

  const faqs = [
    { q:'¿Puedo cambiar de plan?', a:'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente.' },
    { q:'¿Hay período de prueba?', a:'Sí, el plan Profesional incluye 14 días de prueba gratuita sin necesidad de tarjeta de crédito.' },
    { q:'¿Qué métodos de pago aceptan?', a:'Aceptamos todas las tarjetas principales (Visa, Mastercard, Amex) y PayPal. Facturación disponible para empresas.' },
    { q:'¿Puedo cancelar cuando quiera?', a:'Absolutamente. Sin contratos ni penalizaciones. Cancela con un clic desde tu panel.' },
    { q:'¿Ofrecen descuento para startups?', a:'Sí, tenemos un programa para startups con hasta 50% de descuento. Contáctanos para más información.' },
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,background:'linear-gradient(135deg,#a78bfa,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>💎 Mi Producto</div>
      <button style={{padding:'0.5rem 1.25rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:8,fontSize:'0.85rem',fontWeight:600}}>Empezar</button>
    </nav>

    <section style={{padding:'5rem 2rem',textAlign:'center',background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.1) 0%,transparent 60%)'}}>
      <span style={{background:'#7c3aed22',color:'#a78bfa',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',border:'1px solid #7c3aed44'}}>💰 Precios transparentes</span>
      <h1 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,marginTop:'1.5rem',marginBottom:'1rem',color:'#e2e8f0'}}>Encuentra el plan perfecto</h1>
      <p style={{color:'#94a3b8',maxWidth:500,margin:'0 auto 2rem'}}>Sin costos ocultos. Sin sorpresas. Cancela cuando quieras.</p>

      <div style={{display:'inline-flex',gap:'0.25rem',background:'#12121a',borderRadius:99,padding:'0.25rem',marginBottom:'3rem'}}>
        {['monthly','yearly'].map(b=><button key={b} onClick={()=>setBilling(b)} style={{padding:'0.5rem 1.5rem',borderRadius:99,border:'none',background:billing===b?'linear-gradient(135deg,#7c3aed,#6366f1)':'transparent',color:billing===b?'#fff':'#94a3b8',fontSize:'0.85rem',fontWeight:500,cursor:'pointer'}}>{b==='monthly'?'Mensual':'Anual (-20%)'}</button>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {plans.map((p,i)=><div key={i} style={{background:'#12121a',border:p.featured?'2px solid #7c3aed':'1px solid #1e1e2e',borderRadius:16,padding:'2rem',position:'relative',textAlign:'left'}}>
          {p.featured && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',padding:'0.2rem 1rem',borderRadius:99,fontSize:'0.7rem',fontWeight:700}}>MÁS POPULAR</div>}
          <h3 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'0.25rem'}}>{p.name}</h3>
          <p style={{color:'#64748b',fontSize:'0.85rem',marginBottom:'1.5rem'}}>{p.desc}</p>
          <div style={{marginBottom:'1.5rem'}}><span style={{fontSize:'2.5rem',fontWeight:800}}>{p.price===0?'Gratis':\`$\${p.price}\`}</span>{p.price>0 && <span style={{color:'#64748b'}}>/mes</span>}</div>
          <ul style={{listStyle:'none',marginBottom:'1.5rem'}}>{p.features.map((f,j)=><li key={j} style={{padding:'0.4rem 0',color:'#94a3b8',fontSize:'0.9rem'}}>✓ {f}</li>)}</ul>
          <button style={{width:'100%',padding:'0.75rem',background:p.featured?'linear-gradient(135deg,#7c3aed,#6366f1)':'transparent',border:p.featured?'none':'1px solid #2d2d3f',color:'#fff',borderRadius:10,fontWeight:600,cursor:'pointer'}}>{p.cta}</button>
        </div>)}
      </div>
    </section>

    <section style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Preguntas Frecuentes</h2>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        {faqs.map((f,i)=><div key={i} style={{borderBottom:'1px solid #1e1e2e'}}>
          <button onClick={()=>setOpenFaq(openFaq===i?-1:i)} style={{width:'100%',padding:'1.25rem 0',background:'none',border:'none',color:'#e2e8f0',fontSize:'1rem',fontWeight:600,textAlign:'left',display:'flex',justifyContent:'space-between',cursor:'pointer'}}>
            {f.q}<span style={{color:'#a78bfa'}}>{openFaq===i?'−':'+'}</span>
          </button>
          {openFaq===i && <p style={{color:'#94a3b8',paddingBottom:'1.25rem',fontSize:'0.95rem'}}>{f.a}</p>}
        </div>)}
      </div>
    </section>

    <section style={{padding:'4rem 2rem',textAlign:'center'}}>
      <div style={{background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.1))',border:'1px solid #7c3aed33',borderRadius:20,padding:'3rem',maxWidth:600,margin:'0 auto'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🛡️</div>
        <h3 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:'0.5rem'}}>Garantía de 30 días</h3>
        <p style={{color:'#94a3b8'}}>Si no estás satisfecho, te devolvemos el 100% de tu dinero. Sin preguntas.</p>
      </div>
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Mi Producto. Creado con DOKU AI.</footer>
  </>;
}
`, "Precios - Mi Producto"),
  },
  {
    id: "veterinary",
    name: "Veterinaria",
    keywords: ["veterinaria", "mascotas", "pet", "animales", "perros", "gatos", "vet", "clinica veterinaria", "peluqueria canina", "guarderia", "pets"],
    description: "Sitio web para veterinaria con React y TypeScript",
    planSteps: [
      "Crear navegación con nombre de la clínica",
      "Diseñar hero con servicios para mascotas",
      "Agregar grid de servicios veterinarios",
      "Crear sección de equipo médico",
      "Incluir formulario de citas y emergencias",
    ],
    html: reactWrap(`
const { useState, useEffect, useRef } = React;

// TypeScript interfaces
// interface Service { icon: string; title: string; desc: string; }
// interface TeamMember { icon: string; name: string; role: string; spec: string; }

function useOnScreen(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function App() {
  const [booked, setBooked] = useState(false);
  const ref = useRef(null);
  const visible = useOnScreen(ref);

  const services = [
    { icon:'🩺', title:'Consulta General', desc:'Chequeos completos de salud, vacunación y desparasitación para tu mascota.' },
    { icon:'🦷', title:'Odontología', desc:'Limpieza dental, extracciones y tratamiento de enfermedades bucales.' },
    { icon:'✂️', title:'Cirugía', desc:'Esterilización, cirugía de tejidos blandos y traumatología.' },
    { icon:'🐾', title:'Peluquería', desc:'Baño, corte de pelo, limpieza de oídos y corte de uñas.' },
    { icon:'🏥', title:'Emergencias 24/7', desc:'Atención de urgencias las 24 horas, los 365 días del año.' },
    { icon:'💉', title:'Laboratorio', desc:'Análisis de sangre, orina y diagnóstico por imagen (rayos X, ecografía).' },
  ];

  const team = [
    { icon:'👩‍⚕️', name:'Dra. María García', role:'Directora Médica', spec:'Medicina interna y cirugía' },
    { icon:'👨‍⚕️', name:'Dr. Carlos López', role:'Veterinario', spec:'Dermatología y alergias' },
    { icon:'👩‍⚕️', name:'Dra. Ana Martínez', role:'Veterinaria', spec:'Odontología y pediatría' },
  ];

  const inputStyle = {background:'#0f1820',border:'1px solid #152535',borderRadius:10,padding:'0.85rem 1rem',color:'#cffafe',outline:'none',width:'100%'};

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(6,10,15,0.95)',borderBottom:'1px solid #152535',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#67e8f9'}}>🐾 Mi Veterinaria</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Equipo','Citas'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#60a5b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Emergencias ☎️</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(6,182,212,0.1) 0%,transparent 60%)'}}>
      <span style={{background:'#06b6d422',color:'#67e8f9',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid #06b6d444'}}>🐕 Cuidado profesional para tu mascota</span>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#67e8f9,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',maxWidth:700}}>Tu mascota merece lo mejor</h1>
      <p style={{fontSize:'1.15rem',color:'#60a5b8',maxWidth:550,marginBottom:'2rem'}}>Equipo veterinario certificado con más de 15 años de experiencia. Atención con amor y tecnología de punta.</p>
      <div style={{display:'flex',gap:'1rem'}}>
        <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,boxShadow:'0 4px 15px rgba(6,182,212,0.3)'}}>Agendar Cita →</button>
        <button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #152535',color:'#cffafe',borderRadius:10,fontWeight:600}}>Nuestros Servicios</button>
      </div>
    </section>

    <section ref={ref} id="servicios" style={{padding:'5rem 2rem',background:'#0a1018'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#cffafe'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#0f1820',border:'1px solid #152535',borderRadius:16,padding:'2rem',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:\`all 0.5s ease \${i*100}ms\`}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem',color:'#cffafe'}}>{s.title}</h3>
          <p style={{color:'#60a5b8',fontSize:'0.95rem'}}>{s.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="equipo" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#cffafe'}}>Nuestro Equipo</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        {team.map((t,i)=><div key={i} style={{background:'#0f1820',border:'1px solid #152535',borderRadius:16,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>{t.icon}</div>
          <h3 style={{fontWeight:600,color:'#cffafe'}}>{t.name}</h3>
          <p style={{color:'#06b6d4',fontSize:'0.85rem',marginBottom:'0.5rem'}}>{t.role}</p>
          <p style={{color:'#60a5b8',fontSize:'0.85rem'}}>{t.spec}</p>
        </div>)}
      </div>
    </section>

    <section id="citas" style={{padding:'5rem 2rem',background:'#0a1018',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#cffafe'}}>Agenda tu Cita</h2>
      {booked ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Cita agendada exitosamente! Te contactaremos pronto.</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setBooked(true)}}>
        <input style={inputStyle} placeholder="Tu nombre" required />
        <input style={inputStyle} placeholder="Nombre de tu mascota" required />
        <select style={{...inputStyle,appearance:'auto'}}><option>🐕 Perro</option><option>🐈 Gato</option><option>🐦 Ave</option><option>🐹 Otro</option></select>
        <input style={inputStyle} type="tel" placeholder="Teléfono" required />
        <input style={inputStyle} type="date" required />
        <textarea style={{...inputStyle,resize:'vertical',minHeight:80}} placeholder="¿Motivo de la consulta?" />
        <button type="submit" style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Agendar Cita</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #152535',padding:'2rem',textAlign:'center',color:'#60a5b8',fontSize:'0.85rem'}}>
      <div style={{display:'flex',justifyContent:'center',gap:'2rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        <span>📍 Av. Mascotas 789</span><span>📞 +1 234 567 890</span><span>🚨 Emergencias 24/7</span>
      </div>
      <p>© 2026 Mi Veterinaria. Creado con DOKU AI.</p>
    </footer>
  </>;
}
`, "Mi Veterinaria"),
  },
  // ==================== BILLING ====================
  {
    id: "billing",
    name: "Facturación",
    keywords: ["facturación", "facturacion", "facturas", "invoice", "cobros", "recibos", "billing", "cuentas", "cotización", "notas de venta"],
    description: "Sistema de facturación con React y TypeScript",
    planSteps: [
      "Crear sidebar de navegación con secciones de facturación",
      "Diseñar dashboard con métricas financieras",
      "Crear tabla de facturas con estados y filtros",
      "Agregar formulario de nueva factura",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [page, setPage] = useState('dashboard');
  const navItems = [{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'invoices',icon:'📄',label:'Facturas'},{id:'clients',icon:'👥',label:'Clientes'},{id:'reports',icon:'📈',label:'Reportes'}];
  const invoices = [
    {num:'F-001',client:'Ana García',date:'2026-02-15',status:'Pagada',total:'$1,250'},
    {num:'F-002',client:'Carlos López',date:'2026-02-18',status:'Pendiente',total:'$3,450'},
    {num:'F-003',client:'María R.',date:'2026-02-20',status:'Vencida',total:'$890'},
    {num:'F-004',client:'Juan Martínez',date:'2026-02-22',status:'Pagada',total:'$2,100'},
  ];
  const statusColor = s => s==='Pagada'?'#34d399':s==='Pendiente'?'#fbbf24':'#f87171';

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <div style={{width:220,background:'#0a0a14',borderRight:'1px solid #1a1a2e',padding:'1.5rem 1rem',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
      <h2 style={{color:'#818cf8',fontSize:'1.1rem',fontWeight:700,marginBottom:'1.5rem',padding:'0 0.5rem'}}>💰 Mi Facturación</h2>
      {navItems.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{background:page===n.id?'#6366f122':'transparent',color:page===n.id?'#818cf8':'#64748b',border:'none',padding:'0.7rem 0.8rem',borderRadius:10,textAlign:'left',fontSize:'0.88rem',transition:'all 0.2s'}}>{n.icon} {n.label}</button>)}
    </div>
    <div style={{flex:1,padding:'2rem',overflowY:'auto'}}>
      {page==='dashboard' && <>
        <h1 style={{fontSize:'1.75rem',fontWeight:700,marginBottom:'1.5rem'}}>Dashboard</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          {[{label:'Ingresos Mes',value:'$12,450',change:'+15%',up:true},{label:'Facturas Emitidas',value:'28',change:'+5',up:true},{label:'Por Cobrar',value:'$4,340',change:'-8%',up:false},{label:'Clientes Activos',value:'42',change:'+3',up:true}].map((m,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,padding:'1.5rem'}}>
            <div style={{color:'#64748b',fontSize:'0.8rem',marginBottom:'0.5rem'}}>{m.label}</div>
            <div style={{fontSize:'1.8rem',fontWeight:700}}>{m.value}</div>
            <div style={{fontSize:'0.8rem',color:m.up?'#34d399':'#f87171',marginTop:'0.3rem'}}>{m.up?'↑':'↓'} {m.change}</div>
          </div>)}
        </div>
        <div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem'}}>Últimas Facturas</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Nº','Cliente','Fecha','Estado','Total'].map(h=><th key={h} style={{textAlign:'left',padding:'0.7rem 1rem',color:'#64748b',fontSize:'0.78rem',textTransform:'uppercase',borderBottom:'1px solid #1e1e2e'}}>{h}</th>)}</tr></thead>
            <tbody>{invoices.map((inv,i)=><tr key={i} style={{borderBottom:'1px solid #1e1e2e'}}><td style={{padding:'0.7rem 1rem',fontWeight:600}}>{inv.num}</td><td style={{padding:'0.7rem 1rem'}}>{inv.client}</td><td style={{padding:'0.7rem 1rem',color:'#94a3b8'}}>{inv.date}</td><td style={{padding:'0.7rem 1rem'}}><span style={{padding:'0.2rem 0.6rem',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:statusColor(inv.status)+'22',color:statusColor(inv.status)}}>{inv.status}</span></td><td style={{padding:'0.7rem 1rem',fontWeight:600,color:'#818cf8'}}>{inv.total}</td></tr>)}</tbody>
          </table>
        </div>
      </>}
      {page==='invoices' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}><h1 style={{fontSize:'1.75rem',fontWeight:700}}>Facturas</h1><button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#818cf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>+ Nueva Factura</button></div>
        <div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,overflow:'hidden'}}>
          <table data-crud-table="invoices" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Nº','Cliente','Fecha','Estado','Total'].map(h=><th key={h} style={{textAlign:'left',padding:'0.8rem 1.2rem',color:'#64748b',fontSize:'0.78rem',textTransform:'uppercase',background:'#0a0a14'}}>{h}</th>)}</tr></thead>
            <tbody>{invoices.map((inv,i)=><tr key={i} style={{borderBottom:'1px solid #1e1e2e'}}><td style={{padding:'0.8rem 1.2rem',fontWeight:600}}>{inv.num}</td><td style={{padding:'0.8rem 1.2rem'}}>{inv.client}</td><td style={{padding:'0.8rem 1.2rem',color:'#94a3b8'}}>{inv.date}</td><td style={{padding:'0.8rem 1.2rem'}}><span style={{padding:'0.2rem 0.6rem',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:statusColor(inv.status)+'22',color:statusColor(inv.status)}}>{inv.status}</span></td><td style={{padding:'0.8rem 1.2rem',fontWeight:600,color:'#818cf8'}}>{inv.total}</td></tr>)}</tbody>
          </table>
        </div>
      </>}
      {page==='clients' && <><h1 style={{fontSize:'1.75rem',fontWeight:700,marginBottom:'1.5rem'}}>Clientes</h1><div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,padding:'2rem',color:'#64748b'}}>Tabla de clientes conectada a la BD</div></>}
      {page==='reports' && <><h1 style={{fontSize:'1.75rem',fontWeight:700,marginBottom:'1.5rem'}}>Reportes</h1><div style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,padding:'2rem',height:300,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>📈 Gráficos de ingresos y gastos</div></>}
    </div>
  </div>;
}
`, "Mi Facturación"),
  },
  // ==================== INVENTORY ====================
  {
    id: "inventory",
    name: "Inventario",
    keywords: ["inventario", "almacén", "almacen", "bodega", "stock", "existencias", "warehouse", "control de inventario"],
    description: "Sistema de control de inventario con React y TypeScript",
    planSteps: [
      "Crear sidebar de navegación",
      "Diseñar dashboard con alertas de stock",
      "Crear tabla de productos con stock actual",
      "Agregar registro de movimientos",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [page, setPage] = useState('dashboard');
  const products = [
    {name:'Laptop Pro 15',sku:'LP-001',cat:'Electrónica',stock:45,min:10,price:'$1,299'},
    {name:'Mouse Wireless',sku:'MW-023',cat:'Accesorios',stock:8,min:20,price:'$29.99'},
    {name:'Teclado Mecánico',sku:'TM-045',cat:'Accesorios',stock:120,min:15,price:'$89.99'},
    {name:'Monitor 27"',sku:'MN-012',cat:'Electrónica',stock:3,min:5,price:'$449'},
    {name:'Cable USB-C',sku:'CU-089',cat:'Cables',stock:230,min:50,price:'$12.99'},
  ];
  const alerts = products.filter(p=>p.stock <= p.min);

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <div style={{width:220,background:'#060f0a',borderRight:'1px solid #153025',padding:'1.5rem 1rem',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
      <h2 style={{color:'#34d399',fontSize:'1.1rem',fontWeight:700,marginBottom:'1.5rem',padding:'0 0.5rem'}}>📦 Mi Inventario</h2>
      {[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'products',icon:'📦',label:'Productos'},{id:'movements',icon:'🔄',label:'Movimientos'},{id:'alerts',icon:'⚠️',label:'Alertas'}].map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{background:page===n.id?'#059669 22':'transparent',color:page===n.id?'#34d399':'#6aab8a',border:'none',padding:'0.7rem 0.8rem',borderRadius:10,textAlign:'left',fontSize:'0.88rem'}}>{n.icon} {n.label}{n.id==='alerts'&&alerts.length>0?<span style={{marginLeft:'0.5rem',background:'#ef444444',color:'#f87171',padding:'0.1rem 0.5rem',borderRadius:99,fontSize:'0.7rem'}}>{alerts.length}</span>:null}</button>)}
    </div>
    <div style={{flex:1,padding:'2rem',overflowY:'auto',background:'#060f0a'}}>
      <h1 style={{fontSize:'1.75rem',fontWeight:700,marginBottom:'1.5rem',color:'#d1fae5'}}>{page==='dashboard'?'Dashboard':page==='products'?'Productos':page==='movements'?'Movimientos':'Alertas de Stock'}</h1>
      {page==='dashboard' && <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {[{label:'Total Productos',value:'5',icon:'📦'},{label:'Stock Total',value:'406',icon:'📊'},{label:'Alertas',value:String(alerts.length),icon:'⚠️'},{label:'Valor Total',value:'$82,400',icon:'💰'}].map((m,i)=><div key={i} style={{background:'#0f1f15',border:'1px solid #153025',borderRadius:14,padding:'1.5rem'}}>
          <div style={{color:'#6aab8a',fontSize:'0.8rem',marginBottom:'0.5rem'}}>{m.icon} {m.label}</div>
          <div style={{fontSize:'1.8rem',fontWeight:700,color:'#d1fae5'}}>{m.value}</div>
        </div>)}
      </div>}
      <div style={{background:'#0f1f15',border:'1px solid #153025',borderRadius:14,overflow:'hidden'}}>
        <table data-crud-table="products" style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Producto','SKU','Categoría','Stock','Mínimo','Precio'].map(h=><th key={h} style={{textAlign:'left',padding:'0.8rem 1.2rem',color:'#6aab8a',fontSize:'0.78rem',textTransform:'uppercase',background:'#0a1510'}}>{h}</th>)}</tr></thead>
          <tbody>{products.map((p,i)=><tr key={i} style={{borderBottom:'1px solid #153025'}}><td style={{padding:'0.8rem 1.2rem',fontWeight:500,color:'#d1fae5'}}>{p.name}</td><td style={{padding:'0.8rem 1.2rem',color:'#6aab8a',fontFamily:'monospace'}}>{p.sku}</td><td style={{padding:'0.8rem 1.2rem',color:'#6aab8a'}}>{p.cat}</td><td style={{padding:'0.8rem 1.2rem'}}><span style={{color:p.stock<=p.min?'#f87171':'#34d399',fontWeight:600}}>{p.stock}</span></td><td style={{padding:'0.8rem 1.2rem',color:'#6aab8a'}}>{p.min}</td><td style={{padding:'0.8rem 1.2rem',fontWeight:600,color:'#34d399'}}>{p.price}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}
`, "Mi Inventario"),
  },
  // ==================== CRM ====================
  {
    id: "crm",
    name: "CRM",
    keywords: ["crm", "clientes", "prospectos", "leads", "contactos", "pipeline", "seguimiento", "gestión de clientes"],
    description: "CRM de gestión de clientes con React y TypeScript",
    planSteps: [
      "Crear sidebar con secciones CRM",
      "Diseñar pipeline visual de deals",
      "Crear tabla de contactos con búsqueda",
      "Agregar métricas de ventas",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [page, setPage] = useState('pipeline');
  const stages = [
    {name:'Prospecto',color:'#60a5fa',deals:[{title:'Proyecto Web',company:'TechCo',value:'$5,000'},{title:'App Móvil',company:'StartApp',value:'$12,000'}]},
    {name:'Propuesta',color:'#a78bfa',deals:[{title:'E-commerce',company:'ShopMax',value:'$8,500'}]},
    {name:'Negociación',color:'#fbbf24',deals:[{title:'Dashboard',company:'DataCorp',value:'$15,000'}]},
    {name:'Cerrado',color:'#34d399',deals:[{title:'Landing Page',company:'BrandX',value:'$3,000'},{title:'Rediseño Web',company:'OldSite',value:'$7,200'}]},
  ];

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <div style={{width:220,background:'#0a0a14',borderRight:'1px solid #1a1a30',padding:'1.5rem 1rem',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
      <h2 style={{color:'#a78bfa',fontSize:'1.1rem',fontWeight:700,marginBottom:'1.5rem',padding:'0 0.5rem'}}>🎯 Mi CRM</h2>
      {[{id:'pipeline',icon:'🔄',label:'Pipeline'},{id:'contacts',icon:'👥',label:'Contactos'},{id:'deals',icon:'💰',label:'Deals'},{id:'reports',icon:'📈',label:'Reportes'}].map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{background:page===n.id?'#7c3aed22':'transparent',color:page===n.id?'#a78bfa':'#64748b',border:'none',padding:'0.7rem 0.8rem',borderRadius:10,textAlign:'left',fontSize:'0.88rem'}}>{n.icon} {n.label}</button>)}
    </div>
    <div style={{flex:1,padding:'2rem',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.75rem',fontWeight:700}}>Pipeline de Ventas</h1>
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#7c3aed,#a78bfa)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>+ Nuevo Deal</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {stages.map((stage,si)=><div key={si}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}><div style={{width:10,height:10,borderRadius:'50%',background:stage.color}}></div><span style={{fontWeight:600,fontSize:'0.9rem'}}>{stage.name}</span><span style={{color:'#64748b',fontSize:'0.8rem'}}>({stage.deals.length})</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {stage.deals.map((d,di)=><div key={di} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:12,padding:'1rem',borderLeft:\`3px solid \${stage.color}\`}}>
              <h4 style={{fontSize:'0.9rem',fontWeight:600,marginBottom:'0.3rem'}}>{d.title}</h4>
              <p style={{color:'#64748b',fontSize:'0.8rem'}}>{d.company}</p>
              <p style={{color:'#a78bfa',fontWeight:700,fontSize:'0.95rem',marginTop:'0.5rem'}}>{d.value}</p>
            </div>)}
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}
`, "Mi CRM"),
  },
  // ==================== POS ====================
  {
    id: "pos",
    name: "Punto de Venta",
    keywords: ["punto de venta", "pos", "caja registradora", "terminal", "ventas", "ticket", "caja"],
    description: "Punto de venta con React y TypeScript",
    planSteps: [
      "Crear layout de POS con catálogo y carrito",
      "Diseñar grid de productos con categorías",
      "Implementar carrito funcional con totales",
      "Agregar área de pago y ticket",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState('all');
  const products = [
    {name:'Café Americano',price:3.50,cat:'bebidas',icon:'☕'},{name:'Cappuccino',price:4.50,cat:'bebidas',icon:'☕'},
    {name:'Sandwich Club',price:7.90,cat:'comida',icon:'🥪'},{name:'Ensalada César',price:8.50,cat:'comida',icon:'🥗'},
    {name:'Croissant',price:3.20,cat:'panadería',icon:'🥐'},{name:'Muffin Chocolate',price:3.80,cat:'panadería',icon:'🧁'},
    {name:'Jugo Natural',price:4.00,cat:'bebidas',icon:'🧃'},{name:'Bagel',price:5.50,cat:'panadería',icon:'🥯'},
  ];
  const filtered = cat==='all'?products:products.filter(p=>p.cat===cat);
  const addToCart = (p) => {const existing = cart.find(c=>c.name===p.name); if(existing){setCart(cart.map(c=>c.name===p.name?{...c,qty:c.qty+1}:c))}else{setCart([...cart,{...p,qty:1}])}};
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <div style={{flex:1,padding:'1.5rem',background:'#0a0a14'}}>
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {[['all','Todos'],['bebidas','Bebidas'],['comida','Comida'],['panadería','Panadería']].map(([k,l])=><button key={k} onClick={()=>setCat(k)} style={{padding:'0.5rem 1rem',borderRadius:10,border:'none',background:cat===k?'linear-gradient(135deg,#7c3aed,#6366f1)':'#12121a',color:cat===k?'#fff':'#94a3b8',fontSize:'0.85rem',fontWeight:500}}>{l}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'1rem'}}>
        {filtered.map((p,i)=><button key={i} onClick={()=>addToCart(p)} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:14,padding:'1.5rem 1rem',textAlign:'center',cursor:'pointer',transition:'all 0.2s',color:'#e2e8f0'}} onMouseOver={e=>e.currentTarget.style.borderColor='#7c3aed'} onMouseOut={e=>e.currentTarget.style.borderColor='#1e1e2e'}>
          <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>{p.icon}</div>
          <div style={{fontSize:'0.85rem',fontWeight:500}}>{p.name}</div>
          <div style={{color:'#a78bfa',fontWeight:700,marginTop:'0.3rem'}}>${p.price.toFixed(2)}</div>
        </button>)}
      </div>
    </div>
    <div style={{width:350,background:'#0e0e18',borderLeft:'1px solid #1e1e2e',padding:'1.5rem',display:'flex',flexDirection:'column'}}>
      <h2 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'1rem',color:'#a78bfa'}}>🧾 Ticket</h2>
      <div style={{flex:1,overflowY:'auto'}}>
        {cart.length===0?<p style={{color:'#64748b',textAlign:'center',marginTop:'2rem'}}>Carrito vacío</p>:
        cart.map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid #1e1e2e'}}>
          <div><span style={{fontSize:'0.9rem'}}>{c.name}</span><span style={{color:'#64748b',fontSize:'0.8rem',marginLeft:'0.5rem'}}>x{c.qty}</span></div>
          <span style={{fontWeight:600,color:'#a78bfa'}}>${(c.price*c.qty).toFixed(2)}</span>
        </div>)}
      </div>
      <div style={{borderTop:'2px solid #1e1e2e',paddingTop:'1rem',marginTop:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'1.2rem',fontWeight:700,marginBottom:'1rem'}}><span>Total</span><span style={{color:'#a78bfa'}}>${total.toFixed(2)}</span></div>
        <button onClick={()=>{if(cart.length>0){alert('¡Venta procesada!');setCart([])}}} style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem'}}>💳 Cobrar</button>
      </div>
    </div>
  </div>;
}
`, "Mi Punto de Venta"),
  },
  // ==================== BOOKING ====================
  {
    id: "booking",
    name: "Reservas / Citas",
    keywords: ["reservas", "citas", "agenda", "turnos", "booking", "appointments", "agendar", "programar", "calendario"],
    description: "Sistema de reservas y citas con React y TypeScript",
    planSteps: [
      "Crear layout con servicios disponibles",
      "Diseñar calendario visual de disponibilidad",
      "Crear formulario de reserva con validación",
      "Agregar confirmación de cita",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const services = [
    {name:'Consulta General',duration:'30 min',price:'$50',icon:'📋'},
    {name:'Evaluación Completa',duration:'60 min',price:'$120',icon:'🔍'},
    {name:'Sesión de Seguimiento',duration:'45 min',price:'$80',icon:'🔄'},
    {name:'Consulta Premium',duration:'90 min',price:'$200',icon:'⭐'},
  ];
  const times = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

  return <div style={{minHeight:'100vh',background:'#0f0a05'}}>
    <nav style={{padding:'1rem 2rem',borderBottom:'1px solid #302010',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#f59e0b'}}>📅 Mis Reservas</div>
      <div style={{color:'#b8a078',fontSize:'0.9rem'}}>Paso {step} de 3</div>
    </nav>
    <div style={{maxWidth:800,margin:'3rem auto',padding:'0 2rem'}}>
      <div style={{display:'flex',gap:'1rem',marginBottom:'2rem'}}>
        {[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?'linear-gradient(135deg,#d97706,#f59e0b)':'#302010'}}/>)}
      </div>

      {step===1 && <>
        <h2 style={{fontSize:'1.8rem',fontWeight:700,marginBottom:'1rem',color:'#fef3c7'}}>Elige un servicio</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
          {services.map((s,i)=><button key={i} onClick={()=>{setSelected(s);setStep(2)}} style={{background:selected?.name===s.name?'#d9770622':'#1c1610',border:\`1px solid \${selected?.name===s.name?'#d97706':'#302010'}\`,borderRadius:14,padding:'1.5rem',textAlign:'left',cursor:'pointer',color:'#fef3c7',transition:'all 0.2s'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>{s.icon}</div>
            <h3 style={{fontWeight:600,marginBottom:'0.3rem'}}>{s.name}</h3>
            <p style={{color:'#b8a078',fontSize:'0.85rem'}}>{s.duration}</p>
            <p style={{color:'#f59e0b',fontWeight:700,marginTop:'0.5rem'}}>{s.price}</p>
          </button>)}
        </div>
      </>}

      {step===2 && <>
        <h2 style={{fontSize:'1.8rem',fontWeight:700,marginBottom:'1rem',color:'#fef3c7'}}>Selecciona fecha y hora</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
          <div><label style={{color:'#b8a078',fontSize:'0.85rem',display:'block',marginBottom:'0.5rem'}}>Fecha</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',padding:'0.8rem',background:'#1c1610',border:'1px solid #302010',borderRadius:10,color:'#fef3c7'}}/></div>
          <div><label style={{color:'#b8a078',fontSize:'0.85rem',display:'block',marginBottom:'0.5rem'}}>Hora</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem'}}>{times.map(t=><button key={t} onClick={()=>setTime(t)} style={{padding:'0.6rem',borderRadius:8,border:'none',background:time===t?'#d97706':'#1c1610',color:time===t?'#fff':'#b8a078',fontSize:'0.85rem',cursor:'pointer'}}>{t}</button>)}</div></div>
        </div>
        <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
          <button onClick={()=>setStep(1)} style={{padding:'0.8rem 1.5rem',background:'transparent',border:'1px solid #302010',borderRadius:10,color:'#b8a078',fontSize:'0.9rem'}}>← Atrás</button>
          <button onClick={()=>{if(date&&time)setStep(3)}} style={{padding:'0.8rem 1.5rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.9rem'}}>Confirmar →</button>
        </div>
      </>}

      {step===3 && <div style={{textAlign:'center',padding:'3rem'}}>
        <div style={{fontSize:'4rem',marginBottom:'1rem'}}>✅</div>
        <h2 style={{fontSize:'1.8rem',fontWeight:700,marginBottom:'0.5rem',color:'#fef3c7'}}>¡Reserva Confirmada!</h2>
        <p style={{color:'#b8a078',marginBottom:'2rem'}}>{selected?.name} · {date} a las {time}</p>
        <button onClick={()=>{setStep(1);setSelected(null);setDate('');setTime('')}} style={{padding:'0.8rem 2rem',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Nueva Reserva</button>
      </div>}
    </div>
  </div>;
}
`, "Mis Reservas"),
  },
  // ==================== HOTEL ====================
  {
    id: "hotel",
    name: "Hotel / Hospedaje",
    keywords: ["hotel", "hospedaje", "alojamiento", "airbnb", "hostal", "resort", "posada", "cabaña", "habitaciones"],
    description: "Página de hotel con React y TypeScript",
    planSteps: [
      "Crear navegación elegante con nombre del hotel",
      "Diseñar hero con imagen de fondo",
      "Crear sección de habitaciones con precios",
      "Agregar formulario de reservación",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [booked, setBooked] = useState(false);
  const rooms = [
    {name:'Suite Ejecutiva',price:'$180',desc:'Cama king, vista ciudad, minibar, WiFi premium.',icon:'🏨',capacity:'2 adultos'},
    {name:'Suite Premium',price:'$320',desc:'Sala independiente, jacuzzi, terraza con vista al mar.',icon:'⭐',capacity:'2 adultos + 1 niño'},
    {name:'Habitación Doble',price:'$120',desc:'Dos camas dobles, baño completo, TV 55".',icon:'🛏️',capacity:'4 adultos'},
    {name:'Suite Presidencial',price:'$580',desc:'2 habitaciones, sala, comedor, servicio de butler.',icon:'👑',capacity:'4 adultos'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(12,10,6,0.95)',borderBottom:'1px solid #28220e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',fontWeight:700,color:'#ca8a04'}}>🏨 Mi Hotel</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Habitaciones','Amenidades','Reservar'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#b8a060',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#a16207,#ca8a04)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Reservar</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 30%,rgba(161,98,7,0.1) 0%,transparent 60%)'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2.5rem,5vw,4rem)',marginBottom:'1rem',background:'linear-gradient(135deg,#a16207,#ca8a04)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Hospitalidad de Primera Clase</h1>
      <p style={{fontSize:'1.15rem',color:'#b8a060',maxWidth:600,marginBottom:'2rem'}}>Disfruta de una estancia inolvidable con servicio excepcional, habitaciones de lujo y una ubicación privilegiada.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#a16207,#ca8a04)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Ver Habitaciones →</button>
    </section>

    <section id="habitaciones" style={{padding:'5rem 2rem'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",textAlign:'center',fontSize:'2rem',marginBottom:'3rem',color:'#fef9c3'}}>Nuestras Habitaciones</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {rooms.map((r,i)=><div key={i} style={{background:'#1a1710',border:'1px solid #28220e',borderRadius:16,overflow:'hidden',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#a16207'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#28220e'}}>
          <div style={{height:140,background:'linear-gradient(135deg,#11100a,#1a1710)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>{r.icon}</div>
          <div style={{padding:'1.5rem'}}>
            <h3 style={{fontWeight:600,marginBottom:'0.3rem',color:'#fef9c3'}}>{r.name}</h3>
            <p style={{color:'#b8a060',fontSize:'0.85rem',marginBottom:'0.5rem'}}>{r.desc}</p>
            <p style={{color:'#b8a060',fontSize:'0.8rem',marginBottom:'0.75rem'}}>👥 {r.capacity}</p>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#ca8a04',fontWeight:700,fontSize:'1.2rem'}}>{r.price}<span style={{fontSize:'0.8rem',fontWeight:400}}>/noche</span></span>
              <button style={{padding:'0.5rem 1rem',background:'linear-gradient(135deg,#a16207,#ca8a04)',color:'#fff',border:'none',borderRadius:8,fontSize:'0.8rem',fontWeight:600}}>Reservar</button>
            </div>
          </div>
        </div>)}
      </div>
    </section>

    <section id="reservar" style={{padding:'5rem 2rem',background:'#11100a',textAlign:'center'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',marginBottom:'2rem',color:'#fef9c3'}}>Reserva tu Estancia</h2>
      {booked ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Reservación confirmada!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setBooked(true)}}>
        <input style={{background:'#1a1710',border:'1px solid #28220e',borderRadius:10,padding:'0.85rem 1rem',color:'#fef9c3',outline:'none'}} placeholder="Nombre completo" required />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <input type="date" style={{background:'#1a1710',border:'1px solid #28220e',borderRadius:10,padding:'0.85rem 1rem',color:'#fef9c3',outline:'none'}} required />
          <input type="date" style={{background:'#1a1710',border:'1px solid #28220e',borderRadius:10,padding:'0.85rem 1rem',color:'#fef9c3',outline:'none'}} required />
        </div>
        <select style={{background:'#1a1710',border:'1px solid #28220e',borderRadius:10,padding:'0.85rem 1rem',color:'#fef9c3',appearance:'auto'}}><option>Suite Ejecutiva</option><option>Suite Premium</option><option>Habitación Doble</option><option>Suite Presidencial</option></select>
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#a16207,#ca8a04)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Confirmar Reserva</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #28220e',padding:'2rem',textAlign:'center',color:'#b8a060',fontSize:'0.85rem'}}>© 2026 Mi Hotel. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Hotel"),
  },
  // ==================== LAWYER ====================
  {
    id: "lawyer",
    name: "Abogado / Legal",
    keywords: ["abogado", "legal", "derecho", "bufete", "jurídico", "juridico", "notaría", "leyes", "litigio"],
    description: "Sitio web para bufete legal con React y TypeScript",
    planSteps: [
      "Crear navegación profesional legal",
      "Diseñar hero con propuesta de valor",
      "Crear sección de áreas de práctica",
      "Agregar formulario de consulta",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [sent, setSent] = useState(false);
  const areas = [
    {icon:'⚖️',title:'Derecho Civil',desc:'Contratos, herencias, divorcios y litigios civiles con experiencia comprobada.'},
    {icon:'🏢',title:'Derecho Corporativo',desc:'Constitución de empresas, fusiones, adquisiciones y asesoría mercantil.'},
    {icon:'📜',title:'Derecho Penal',desc:'Defensa penal especializada con enfoque estratégico y confidencial.'},
    {icon:'🏠',title:'Derecho Inmobiliario',desc:'Compraventa de inmuebles, escrituración y asesoría registral.'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(9,9,11,0.95)',borderBottom:'1px solid #222230',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#c4b5fd'}}>⚖️ Mi Bufete Legal</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Equipo','Consulta'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#6b6b7a',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Consulta Gratis</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.08) 0%,transparent 60%)'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Justicia, Confianza y Resultados</h1>
      <p style={{fontSize:'1.15rem',color:'#6b6b7a',maxWidth:600,marginBottom:'2rem'}}>Más de 15 años defendiendo tus derechos con profesionalismo, ética y compromiso.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Consulta Gratuita →</button>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#e8e8ed'}}>Áreas de Práctica</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {areas.map((a,i)=><div key={i} style={{background:'#121216',border:'1px solid #222230',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#222230';e.currentTarget.style.transform=''}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{a.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem',color:'#e8e8ed'}}>{a.title}</h3>
          <p style={{color:'#6b6b7a',fontSize:'0.95rem'}}>{a.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="consulta" style={{padding:'5rem 2rem',background:'#0d0d10',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#e8e8ed'}}>Consulta Gratuita</h2>
      {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Consulta enviada! Te contactaremos pronto.</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
        <input style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',outline:'none'}} placeholder="Tu nombre" required />
        <input type="email" style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',outline:'none'}} placeholder="tu@email.com" required />
        <textarea style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',outline:'none',resize:'vertical',minHeight:100}} placeholder="Describe tu caso..." required />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Enviar Consulta</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #222230',padding:'2rem',textAlign:'center',color:'#6b6b7a',fontSize:'0.85rem'}}>© 2026 Mi Bufete Legal. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Bufete Legal"),
  },
  // ==================== ACCOUNTING ====================
  {
    id: "accounting",
    name: "Contabilidad",
    keywords: ["contador", "contabilidad", "impuestos", "fiscal", "auditor", "contable", "nómina", "tributario", "despacho contable"],
    description: "Sitio web para despacho contable con React y TypeScript",
    planSteps: [
      "Crear navegación profesional contable",
      "Diseñar hero con servicios fiscales",
      "Crear sección de servicios contables",
      "Agregar formulario de cotización",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [sent, setSent] = useState(false);
  const services = [
    {icon:'📊',title:'Contabilidad General',desc:'Registro y análisis de operaciones financieras.'},
    {icon:'💰',title:'Declaración de Impuestos',desc:'Cumplimiento fiscal optimizado.'},
    {icon:'📋',title:'Auditoría Financiera',desc:'Revisión de estados financieros.'},
    {icon:'👥',title:'Nóminas',desc:'Cálculo y administración de nóminas.'},
    {icon:'📈',title:'Consultoría Fiscal',desc:'Estrategias para optimizar tu carga fiscal.'},
    {icon:'🏢',title:'Constitución de Empresas',desc:'Asesoría en la creación de sociedades.'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(6,6,15,0.95)',borderBottom:'1px solid #1a1a35',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#818cf8'}}>📊 Mi Contaduría</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Nosotros','Cotizar'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#7580b5',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#818cf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Cotizar</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#6366f1,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Precisión Financiera para tu Negocio</h1>
      <p style={{fontSize:'1.15rem',color:'#7580b5',maxWidth:600,marginBottom:'2rem'}}>Servicios contables y fiscales de excelencia. Tu tranquilidad financiera es nuestra especialidad.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#6366f1,#818cf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Solicitar Cotización →</button>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem',background:'#0a0a16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#e0e7ff'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#12121f',border:'1px solid #1a1a35',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1a1a35';e.currentTarget.style.transform=''}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem',color:'#e0e7ff'}}>{s.title}</h3>
          <p style={{color:'#7580b5',fontSize:'0.95rem'}}>{s.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="cotizar" style={{padding:'5rem 2rem',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#e0e7ff'}}>Solicita una Cotización</h2>
      {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Cotización solicitada! Te contactaremos pronto.</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
        <input style={{background:'#12121f',border:'1px solid #1a1a35',borderRadius:10,padding:'0.85rem 1rem',color:'#e0e7ff',outline:'none'}} placeholder="Nombre o empresa" required />
        <input type="email" style={{background:'#12121f',border:'1px solid #1a1a35',borderRadius:10,padding:'0.85rem 1rem',color:'#e0e7ff',outline:'none'}} placeholder="tu@email.com" required />
        <select style={{background:'#12121f',border:'1px solid #1a1a35',borderRadius:10,padding:'0.85rem 1rem',color:'#e0e7ff',appearance:'auto'}}><option>Contabilidad General</option><option>Declaración de Impuestos</option><option>Auditoría</option><option>Nóminas</option><option>Consultoría Fiscal</option></select>
        <textarea style={{background:'#12121f',border:'1px solid #1a1a35',borderRadius:10,padding:'0.85rem 1rem',color:'#e0e7ff',outline:'none',resize:'vertical',minHeight:80}} placeholder="Cuéntanos sobre tu negocio..." />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#6366f1,#818cf8)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Solicitar Cotización</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #1a1a35',padding:'2rem',textAlign:'center',color:'#7580b5',fontSize:'0.85rem'}}>© 2026 Mi Contaduría. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Contaduría"),
  },
  // ==================== PHOTOGRAPHY ====================
  {
    id: "photography",
    name: "Fotografía",
    keywords: ["fotógrafo", "fotografo", "fotos", "fotografía", "fotografia", "sesión fotográfica", "cámara", "retrato", "boda"],
    description: "Sitio web para estudio fotográfico con React y TypeScript",
    planSteps: [
      "Crear navegación con estilo artístico",
      "Diseñar hero con imagen de fondo",
      "Crear galería masonry de trabajos",
      "Agregar paquetes y formulario de contacto",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [filter, setFilter] = useState('all');
  const [sent, setSent] = useState(false);
  const gallery = [
    {cat:'bodas',h:300},{cat:'retratos',h:200},{cat:'eventos',h:250},{cat:'bodas',h:220},{cat:'retratos',h:280},{cat:'eventos',h:200},{cat:'bodas',h:240},{cat:'retratos',h:300},
  ];
  const filtered = filter==='all'?gallery:gallery.filter(g=>g.cat===filter);

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(9,9,11,0.95)',borderBottom:'1px solid #222230',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',fontWeight:700,color:'#c4b5fd'}}>📸 Mi Estudio</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Galería','Paquetes','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}\`} style={{color:'#6b6b7a',fontSize:'0.9rem'}}>{l}</a>)}
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2.5rem,5vw,4rem)',marginBottom:'1rem',background:'linear-gradient(135deg,#a78bfa,#c4b5fd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Capturamos Momentos Únicos</h1>
      <p style={{fontSize:'1.15rem',color:'#6b6b7a',maxWidth:600,marginBottom:'2rem'}}>Fotografía profesional con pasión, creatividad y un ojo experto para el detalle.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Ver Portfolio →</button>
    </section>

    <section id="galeria" style={{padding:'5rem 2rem'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'1rem',color:'#e8e8ed'}}>Portfolio</h2>
      <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'2rem'}}>
        {[['all','Todos'],['bodas','Bodas'],['retratos','Retratos'],['eventos','Eventos']].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} style={{padding:'0.5rem 1.2rem',borderRadius:99,border:'none',background:filter===k?'linear-gradient(135deg,#a78bfa,#8b5cf6)':'#121216',color:filter===k?'#fff':'#6b6b7a',fontSize:'0.85rem',fontWeight:500}}>{l}</button>)}
      </div>
      <div style={{columns:'3',columnGap:'1rem',maxWidth:1100,margin:'0 auto'}}>
        {filtered.map((g,i)=><div key={i} style={{breakInside:'avoid',marginBottom:'1rem',borderRadius:12,overflow:'hidden',background:'#121216',border:'1px solid #222230'}}>
          <div style={{height:g.h,background:\`linear-gradient(\${135+i*15}deg,#1a1a2e,#222244)\`,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b6b7a',fontSize:'0.85rem'}}>📷 Foto {i+1}</div>
        </div>)}
      </div>
    </section>

    <section id="contacto" style={{padding:'5rem 2rem',background:'#0d0d10',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#e8e8ed'}}>Reserva tu Sesión</h2>
      {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Solicitud enviada!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
        <input style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',outline:'none'}} placeholder="Tu nombre" required />
        <input type="email" style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',outline:'none'}} placeholder="tu@email.com" required />
        <select style={{background:'#121216',border:'1px solid #222230',borderRadius:10,padding:'0.85rem 1rem',color:'#e8e8ed',appearance:'auto'}}><option>Boda</option><option>Retrato</option><option>Evento</option><option>Producto</option></select>
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#a78bfa,#8b5cf6)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Solicitar Sesión</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #222230',padding:'2rem',textAlign:'center',color:'#6b6b7a',fontSize:'0.85rem'}}>© 2026 Mi Estudio Fotográfico. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Estudio Fotográfico"),
  },
  // ==================== MUSIC ====================
  {
    id: "music",
    name: "Música / Producción",
    keywords: ["músico", "musico", "banda", "dj", "grabación", "grabacion", "música", "musica", "cantante", "productor", "estudio musical"],
    description: "Sitio web para estudio musical con React y TypeScript",
    planSteps: [
      "Crear navegación con estilo musical",
      "Diseñar hero con ambiente de estudio",
      "Crear sección de servicios de producción",
      "Agregar formulario de contacto",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [sent, setSent] = useState(false);
  const services = [
    {icon:'🎙️',title:'Grabación',desc:'Estudio profesional con acústica tratada y equipamiento de primera línea.'},
    {icon:'🎛️',title:'Mezcla & Master',desc:'Procesamiento de audio profesional para un sonido competitivo.'},
    {icon:'🎵',title:'Producción Musical',desc:'Composición, arreglos y producción completa de tus canciones.'},
    {icon:'🎧',title:'Podcast & Voz',desc:'Grabación y edición profesional de podcasts y voiceovers.'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(10,10,15,0.95)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#a78bfa'}}>🎵 Mi Estudio Musical</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Portfolio','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#94a3b8',fontSize:'0.9rem'}}>{l}</a>)}
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.1) 0%,transparent 60%)'}}>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#a78bfa,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Tu Música Suena Profesional</h1>
      <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Producción musical de alto nivel. Grabación, mezcla y masterización con pasión por el sonido perfecto.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Escuchar Demo →</button>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem'}}>Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1e1e2e';e.currentTarget.style.transform=''}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{s.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem'}}>{s.title}</h3>
          <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{s.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="contacto" style={{padding:'5rem 2rem',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem'}}>Contáctanos</h2>
      {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Mensaje enviado!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
        <input style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Tu nombre" required />
        <input type="email" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="tu@email.com" required />
        <textarea style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none',resize:'vertical',minHeight:100}} placeholder="Cuéntanos sobre tu proyecto musical..." required />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Enviar</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 Mi Estudio Musical. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Estudio Musical"),
  },
  // ==================== SALON ====================
  {
    id: "salon",
    name: "Salón de Belleza",
    keywords: ["salón", "salon", "peluquería", "peluqueria", "barbería", "barberia", "spa", "estética", "estetica", "belleza", "cabello", "uñas", "maquillaje"],
    description: "Sitio web para salón de belleza con React y TypeScript",
    planSteps: [
      "Crear navegación elegante con nombre del salón",
      "Diseñar hero con servicios de belleza",
      "Crear catálogo de servicios con precios",
      "Agregar formulario de reserva",
    ],
    html: reactWrap(`
const { useState } = React;

function App() {
  const [booked, setBooked] = useState(false);
  const services = [
    {icon:'✂️',title:'Corte & Peinado',price:'Desde $25',desc:'Estilistas expertos que crean el look perfecto.'},
    {icon:'💇',title:'Color & Tinte',price:'Desde $60',desc:'Técnicas de colorimetría avanzada.'},
    {icon:'💅',title:'Manicure & Pedicure',price:'Desde $20',desc:'Tratamientos de uñas con productos premium.'},
    {icon:'💆',title:'Tratamientos Faciales',price:'Desde $45',desc:'Limpiezas, hidrataciones y rejuvenecimiento.'},
    {icon:'💄',title:'Maquillaje',price:'Desde $50',desc:'Maquillaje profesional para toda ocasión.'},
    {icon:'🧖',title:'Spa & Relajación',price:'Desde $70',desc:'Masajes, aromaterapia y tratamientos corporales.'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(15,6,10,0.95)',borderBottom:'1px solid #301520',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',fontWeight:700,color:'#f472b6'}}>💅 Mi Salón</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Precios','Reservar'].map(l=><a key={l} href={\`#\${l.toLowerCase()}\`} style={{color:'#c070a0',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#db2777,#ec4899)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Reservar Cita</button>
      </div>
    </nav>

    <section style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(219,39,119,0.08) 0%,transparent 60%)'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2.5rem,5vw,4rem)',marginBottom:'1rem',background:'linear-gradient(135deg,#db2777,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Tu Espacio de Belleza y Bienestar</h1>
      <p style={{fontSize:'1.15rem',color:'#c070a0',maxWidth:600,marginBottom:'2rem'}}>Profesionales apasionados que cuidan cada detalle para que te sientas increíble.</p>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#db2777,#ec4899)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Reservar Cita →</button>
    </section>

    <section id="servicios" style={{padding:'5rem 2rem',background:'#0f060a'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#fce7f3'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {services.map((s,i)=><div key={i} style={{background:'#1f1018',border:'1px solid #301520',borderRadius:16,padding:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.3s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#db2777';e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#301520';e.currentTarget.style.transform=''}}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <div style={{fontSize:'1.5rem'}}>{s.icon}</div>
            <div><h3 style={{fontWeight:600,color:'#fce7f3',fontSize:'0.95rem'}}>{s.title}</h3><p style={{color:'#c070a0',fontSize:'0.82rem'}}>{s.desc}</p></div>
          </div>
          <span style={{color:'#f472b6',fontWeight:700,whiteSpace:'nowrap'}}>{s.price}</span>
        </div>)}
      </div>
    </section>

    <section id="reservar" style={{padding:'5rem 2rem',textAlign:'center'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#fce7f3'}}>Reserva tu Cita</h2>
      {booked ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Cita reservada!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setBooked(true)}}>
        <input style={{background:'#1f1018',border:'1px solid #301520',borderRadius:10,padding:'0.85rem 1rem',color:'#fce7f3',outline:'none'}} placeholder="Tu nombre" required />
        <input type="tel" style={{background:'#1f1018',border:'1px solid #301520',borderRadius:10,padding:'0.85rem 1rem',color:'#fce7f3',outline:'none'}} placeholder="Teléfono" required />
        <select style={{background:'#1f1018',border:'1px solid #301520',borderRadius:10,padding:'0.85rem 1rem',color:'#fce7f3',appearance:'auto'}}><option>Corte & Peinado</option><option>Color & Tinte</option><option>Manicure</option><option>Tratamiento Facial</option><option>Maquillaje</option><option>Spa</option></select>
        <input type="date" style={{background:'#1f1018',border:'1px solid #301520',borderRadius:10,padding:'0.85rem 1rem',color:'#fce7f3',outline:'none'}} required />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#db2777,#ec4899)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Confirmar Cita</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #301520',padding:'2rem',textAlign:'center',color:'#c070a0',fontSize:'0.85rem'}}>© 2026 Mi Salón. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Salón"),
  },
  // ==================== TECHNOLOGY ====================
  {
    id: "technology",
    name: "Tecnología / Software",
    keywords: ["tech", "software", "desarrollo", "programación", "programacion", "tecnología", "tecnologia", "sistemas", "informática", "devops", "plataforma"],
    description: "Sitio web para empresa de tecnología con React y TypeScript",
    planSteps: [
      "Crear navegación moderna tech",
      "Diseñar hero con propuesta de valor tech",
      "Crear sección de features/servicios",
      "Agregar CTA y contacto",
    ],
    html: reactWrap(`
const { useState, useEffect, useRef } = React;

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function App() {
  const [sent, setSent] = useState(false);
  const featRef = useRef(null);
  const visible = useOnScreen(featRef);
  const features = [
    {icon:'💻',title:'Desarrollo a Medida',desc:'Software personalizado con las últimas tecnologías y mejores prácticas de la industria.'},
    {icon:'☁️',title:'Cloud & DevOps',desc:'Infraestructura escalable, CI/CD automatizado y monitoreo 24/7.'},
    {icon:'🤖',title:'Inteligencia Artificial',desc:'Soluciones de IA y ML para automatizar procesos y generar insights.'},
    {icon:'📱',title:'Apps Móviles',desc:'Aplicaciones nativas y cross-platform para iOS y Android.'},
    {icon:'🔒',title:'Ciberseguridad',desc:'Auditorías, pentesting y protección avanzada de datos.'},
    {icon:'📊',title:'Big Data',desc:'Procesamiento y análisis de datos a gran escala para decisiones informadas.'},
  ];

  return <>
    <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(12px)',background:'rgba(6,10,15,0.95)',borderBottom:'1px solid #152535',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontSize:'1.3rem',fontWeight:700,color:'#67e8f9'}}>⚡ Mi Tech</div>
      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
        {['Servicios','Tecnologías','Contacto'].map(l=><a key={l} href={\`#\${l.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}\`} style={{color:'#60a5b8',fontSize:'0.9rem'}}>{l}</a>)}
        <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem'}}>Ver Demo</button>
      </div>
    </nav>

    <section style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(6,182,212,0.1) 0%,transparent 60%)'}}>
      <span style={{background:'#06b6d422',color:'#67e8f9',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid #06b6d444'}}>⚡ Innovación Tecnológica</span>
      <h1 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,#06b6d4,#67e8f9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',maxWidth:700}}>Soluciones que impulsan tu negocio al futuro</h1>
      <p style={{fontSize:'1.15rem',color:'#60a5b8',maxWidth:600,marginBottom:'2rem'}}>Desarrollamos software a medida, apps y plataformas con tecnología de vanguardia.</p>
      <div style={{display:'flex',gap:'1rem'}}><button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Solicitar Demo →</button><button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #152535',color:'#cffafe',borderRadius:10,fontWeight:600}}>Conocer Más</button></div>
    </section>

    <section ref={featRef} id="servicios" style={{padding:'5rem 2rem',background:'#060a0f'}}>
      <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:'3rem',color:'#cffafe'}}>Nuestros Servicios</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
        {features.map((f,i)=><div key={i} style={{background:'#0f1820',border:'1px solid #152535',borderRadius:16,padding:'2rem',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:\`all 0.5s ease \${i*100}ms\`}} onMouseOver={e=>{e.currentTarget.style.borderColor='#06b6d4';e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#152535';e.currentTarget.style.transform=visible?'translateY(0)':'translateY(20px)'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{f.icon}</div>
          <h3 style={{fontWeight:600,marginBottom:'0.5rem',color:'#cffafe'}}>{f.title}</h3>
          <p style={{color:'#60a5b8',fontSize:'0.95rem'}}>{f.desc}</p>
        </div>)}
      </div>
    </section>

    <section id="contacto" style={{padding:'5rem 2rem',textAlign:'center'}}>
      <h2 style={{fontSize:'2rem',fontWeight:700,marginBottom:'2rem',color:'#cffafe'}}>Hablemos de tu Proyecto</h2>
      {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Mensaje enviado!</p> :
      <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
        <input style={{background:'#0f1820',border:'1px solid #152535',borderRadius:10,padding:'0.85rem 1rem',color:'#cffafe',outline:'none'}} placeholder="Tu nombre" required />
        <input type="email" style={{background:'#0f1820',border:'1px solid #152535',borderRadius:10,padding:'0.85rem 1rem',color:'#cffafe',outline:'none'}} placeholder="tu@email.com" required />
        <textarea style={{background:'#0f1820',border:'1px solid #152535',borderRadius:10,padding:'0.85rem 1rem',color:'#cffafe',outline:'none',resize:'vertical',minHeight:100}} placeholder="Cuéntanos sobre tu proyecto..." required />
        <button type="submit" style={{padding:'0.85rem',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff',border:'none',borderRadius:10,fontWeight:600}}>Enviar</button>
      </form>}
    </section>

    <footer style={{borderTop:'1px solid #152535',padding:'2rem',textAlign:'center',color:'#60a5b8',fontSize:'0.85rem'}}>© 2026 Mi Tech. Creado con DOKU AI.</footer>
  </>;
}
`, "Mi Tech"),
  },
];

// Generate 5 color variants per template category
export const templates: Template[] = baseTemplates.flatMap(t => generateVariants(t));

export function findTemplate(message: string): Template | null {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let bestMatch: Template | null = null;
  let bestScore = 0;

  for (const template of templates) {
    let score = 0;
    for (const keyword of template.keywords) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(normalizedKeyword)) {
        score += normalizedKeyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

export function getDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DOKU AI Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;color:#e2e8f0}
.container{text-align:center;padding:2rem}
h1{font-size:2rem;margin-bottom:1rem;font-weight:700;background:linear-gradient(135deg,#a78bfa,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{color:#64748b;max-width:400px;line-height:1.6}
.dot{display:inline-block;width:8px;height:8px;background:#7c3aed;border-radius:50%;margin:0 3px;animation:pulse 1.5s ease-in-out infinite}
.dot:nth-child(2){animation-delay:0.2s}
.dot:nth-child(3){animation-delay:0.4s}
@keyframes pulse{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1}}
</style>
</head>
<body>
<div class="container">
<h1>DOKU AI</h1>
<p>Describe el sitio que quieres crear y lo generaré al instante usando React y TypeScript.</p>
<div style="margin-top:1.5rem"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
</div>
</body>
</html>`;
}
