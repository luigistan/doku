import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PublicPreview = () => {
  const { projectId, slug } = useParams<{ projectId?: string; slug?: string }>();
  const navigate = useNavigate();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<"not_found" | "private" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId && !slug) return;

    const load = async () => {
      // First try without is_public filter to detect private projects
      let query = supabase
        .from("projects")
        .select("html, is_public, name");

      if (slug) {
        query = query.eq("slug", slug);
      } else if (projectId) {
        query = query.eq("id", projectId);
      }

      const { data, error: err } = await query.single();

      if (err || !data) {
        setError("not_found");
      } else if (!data.is_public) {
        setError("private");
      } else {
        setHtml(data.html);
      }
      setLoading(false);
    };

    load();
  }, [projectId, slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl font-bold text-foreground">
          {error === "private" ? "🔒 Proyecto privado" : "Proyecto no encontrado"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {error === "private"
            ? "Este proyecto existe pero su autor lo ha marcado como privado."
            : "Este proyecto no existe o la URL es incorrecta."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl font-bold text-foreground">Sin contenido</h1>
        <p className="text-sm text-muted-foreground">Este proyecto aún no tiene contenido generado.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Inject navigation guard for public preview
  const guardedHtml = (() => {
    if (!html || html.length < 50) return html;
    const guard = `<script>
(function() {
  function sanitizeLink(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    a.setAttribute('data-original-href', href);
    if (href.startsWith('/') && href.length > 1) {
      a.setAttribute('href', '#' + href.substring(1).replace(/\\//g, '-'));
    } else {
      a.setAttribute('href', '#');
    }
  }
  function sanitizeAll() { document.querySelectorAll('a[href]').forEach(sanitizeLink); }
  sanitizeAll();
  var obs = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType === 1) {
          if (n.tagName === 'A') sanitizeLink(n);
          if (n.querySelectorAll) n.querySelectorAll('a[href]').forEach(sanitizeLink);
        }
      });
      if (m.type === 'attributes' && m.target.tagName === 'A') sanitizeLink(m.target);
    });
  });
  obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });

  document.addEventListener('click', function(e) {
    var path = e.composedPath ? e.composedPath() : [];
    var a = null;
    for (var i = 0; i < path.length; i++) {
      if (path[i].tagName === 'A') { a = path[i]; break; }
    }
    if (!a) a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var targetId = href.substring(1);
      var el = document.getElementById(targetId);
      if (!el) {
        var secs = document.querySelectorAll('section, div[id], h1, h2, h3');
        for (var j = 0; j < secs.length; j++) {
          var t = (secs[j].id || secs[j].textContent || '').toLowerCase();
          if (t.indexOf(targetId.toLowerCase()) !== -1) { el = secs[j]; break; }
        }
      }
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, true);

  window.open = function() { return null; };
  history.pushState = function() { return undefined; };
  history.replaceState = function() { return undefined; };
  var _origHref = window.location.href;
  setInterval(function() {
    if (window.location.href !== _origHref) {
      try { window.location.replace(_origHref); } catch(e) {}
    }
  }, 100);
})();
</script>`;
    if (html.includes('</head>')) return html.replace('</head>', guard + '</head>');
    if (html.includes('<body')) return html.replace(/<body([^>]*)>/, '<body$1>' + guard);
    return guard + html;
  })();

  return (
    <iframe
      srcDoc={guardedHtml}
      className="h-screen w-screen border-0"
      title="Public Preview"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
};

export default PublicPreview;
