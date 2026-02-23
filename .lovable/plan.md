
## Plan: Sistema de Machine Learning Adaptativo para DOKU AI

### Estado: ✅ IMPLEMENTADO

Todas las 6 mejoras han sido implementadas:

1. ✅ **Ollama Intent Refinement (Señal 8)** - Pre-clasificación con LLM que extrae intent, nombre, secciones y color del mensaje. Boost de +6 al intent detectado.

2. ✅ **Weighted Learning (Señal 8.5)** - Pesos adaptativos basados en tasa de aceptación histórica: `frequencyBoost = log(accepted + 1) * acceptanceRate`. Multiplica score por `1 + boost * 0.3`.

3. ✅ **Contexto conversacional con memoria de sesión** - Envía los últimos 3 turnos de conversación al edge function para mejor contexto. Ollama recibe historial para entender follow-ups.

4. ✅ **Validación de calidad HTML** - 6 validaciones semánticas (header, main, nombre, lorem ipsum, secciones, undefined/null). Si 2+ fallan, intenta fix automático y si no, fallback híbrido.

5. ✅ **Entity Memory por proyecto** - Tabla `user_entity_memory` que persiste intent, nombre, secciones y color por proyecto. Se carga al inicio y se usa como contexto para follow-ups.

6. ✅ **Feedback loop mejorado** - Al rechazar, se muestran 5 opciones rápidas (tipo incorrecto, nombre mal, faltan secciones, colores, otra cosa). El feedback se guarda como JSON estructurado.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Señales 8 y 8.5, validación HTML, entity memory, contexto conversacional |
| `src/hooks/useBuilderState.ts` | Historial conversacional, projectId, feedback detallado |
| `src/services/builderService.ts` | projectId y conversationHistory al request |
| `src/types/builder.ts` | Tipos FeedbackData y showFeedbackOptions |
| `src/components/builder/FeedbackOptions.tsx` | Nuevo: botones de feedback rápido |
| `src/components/builder/ChatPanel.tsx` | Prop onFeedback |
| `src/components/builder/MessageBubble.tsx` | Render FeedbackOptions |
| `src/pages/Builder.tsx` | Pasar projectId y submitFeedback |
| Migración SQL | Tabla `user_entity_memory` con RLS |
