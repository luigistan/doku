

# Plan: Indicadores de Estado de Ollama y Base de Datos en el Header del Builder

## Objetivo

Agregar badges/indicadores visuales en el header del Builder para que el usuario vea de un vistazo si Ollama y la base de datos estan activos, sin necesidad de abrir la configuracion.

## Ubicacion

En el header, junto al nombre del proyecto y el badge "BETA", se agregaran dos badges compactos:

```text
[<-] [logo] Proyecto  BETA  [DB activa]  [Ollama]     [Exportar ZIP] [Codigo] [Settings]
```

## Cambios

### 1. `src/components/builder/Header.tsx`

Agregar dos nuevas props:
- `dbEnabled: boolean` - si la base de datos esta activa
- `ollamaEnabled: boolean` - si Ollama esta habilitado (leido desde localStorage)

Renderizar badges compactos junto al nombre del proyecto:
- **DB**: Badge verde con icono Database y texto "DB" cuando `dbEnabled = true`. Oculto si no esta activo.
- **Ollama**: Badge morado/brain con icono Brain y texto "Ollama" cuando `ollamaEnabled = true`. Oculto si no esta activo.

Estilo de los badges: similar al badge "BETA" existente pero con colores semanticos:
- DB activa: `bg-execute/15 text-execute` (verde)
- Ollama activo: `bg-brain/15 text-brain` (morado)

### 2. `src/pages/Builder.tsx`

- Leer la config de Ollama desde `localStorage` usando la key `doku_ollama_{projectId}`
- Pasar `dbEnabled` y `ollamaEnabled` como props al Header
- Escuchar cambios en `settingsOpen` para refrescar el estado de Ollama cuando el usuario cierre settings (por si cambio el toggle)

## Detalle Visual

Los badges seran pequenos (misma altura que "BETA"), con iconos de 10-12px y texto de 10px, para no saturar el header. Solo aparecen cuando la feature esta activa, manteniendo el header limpio cuando no hay nada configurado.

