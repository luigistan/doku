

## Problem: Preview Panel Shows Black/Empty Screen

The generated HTML uses React + Babel Standalone for in-browser JSX compilation, but the code contains **TypeScript syntax** (`React.FC`, `useState<boolean>`, `Feature` interface, non-null assertion `!`) that Babel Standalone cannot parse without the TypeScript preset.

### Root Cause

In `supabase/functions/builder-ai/index.ts`, line 1453:
```html
<script type="text/babel" data-type="module">
```

This tells Babel to compile JSX, but the generated code contains TypeScript constructs like:
- `React.FC` type annotations
- `useState<boolean>(false)` generic syntax
- `interface Feature { ... }` declarations  
- `document.getElementById('root')!` non-null assertion

Babel Standalone ignores these unless `data-presets="typescript"` is specified.

### Fix

**File: `supabase/functions/builder-ai/index.ts`**

1. **Change the script tag** (line ~1453) from:
   ```html
   <script type="text/babel" data-type="module">
   ```
   to:
   ```html
   <script type="text/babel" data-presets="react,typescript">
   ```

2. **Also update the PreviewPanel iframe** (`src/components/builder/PreviewPanel.tsx`, line ~87) -- remove `sandbox` restriction or ensure it doesn't block CDN scripts. Current `sandbox="allow-scripts allow-same-origin"` should be fine, but we should verify.

### Technical Details

- The `data-type="module"` attribute is not a valid Babel Standalone option; it does nothing useful.
- Adding `data-presets="react,typescript"` tells Babel Standalone to use both the React (JSX) and TypeScript presets, which will correctly handle all the TS syntax in the generated components.
- This is a single-line change in the edge function that fixes the entire preview rendering issue.

### Steps

1. Edit `supabase/functions/builder-ai/index.ts` line 1453: change `data-type="module"` to `data-presets="react,typescript"`
2. Deploy the `builder-ai` edge function
3. Test by generating a new site in the builder to confirm the preview renders correctly

