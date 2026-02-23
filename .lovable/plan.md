

# Plan: Entrenamiento Avanzado del Motor de IA de DOKU - Fase 2

## Problemas Detectados en las Pruebas

### BUG CRITICO: Saludos clasificados como intents
- "hola como estas" se clasifica como `billing` al 78% de confianza
- El patron de deteccion conversacional requiere que "hola" este al FINAL del mensaje: `/hola\s*[!?.]*$/`
- "hola como estas" no coincide porque tiene texto despues de "hola"

### Industrias faltantes
- "lavanderia con sistema de entregas" obtiene 36% de confianza (no hay intent de lavanderia)
- Faltan: lavanderia, farmacia, constructora, floristeria, taller mecanico, imprenta, etc.

### Feedback no recolectado
- 32 de 102 logs tienen `user_accepted = NULL` (31% de datos perdidos para entrenamiento)

### Conversational patterns incompletos
- Solo detecta patrones muy especificos de saludo
- No detecta preguntas generales como "hola que tal", "buenas", "hey"

---

## Mejoras Propuestas

### 1. Corregir deteccion de saludos y mensajes conversacionales

Modificar `conversationalPatterns` en `builder-ai/index.ts` para detectar correctamente:
- Saludos con cualquier texto adicional: "hola como estas", "hola que tal", "hey que onda"
- Despedidas: "adios", "nos vemos", "bye"
- Agradecimientos extendidos: "muchas gracias por todo"
- Preguntas sobre DOKU: "que eres", "quien eres", "como funcionas"

Cambio especifico: el patron de hola debe ser `/^(?:hola|hey|oye|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?)|que\s+tal|que\s+onda)/i` (al INICIO, sin requerir fin de linea).

### 2. Agregar 6 nuevos intents de industria

Agregar a `intentMap`, `semanticVocabulary`, `bootstrapCorpus`, y templates de secciones:

- **laundry** (Lavanderia): keywords como lavanderia, tintoreria, lavado, planchado, ropa sucia
- **pharmacy** (Farmacia): keywords como farmacia, medicamentos, recetas, drogueria
- **construction** (Constructora): keywords como constructora, arquitecto, obra, remodelacion
- **florist** (Floristeria): keywords como floristeria, flores, arreglos florales, ramos
- **mechanic** (Taller Mecanico): keywords como taller, mecanico, reparacion, auto, carro
- **printing** (Imprenta): keywords como imprenta, impresion, papeleria, copias, rotulacion

Tambien agregar `intentDatabaseSchema` para cada uno y `phrasePatterns` correspondientes.

### 3. Expandir el corpus de bootstrapping con 200+ mensajes nuevos

Agregar variaciones para:
- Los 6 nuevos intents (15-20 mensajes cada uno)
- Casos ambiguos entre intents cercanos (ej: salon vs spa, billing vs accounting)
- Mensajes con errores ortograficos mas variados
- Mensajes en Spanglish ("quiero un beauty salon", "necesito un food delivery")
- Mensajes muy cortos ("gym", "tienda", "doctor")
- Mensajes muy largos y descriptivos

### 4. Mejorar la respuesta conversacional inteligente

En lugar de una respuesta generica cuando el mensaje es conversacional, dar respuestas contextuales:
- Saludos: responder con saludo + pregunta sobre que quieren crear
- Preguntas sobre capacidades: listar los tipos de sitios que puede crear
- Agradecimientos: agradecer y preguntar si necesitan algo mas
- Mensajes de error del usuario: ofrecer ayuda especifica

### 5. Agregar "anti-patterns" al clasificador

Crear una lista de palabras que NUNCA deberian activar generacion:
- Saludos puros: "hola", "hey", "buenas"
- Emociones: "estoy bien", "genial", "perfecto"  
- Meta-preguntas: "que puedes hacer", "como funciono"

Si el mensaje SOLO contiene anti-patterns, forzar `conversational` sin pasar por el clasificador.

### 6. Sistema de confusion tracking

Agregar una tabla o campo que registre cuando el clasificador produce resultados ambiguos (top 2 intents con menos de 2 puntos de diferencia). Esto permite identificar pares de intents que se confunden frecuentemente y agregar mas datos de entrenamiento especificos.

---

## Detalles Tecnicos

### Archivo: `supabase/functions/builder-ai/index.ts`

#### A. Fix de conversational patterns (linea ~3495)

```text
Antes:
  /(?:hola|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?))\s*[!?.]*$/i

Despues:
  /^(?:hola|hey|oye|buenas?|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?)|que\s+tal|que\s+onda|saludos)/i
  
Agregar nuevos patrones:
  /^(?:adios|bye|nos\s+vemos|hasta\s+luego|chao)/i
  /^(?:quien|que)\s+eres/i
  /^(?:estoy\s+bien|todo\s+bien|genial|perfecto|ok)\s*[!?.]*$/i
```

#### B. Anti-pattern gate (antes del clasificador, linea ~3575)

```text
Funcion: isGreetingOnly(message)
- Tokeniza el mensaje
- Si TODOS los tokens son saludos/emociones/meta-palabras → return conversational
- Si tiene < 2 tokens semanticos → return conversational
- Solo entonces pasar al clasificador
```

#### C. Nuevos intents (en intentMap, linea ~388)

```text
laundry: { 
  keywords: ["lavanderia", "tintoreria", "lavado", "planchado", "ropa", "limpieza"],
  bigrams: ["lavado seco", "ropa sucia", "servicio lavanderia"],
  label: "Lavanderia / Tintoreria"
}
// + pharmacy, construction, florist, mechanic, printing
```

#### D. Nuevos esquemas de DB (en intentDatabaseSchema, linea ~17)

```text
laundry: [
  { name: "orders", columns: [client_name, phone, service_type, items, pickup_date, delivery_date, status, total] },
  { name: "services", columns: [name, description, price, duration, category] },
]
// + esquemas para los otros 5 nuevos intents
```

#### E. Respuestas conversacionales contextuales (en isConversational, linea ~3516)

```text
Saludos → "Hola! Soy DOKU, tu asistente de creacion web. Que tipo de sitio quieres crear hoy? 
           Puedo hacer restaurantes, tiendas online, portfolios, sistemas de facturacion y mas."
Quien eres → "Soy DOKU AI, un motor de inteligencia artificial propio que clasifica tu mensaje 
              y genera sitios web completos con React y base de datos. Sin APIs externas."
Gracias → "De nada! Si necesitas algo mas, solo dimelo. Puedo crear nuevos sitios, 
           agregar paginas, o modificar lo existente."
```

### Orden de implementacion

1. Fix critico: conversational patterns + anti-pattern gate (corrige el bug de "hola como estas")
2. Respuestas conversacionales inteligentes
3. 6 nuevos intents con keywords, vocabulario semantico, phrase patterns
4. Schemas de base de datos para nuevos intents
5. Expansion del bootstrap corpus (+200 mensajes)
6. Phrase patterns y bigrams para nuevos intents
7. Deploy y pruebas con los casos de prueba fallidos

### Impacto Esperado

- Eliminar falsos positivos en saludos y mensajes no-generativos
- Cubrir 30 intents (de 24 actuales) = mas industrias soportadas
- Corpus de bootstrapping: de ~280 a ~500 mensajes sinteticos
- Mejor experiencia conversacional con respuestas contextuales
- "lavanderia", "farmacia", "constructora" etc. ahora generan sitios reales

