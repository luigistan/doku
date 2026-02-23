import { useState, useEffect, useRef, useCallback } from "react";
import { PreviewState, ViewportSize } from "@/types/builder";
import { Monitor, Tablet, Smartphone, RotateCcw, Globe, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  preview: PreviewState;
  onViewportChange: (viewport: ViewportSize) => void;
  onRefresh: () => void;
  projectSlug?: string | null;
  isPublic?: boolean;
  projectId?: string;
}

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const statusConfig = {
  idle: { icon: Globe, label: "Listo", color: "text-muted-foreground" },
  loading: { icon: Loader2, label: "Generando...", color: "text-brain" },
  updating: { icon: Loader2, label: "Actualizando...", color: "text-brain" },
  ready: { icon: CheckCircle2, label: "Listo", color: "text-execute" },
  error: { icon: AlertCircle, label: "Error", color: "text-destructive" },
};

function useSimulatedProgress(isLoading: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let p: number;
      if (elapsed < 3) {
        p = (elapsed / 3) * 30;
      } else if (elapsed < 23) {
        p = 30 + ((elapsed - 3) / 20) * 30;
      } else if (elapsed < 63) {
        p = 60 + ((elapsed - 23) / 40) * 25;
      } else {
        p = 85 + ((elapsed - 63) / 60) * 10;
      }
      setProgress(Math.min(p, 95));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  return progress;
}

// Inject navigation guard + DOKU CRUD SDK into preview HTML
function injectNavigationGuard(html: string, projectId?: string): string {
  if (!html || html.length < 50) return html;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  const guard = `<script>
// Navigation guard + DOKU CRUD SDK
(function() {
  // === 1. Sanitize all links via MutationObserver ===
  function sanitizeLink(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    a.setAttribute('data-original-href', href);
    // Convert path-like hrefs to hash for smooth scroll
    if (href.startsWith('/') && href.length > 1) {
      a.setAttribute('href', '#' + href.substring(1).replace(/\\//g, '-'));
    } else {
      a.setAttribute('href', '#');
    }
  }
  function sanitizeAll() {
    document.querySelectorAll('a[href]').forEach(sanitizeLink);
  }
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

  // === 2. Robust click handler using composedPath ===
  document.addEventListener('click', function(e) {
    var path = e.composedPath ? e.composedPath() : [];
    var a = null;
    for (var i = 0; i < path.length; i++) {
      if (path[i].tagName === 'A') { a = path[i]; break; }
    }
    if (!a) {
      a = e.target.closest ? e.target.closest('a') : null;
    }
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('#')) {
      // Smooth scroll to section
      e.preventDefault();
      e.stopPropagation();
      if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var targetId = href.substring(1);
      var el = document.getElementById(targetId);
      if (!el) {
        // Try finding section by text content
        var secs = document.querySelectorAll('section, div[id], h1, h2, h3');
        for (var j = 0; j < secs.length; j++) {
          var t = (secs[j].id || secs[j].textContent || '').toLowerCase();
          if (t.indexOf(targetId.toLowerCase()) !== -1) { el = secs[j]; break; }
        }
      }
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // Block everything else
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // === 3. Block programmatic navigation ===
  window.open = function() { return null; };
  history.pushState = function() { return undefined; };
  history.replaceState = function() { return undefined; };

  // Block location changes via setInterval fallback
  var _origHref = window.location.href;
  setInterval(function() {
    if (window.location.href !== _origHref) {
      try { window.location.replace(_origHref); } catch(e) {}
    }
  }, 100);

  try {
    Object.defineProperty(window, '__doku_nav_blocked', { value: true });
  } catch(err) {}

  // ===== DOKU CRUD SDK =====
  var DOKU_PROJECT_ID = ${projectId ? JSON.stringify(projectId) : 'null'};
  var SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
  var SUPABASE_KEY = ${JSON.stringify(supabaseKey)};

  // Listen for projectId from parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'doku:projectId') {
      DOKU_PROJECT_ID = e.data.projectId;
    }
  });
  if (!DOKU_PROJECT_ID) {
    parent.postMessage({ type: 'doku:requestProjectId' }, '*');
  }

  // Handle form submissions
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    if (form.hasAttribute('data-real-submit')) return;

    if (form.hasAttribute('data-doku-table')) {
      e.preventDefault();
      var tableName = form.getAttribute('data-doku-table');
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function(v, k) { data[k] = v; });

      var btn = form.querySelector('button[type="submit"], button:not([type])');
      var origText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

      if (!DOKU_PROJECT_ID || !SUPABASE_URL) {
        if (btn) { btn.textContent = 'Error: sin proyecto'; btn.disabled = false; }
        return;
      }

      fetch(SUPABASE_URL + '/functions/v1/crud-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ action: 'create', projectId: DOKU_PROJECT_ID, tableName: tableName, data: data })
      })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.error) {
          if (btn) { btn.textContent = 'Error - Reintentar'; btn.disabled = false; }
        } else {
          if (btn) { btn.textContent = '✓ Guardado!'; }
          form.reset();
          setTimeout(function() { if (btn) { btn.textContent = origText; btn.disabled = false; } }, 2500);
        }
      })
      .catch(function() {
        if (btn) { btn.textContent = 'Error - Reintentar'; btn.disabled = false; }
      });
      return;
    }

    // Forms WITHOUT data-doku-table -> simulate success
    e.preventDefault();
    var btn2 = form.querySelector('button[type="submit"], button:not([type])');
    if (btn2) {
      var origText2 = btn2.textContent;
      btn2.textContent = '✓ Enviado correctamente';
      btn2.style.opacity = '0.7';
      btn2.disabled = true;
      setTimeout(function() {
        btn2.textContent = origText2;
        btn2.style.opacity = '1';
        btn2.disabled = false;
        form.reset();
      }, 2500);
    }
  });
})();
</script>`;
  // Inject before </head> or at the start of <body>
  if (html.includes('</head>')) {
    return html.replace('</head>', guard + '</head>');
  }
  if (html.includes('<body')) {
    return html.replace(/<body([^>]*)>/, '<body$1>' + guard);
  }
  return guard + html;
}

