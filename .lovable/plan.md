## Plan: Optimizar edge function para llama3.1:8b — COMPLETADO ✅

### Cambios realizados en `supabase/functions/builder-ai/index.ts`

1. **Modelo default**: `tinyllama` → `llama3.1:8b`
2. **Parámetros**: `num_predict` configurable (300 default, 2000 para HTML completo), timeout dinámico (30s/60s)
3. **Prompts**: Reescritos como instrucciones directas en vez de completion-style
4. **Lógica principal**: Intenta generación HTML completa primero, fallback a híbrido si < 200 chars
5. **Stop sequences**: Removidas para generación HTML larga
