

## Mejorar los prompts de tinyllama para contenido natural en espanol

### Problemas detectados en los logs

Los logs muestran exactamente que falla:

1. **Hero subtitle**: tinyllama repite la instruccion del prompt ("Un subtitulo corto (maximo 2 oraciones) para la pa...") en vez de generar contenido.
2. **Features**: No se enriquecieron (0 de 3). tinyllama no entiende bien el formato con `|`.
3. **About text**: Genera con numeracion ("1. Oracion sobre...") en vez de texto natural.
4. **Testimonials**: Solo 1 de 2 se parseo correctamente.

### Causa raiz

Los prompts actuales son demasiado complejos para tinyllama (1.1B). Contienen demasiadas instrucciones negativas ("sin comillas ni explicaciones", "sin numeros") que el modelo no procesa bien. Modelos pequenos funcionan mejor con:
- Prompts tipo "completar la frase" (few-shot by example)
- Un solo ejemplo concreto del formato esperado
- Instrucciones positivas en vez de negativas

### Cambios en `supabase/functions/builder-ai/index.ts`

**1. Prompt del Hero Subtitle (linea 2022-2024)**

Cambiar de instruccion abstracta a formato "completa la frase":

```
ANTES: "Escribe UN subtitulo corto (maximo 2 oraciones) para la pagina web de "El Buen Cafe", que es un negocio de tipo restaurant. Solo responde con el texto, sin comillas ni explicaciones."

DESPUES: "Subtitulo para pagina web de El Buen Cafe:\n\n"
```

Prompt ultra-corto tipo "completion" que tinyllama puede completar naturalmente.

**2. Prompt de Features (linea 2026-2028)**

Usar few-shot example con el delimitador `|` ya incluido en el patron:

```
ANTES: "Escribe 3 descripciones cortas (1 oracion cada una) de servicios para "El Buen Cafe" (restaurant). Separa cada descripcion con "|". Solo el texto, sin numeros ni explicaciones."

DESPUES: "Servicios de El Buen Cafe:\nDesayunos frescos cada manana|Cafe de grano seleccionado|"
```

Al darle el ejemplo ya con `|`, tinyllama continuara el patron naturalmente.

**3. Prompt del About (linea 2030-2032)**

```
ANTES: "Escribe 2 oraciones sobre "El Buen Cafe" (restaurant) para la seccion "Sobre nosotros" de su pagina web. Solo responde con el texto."

DESPUES: "Sobre nosotros: El Buen Cafe es"
```

Inicio de frase que el modelo completa de forma natural.

**4. Prompt de Testimonials (linea 2034-2036)**

```
ANTES: "Escribe 2 testimonios ficticios cortos (1 oracion cada uno) de clientes satisfechos de "El Buen Cafe" (restaurant). Formato: Nombre - "testimonio" - cargo. Separa con "|"."

DESPUES: "Opiniones de clientes de El Buen Cafe:\nMaria Lopez - Excelente servicio y comida deliciosa - Cliente frecuente|"
```

**5. Mejorar el parsing de features (lineas 2048-2055)**

Agregar limpieza adicional para manejar variaciones de tinyllama:
- Limpiar numeracion residual ("1.", "2.", "-")
- Aceptar `|` o saltos de linea como separadores
- Reducir el minimo de caracteres de 10 a 5 para aceptar descripciones cortas

**6. Mejorar el parsing de hero (lineas 2040-2046)**

- Limpiar texto que repita el nombre del negocio al inicio si ya esta duplicado
- Remover prefijos como "Subtitulo:" que tinyllama podria agregar

**7. Aumentar `num_predict` a 150 (linea 1968)**

Las features necesitan 3 descripciones separadas, 120 tokens puede ser insuficiente.

### Resumen de cambios

Todos los cambios son en un solo archivo: `supabase/functions/builder-ai/index.ts`

- Lineas 1968: `num_predict: 120` a `150`
- Lineas 2022-2024: Prompt hero simplificado (completion-style)
- Lineas 2026-2028: Prompt features con few-shot example y `|`
- Lineas 2030-2032: Prompt about simplificado
- Lineas 2034-2036: Prompt testimonials con ejemplo concreto
- Lineas 2040-2055: Parsing mejorado con limpieza de numeracion y separadores alternativos
- Redesplegar edge function

