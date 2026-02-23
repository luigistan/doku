

# Plan: Motor de IA Propio de DOKU - Entrenamiento y Optimizacion Maxima

## Estado Actual

DOKU ya tiene un motor de IA local bastante completo con:
- Clasificador multi-senal (8 senales: patrones de frase, verbos, keywords, TF-IDF, few-shot learning, aprendizaje negativo, pesos adaptativos)
- 24 intents (landing, restaurant, ecommerce, CRM, billing, etc.)
- Vocabulario semantico con ~400 terminos
- Sinonimos y correccion ortografica con Levenshtein
- Bucle de aprendizaje con feedback del usuario (ai_learning_logs: 95 registros, 78 aceptados)
- Contenido contextual por industria

## Mejoras Propuestas

### 1. Motor de Embeddings Propio (sin API externa)

Crear un sistema de embeddings basado en word2vec simplificado, entrenado directamente con el vocabulario de DOKU. Esto reemplaza el TF-IDF basico con vectores semanticos reales.

- Construir un mapa de co-ocurrencia de palabras usando el vocabulario semantico existente + los 95 logs de aprendizaje
- Generar vectores de 32 dimensiones por palabra (suficiente para 24 intents)
- Usar similitud coseno sobre vectores promediados para clasificar mensajes
- Los vectores se recalculan cada vez que se acumulan 20 nuevos logs

### 2. N-gram Probabilistico (Modelo de Lenguaje Propio)

Crear un modelo de lenguaje n-gram (trigramas) entrenado con los mensajes exitosos del sistema.

- Construir frecuencias de trigramas por intent usando los logs aceptados
- Calcular P(intent|mensaje) usando probabilidad condicional con suavizado Laplace
- Agregar como senal adicional al clasificador (Signal 9)
- Se auto-actualiza con cada interaccion aceptada

### 3. Clasificador por Cadena de Markov

Implementar una cadena de Markov de primer orden que aprenda las transiciones tipicas entre intents (ej: despues de crear un restaurante, el usuario suele pedir agregar paginas).

- Tabla de transicion intent -> intent basada en historial de conversacion
- Boost predictivo: si el usuario hizo "restaurant", darle mayor peso a "page_add" o "modification" en el siguiente mensaje
- Mejora la experiencia conversacional sin IA externa

### 4. Entrenamiento Activo con Datos Existentes

Pre-entrenar el sistema usando los 95 registros de ai_learning_logs mas los templates existentes.

- Generar 500+ mensajes sinteticos a partir de los patrones exitosos (variaciones con sinonimos, reordenamiento, errores ortograficos simulados)
- Alimentar al modelo n-gram y al sistema de embeddings
- Crear un "corpus de bootstrapping" hardcodeado con los patrones mas comunes

### 5. Reconocimiento de Entidades Mejorado (NER Propio)

Mejorar la extraccion de nombres de negocio, secciones y colores con un sistema de reglas mas robusto.

- Parser de dependencias simplificado para espanol (sujeto-verbo-objeto)
- Deteccion de entidades numericas (precios, cantidades, porcentajes)
- Reconocimiento de colores por contexto (ej: "elegante" -> dorado/oscuro, "juvenil" -> colores vivos)
- Inferencia de secciones por industria mejorada

### 6. Sistema de Confianza Calibrado

Recalibrar el sistema de confianza usando los datos reales de aceptacion/rechazo.

- Calcular umbrales optimos basados en precision/recall de los logs
- Implementar calibracion isotonica simple con los datos historicos
- Reducir falsos positivos en la zona de confirmacion (0.45-0.65)

---

## Detalles Tecnicos

### Archivo a modificar: `supabase/functions/builder-ai/index.ts`

#### A. Embeddings Propios (Word Vectors)

```text
Estructura:
- wordVectors: Map<string, number[]>  (palabra -> vector 32D)
- intentCentroids: Map<string, number[]>  (intent -> centroide)

Construccion:
1. Matriz de co-ocurrencia: Para cada par (palabra_i, palabra_j) que aparecen
   en el mismo intent, incrementar co_occur[i][j]
2. Reduccion dimensional con SVD aproximado (power iteration, 32 dims)
3. Normalizar vectores
4. Centroide por intent = promedio de vectores de sus palabras

Clasificacion:
- Vectorizar mensaje = promedio de vectores de tokens
- Similitud coseno con cada centroide
- Score = cosine_similarity * 7 (peso similar a TF-IDF actual)
```

#### B. N-gram Probabilistico

```text
Estructura:
- trigramFreq: Map<string, Map<string, number>>
  Clave: trigrama ("restaurante comida mexicana")
  Valor: Map<intent, frecuencia>

Entrenamiento:
1. Para cada log aceptado, extraer trigramas
2. Incrementar frecuencia para el intent detectado
3. Suavizado Laplace: P(intent|trigrama) = (count + 1) / (total + |intents|)

Scoring:
- Para cada trigrama del mensaje, acumular log P(intent|trigrama)
- Normalizar por numero de trigramas
- Score = exp(log_prob_normalizado) * 5
```

#### C. Cadena de Markov

```text
Estructura:
- transitionMatrix: Record<string, Record<string, number>>
  Ej: {"restaurant": {"page_add": 0.4, "modification": 0.3, ...}}

Se construye del historial de conversacion (conversationHistory param).
Boost = transitionMatrix[previousIntent][candidateIntent] * 3
```

#### D. Datos Sinteticos de Bootstrapping

```text
Generar variaciones automaticas:
- Para cada intent, tomar 3-5 mensajes prototipo
- Aplicar permutaciones: cambiar orden, agregar/quitar palabras de relleno
- Simular errores: swap letras adyacentes, omitir acentos
- Resultado: ~500 mensajes sinteticos pre-cargados
```

#### E. NER Mejorado

```text
Mejoras al extractEntities:
- Agregar patron: "para [NOMBRE]" sin restriccion de industria
- Detectar numeros de contacto, horarios, direcciones
- Inferir tono/estilo: "profesional", "juvenil", "minimalista", "lujoso"
- Mapear estilos a configuraciones de color y fuente
```

### Orden de Implementacion

1. Datos sinteticos de bootstrapping (corpus hardcodeado)
2. Modelo n-gram probabilistico (Signal 9)
3. Embeddings propios (Signal 10, reemplaza TF-IDF)
4. Cadena de Markov para prediccion contextual (Signal 11)
5. NER mejorado (extractEntities)
6. Calibracion de confianza
7. Deploy y pruebas end-to-end

### Impacto Esperado

- Precision de clasificacion: de ~75% a ~90% (estimado)
- Reduccion de "zona de confirmacion": menos preguntas innecesarias al usuario
- Mejor personalizacion de contenido por industria
- Aprendizaje continuo sin dependencia de servicios externos
- Todo corre en el edge function sin latencia de API externas

