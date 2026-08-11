# AGENTS.md — using type-tweaker in a project

Instructions for AI coding agents (Claude Code, Cursor, etc.) adding this component
to another codebase. Human docs live in [README.md](./README.md).

## What this is

A dev-only React panel that auditions fonts live by rewriting CSS custom properties
(`--font-*`) on `:root`. It does not persist anything to the repo — it's a chooser.
The design must consume the font tokens for the swap to be visible.

## Add it to a project (checklist)

1. **Install:** `npm install type-tweaker` (peers: `react`, `react-dom` >= 17).
2. **Confirm the design uses font tokens.** Grep for `var(--font-`. If the project
   hardcodes font families instead, first refactor them to tokens:
   ```css
   :root { --font-display: "Archivo", sans-serif; --font-body: "Inter", sans-serif; }
   h1 { font-family: var(--font-display); }
   body { font-family: var(--font-body); }
   ```
3. **Mount once, gated to dev**, at the app root:
   ```tsx
   import { TypeTweaker } from 'type-tweaker';
   // Vite:      {import.meta.env.DEV && <TypeTweaker roles={roles} />}
   // Next.js:   {process.env.NODE_ENV !== 'production' && <TypeTweaker roles={roles} />}
   //            (add "use client" — it uses window/localStorage)
   // CRA:       {process.env.NODE_ENV === 'development' && <TypeTweaker roles={roles} />}
   ```
4. **Configure `roles` to match the project.** One role per font token. `cssVar`
   MUST equal a variable the CSS actually reads. `sample` should be text from THIS
   project's pages, not generic filler. `default` is the currently-shipped font.
   ```tsx
   import { TypeTweaker, type TweakerRole } from 'type-tweaker';
   const roles: TweakerRole[] = [
     { key: 'display', label: 'Display', cssVar: '--font-display', fallback: 'sans-serif',
       sample: '<a real headline from this app>', default: '<current font>',
       fonts: [{ name: 'Archivo', spec: 'Archivo:wght@400;700;900' },
               { name: 'Space Grotesk', spec: 'Space+Grotesk:wght@400;700' }] },
     // ...one per token
   ];
   ```
   To keep the built-in font lists and only retarget vars/samples, map `defaultRoles`:
   ```tsx
   import { defaultRoles } from 'type-tweaker';
   const roles = defaultRoles.map(r => ({ ...r, sample: mySamples[r.key] ?? r.sample }));
   ```

## Committing a chosen font (audition → production)

The panel saves a click to `localStorage` only. To ship a choice permanently:

1. Pick in the panel, click **Copy stack** → yields font names + a Google Fonts URL.
2. Add the fonts (that `<link>`/`@import`, or self-host).
3. Set the token default in CSS: `:root { --font-display: "<chosen>", <fallback>; }`.
4. Update that role's `default` (add the font to its `fonts` list if missing).
5. Ship. It's `DEV`-gated, so production already excludes the panel. Tell the user to
   clear `localStorage` key `<storageKey>:selections` if a stale audition persists.

## API surface

- `TypeTweaker` — props: `roles?`, `storageKey?`, `accent?`, `defaultOpen?`,
  `loadGoogleFonts?`. See `src/types.ts`.
- `defaultRoles` — the built-in Display/Body/Script/Mono/Serif config.
- Types: `TweakerRole`, `FontOption`, `TypeTweakerProps`.

## Repo layout / commands

- `src/` — the published component (`TypeTweaker.tsx`, `defaults.ts`, `types.ts`).
- `demo/` — the GitHub Pages demo (a reference integration; not published to npm).
- `npm run build` — library (tsup → `dist/`, ESM + `.d.ts`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run demo:dev` / `demo:build` — the demo.

## Guardrails for agents

- Do NOT ship the panel to production; always keep the `DEV`/`NODE_ENV` gate.
- Do NOT invent font names — a `spec` must be a real Google Fonts family, or omit
  `spec` for system/self-hosted fonts.
- Do NOT commit `localStorage`-based selections as if they were config; the source of
  truth is the CSS token defaults + the `roles` prop.
- The `cssVar` you target must exist in the project's stylesheet, or nothing changes.
