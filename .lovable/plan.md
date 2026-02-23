

# Plan: Prueba del Motor Hibrido + UI de Configuracion Ollama

## Resultado de las Pruebas

### Test 1: "quiero algo para vender pasteles artesanales"
- **Resultado:** `ecommerce` con 85.5% de confianza
- **Provider:** `rules` (motor de reglas)
- **Ollama no se activo:** Correcto, la confianza supera el umbral del 60%

### Test 2: "necesito algo bonito para mi negocio de costura"
- **Resultado:** `landing` con 99% de confianza
- **Provider:** `rules`
- **Ollama no se activo:** El motor de reglas es muy seguro

### Conclusion
El motor de reglas es lo suficientemente robusto para estos mensajes. Ollama se activara automaticamente solo cuando el motor tenga menos del 60% de confianza (mensajes muy ambiguos o industrias no cubiertas). El codigo de `classifyWithOllama()` esta implementado correctamente en `builder-ai/index.ts` y listo para funcionar.

---

## UI de Configuracion de Ollama en ProjectSettings

### Cambios a implementar

#### 1. `src/components/builder/ProjectSettings.tsx`

Agregar una nueva seccion "Motor de IA" entre la seccion de Base de Datos y la de Eliminar proyecto:

- **Icono Brain** con titulo "Motor de IA"
- **Indicador de estado**: Badge verde "Ollama configurado" si hay API key, o gris "Solo reglas"
- **Campo "Modelo"**: Input editable con el modelo actual (default: `llama3`), con boton Guardar
- **Campo "Umbral de confianza"**: Slider o input numerico (default: 0.6) que define cuando se activa Ollama
- **Indicador del ultimo proveedor usado**: Muestra "rules" u "ollama" segun la ultima clasificacion
- **Nota informativa**: Texto explicando que Ollama se activa automaticamente cuando el motor de reglas tiene baja confianza

La seccion usa el mismo estilo visual que las secciones existentes (labels uppercase, inputs con border-border, badges con colores execute/muted).

Los valores de modelo y umbral se guardan en localStorage por proyecto para persistencia simple sin necesidad de cambios en la base de datos.

#### 2. `src/types/builder.ts`

Agregar interface `OllamaConfig`:
```text
interface OllamaConfig {
  enabled: boolean
  model: string
  confidenceThreshold: number
}
```

#### 3. `src/services/builderService.ts`

Pasar `ollamaModel` y `confidenceThreshold` como parametros al edge function para que use el modelo y umbral configurados por el usuario.

#### 4. `supabase/functions/builder-ai/index.ts`

Leer `ollamaModel` y `confidenceThreshold` del body del request en lugar de usar valores hardcodeados. Si no vienen, usar defaults (`llama3` y `0.6`).

### Estructura visual de la seccion

```text
+--------------------------------------------+
| MOTOR DE IA                                |
| [Brain icon] Ollama configurado  [verde]   |
|                                            |
| Modelo: [llama3            ] [Guardar]     |
|                                            |
| Umbral: [0.6] (Ollama se activa si la      |
|          confianza es menor a este valor)   |
|                                            |
| Info: Ollama Cloud se usa como respaldo    |
| cuando el motor de reglas no esta seguro.  |
+--------------------------------------------+
```

### Orden de implementacion

1. Agregar `OllamaConfig` a `src/types/builder.ts`
2. Agregar seccion "Motor de IA" en `ProjectSettings.tsx` con estado en localStorage
3. Actualizar `builderService.ts` para enviar modelo y umbral al edge function
4. Actualizar `builder-ai/index.ts` para leer modelo y umbral del request body
5. Deploy del edge function