export function PreviewPanel({ preview, onViewportChange, onRefresh, projectSlug, isPublic, projectId }: PreviewPanelProps) {
  const StatusIcon = statusConfig[preview.status].icon;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const progress = useSimulatedProgress(preview.status === "loading");

  // Send projectId to iframe for CRUD SDK
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'doku:requestProjectId' && projectId && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'doku:projectId', projectId }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId]);
  // Detect if the preview seems stuck (HTML is set but iframe might not render)
  useEffect(() => {
    if (preview.status !== "ready" || !preview.html || preview.html.length < 100) {
      setLoadFailed(false);
      return;
    }

    // Give it 12 seconds to render, then show warning
    const timeout = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const body = doc?.body;
        // If body has no visible content (just empty root div), it likely failed
        if (body && body.innerText.trim().length < 10) {
          setLoadFailed(true);
        }
      } catch {
        // Cross-origin - can't check, assume ok
      }
    }, 12000);

    setLoadFailed(false);
    return () => clearTimeout(timeout);
  }, [preview.html, preview.status]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Viewport toggles */}
          <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
            {([
              { key: "desktop" as ViewportSize, icon: Monitor },
              { key: "tablet" as ViewportSize, icon: Tablet },
              { key: "mobile" as ViewportSize, icon: Smartphone },
            ]).map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onViewportChange(key)}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  preview.viewport === key
                    ? "bg-surface-3 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* URL bar */}
          {isPublic && projectSlug ? (
            <a
              href={`/p/${projectSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-brain transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span className="font-mono">doku.red/p/{projectSlug}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="font-mono">
                {isPublic ? "doku.red/preview/..." : "🔒 Privado"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusConfig[preview.status].color)}>
            <StatusIcon className={cn("h-3.5 w-3.5", preview.status === "loading" && "animate-spin")} />
            {statusConfig[preview.status].label}
          </div>

          {/* Refresh */}
          <button
            onClick={() => { setLoadFailed(false); onRefresh(); }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="relative flex flex-1 items-start justify-center overflow-auto bg-surface-2 p-4">
        <div
          className="h-full overflow-hidden rounded-lg border border-border bg-background shadow-2xl transition-all duration-300"
          style={{ width: viewportWidths[preview.viewport], maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            key={preview.html.length + preview.status}
            srcDoc={injectNavigationGuard(preview.html, projectId)}
            className="h-full w-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>

        {/* Subtle updating indicator (no overlay, preview stays visible) */}
        {preview.status === "updating" && (
          <div className="absolute top-16 right-6 z-10 flex items-center gap-2 rounded-lg border border-border bg-surface-1/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brain" />
            <span className="text-xs font-medium text-foreground">Actualizando...</span>
          </div>
        )}

        {/* DOKU loading overlay - only for first generation */}
        {preview.status === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background">
            <div
              className="select-none text-[80px] font-black tracking-widest leading-none transition-all duration-300"
              style={{
                background: `linear-gradient(to right, hsl(var(--brain)) ${progress}%, hsl(var(--muted-foreground) / 0.2) ${progress}%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DOKU AI
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground tabular-nums">
              {Math.round(progress)}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Analizando con DOKU AI...
            </p>
          </div>
        )}

        {/* Load failure overlay */}
        {loadFailed && (
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="rounded-xl border border-border bg-surface-1/95 p-6 text-center shadow-lg backdrop-blur-sm">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
              <p className="mb-2 text-sm font-medium text-foreground">El preview puede estar cargando</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Los scripts externos (React/Babel) pueden tardar en cargar.
              </p>
              <button
                onClick={() => { setLoadFailed(false); onRefresh(); }}
                className="inline-flex items-center gap-2 rounded-lg bg-brain px-4 py-2 text-sm font-medium text-brain-foreground transition-colors hover:bg-brain/90"
              >
                <RefreshCw className="h-4 w-4" />
                Refrescar preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
