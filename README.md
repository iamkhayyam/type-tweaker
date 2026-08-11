# type-tweaker

A draggable, dependency-free dev panel for auditioning fonts **live on the page**. It hot-swaps CSS custom properties (`--font-*`) at `:root`, so any design driven by font tokens re-skins instantly. Hover a candidate to preview, click to commit, drag by the header to reposition. No Tailwind, no CSS import, no build step required to try it.

Extracted from the build of *The Polyrhythmatics*, where it was used to pick calligraphy against a Swiss grotesk grid.

**→ [Live demo](https://iamkhayyam.github.io/type-tweaker/)** — open the panel, hover a font, watch the whole page re-skin.

## How it works

Your design already references font tokens:

```css
:root {
  --font-display: "Archivo", sans-serif;
  --font-script: "Great Vibes", cursive;
}
h1 { font-family: var(--font-display); }
.signature { font-family: var(--font-script); }
```

TypeTweaker rewrites those variables on `document.documentElement`. Hovering a font sets the variable to a preview value; leaving the row reverts it; clicking commits and persists it to `localStorage`. Because it only touches the tokens, **the whole page updates with zero coupling to your components.**

> The token swap is only visible if your CSS actually consumes the variable named in each role's `cssVar`. That's the one integration requirement.

## Install

```bash
npm install type-tweaker
```

`react` and `react-dom` (>=17) are peer dependencies.

## Usage

Render it once, near the root, gated to development:

```tsx
import { TypeTweaker } from 'type-tweaker';

export default function App() {
  return (
    <>
      {/* your app */}
      {import.meta.env.DEV && <TypeTweaker />}
    </>
  );
}
```

That's it. The default configuration ships a Display / Body / Script / Mono / Serif set with curated Google Fonts candidates.

### Copy it instead

Prefer zero dependencies? The component is a single self-contained file — copy `src/TypeTweaker.tsx`, `src/defaults.ts`, and `src/types.ts` into your project and import locally.

## Configuration

Every role maps a tab to a CSS variable and a list of candidates:

```tsx
import { TypeTweaker, type TweakerRole } from 'type-tweaker';

const roles: TweakerRole[] = [
  {
    key: 'display',
    label: 'Display',
    cssVar: '--font-display',   // the variable your CSS consumes
    fallback: 'sans-serif',
    sample: 'The quick brown fox',
    default: 'Archivo',          // currently-shipped font (the reset target)
    sampleStyle: { fontSize: '1.5rem', fontWeight: 700 },
    fonts: [
      { name: 'Archivo', spec: 'Archivo:wght@400;700;900' },
      { name: 'Space Grotesk', spec: 'Space+Grotesk:wght@400;700' },
      { name: 'Helvetica Neue' }, // no spec → treated as already available
    ],
  },
];

<TypeTweaker roles={roles} storageKey="my-app-fonts" accent="#FF4D12" />
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `roles` | `TweakerRole[]` | built-in set | Tabs, each binding a CSS variable to font candidates. |
| `storageKey` | `string` | `"type-tweaker"` | localStorage namespace for selections + panel position. |
| `accent` | `string` | `"#FF4D12"` | Accent color for active states and the "dirty" dot. |
| `defaultOpen` | `boolean` | `false` | Start with the panel open. |
| `loadGoogleFonts` | `boolean` | `true` | Auto-inject Google Fonts for candidate `spec`s. Set `false` if self-hosting. |

### FontOption

```ts
type FontOption = {
  name: string;   // family name as used in CSS, e.g. "Great Vibes"
  spec?: string;  // Google Fonts css2 family spec, e.g. "Great+Vibes"
                  // omit for system / self-hosted fonts
};
```

## Swapping a font in for good

The panel is an **audition tool**, not persistence for your codebase. When you
click a font, the pick is saved to `localStorage` and re-applied on reload — but
only in *your* browser. Nothing in your repo changes. To actually ship a choice:

1. **Land on a combination** in the panel, then hit **Copy stack**. You get the
   chosen font per role plus a ready-to-paste Google Fonts URL:

   ```
   Display: Space Grotesk
   Script: Pinyon Script
   ...
   https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Pinyon+Script&display=swap
   ```

2. **Load the fonts** — drop that URL into your `<head>` (or `@import` it), or
   self-host the files.

3. **Set the token defaults** in your own CSS so the choice is the new baseline:

   ```css
   :root {
     --font-display: "Space Grotesk", sans-serif;
     --font-script: "Pinyon Script", cursive;
   }
   ```

4. **Update `default`** for that role (and add the font to its `fonts` list if it
   wasn't already there) so the panel treats it as the current baseline / reset
   target rather than a temporary override.

5. **Ship it.** Since the tweaker is gated behind `import.meta.env.DEV`, it's
   already gone from production — the tokens carry the design on their own. Clear
   `localStorage` (`<storageKey>:selections`) if a stale audition lingers.

### Changing the candidates or the preview text

Everything the panel offers comes from the `roles` prop — swap fonts, add your own,
or change the sample text without touching the component. The samples should read
like *your* page, not the defaults:

```tsx
import { TypeTweaker, defaultRoles } from 'type-tweaker';

// Keep the default fonts + roles, just rewrite each preview line:
const roles = defaultRoles.map(r => ({
  ...r,
  sample: { display: 'Your headline', script: 'your accent' }[r.key] ?? r.sample,
}));

<TypeTweaker roles={roles} />
```

Or define roles from scratch (add/remove fonts, point at your own token names) using
the `TweakerRole` shape documented above.

## Features

- **Live preview** — hover any candidate to see it on the real page; the menu renders each name in its own face.
- **Draggable** — grab the header; position is clamped to the viewport and persisted.
- **Persistence** — selections and position survive reloads via `localStorage`.
- **Copy stack** — exports your picks plus a ready-to-paste Google Fonts `<link>` URL.
- **Reset** — reverts every role to its `default`.
- **Self-contained styling** — injects its own scoped stylesheet; no Tailwind or CSS import.
- **Tree-shakeable** — gate with `import.meta.env.DEV` and it drops out of production bundles.

## Using with AI agents

There's an **[AGENTS.md](./AGENTS.md)** at the repo root — the cross-tool standard that
coding agents (Claude Code, Cursor, Copilot Workspace, etc.) read automatically. Point an
agent at this package from another project ("add `type-tweaker`") and it gets a concrete
integration checklist: confirm the design uses `var(--font-*)` tokens (refactor if not),
mount `<TypeTweaker>` behind a `DEV` gate, wire a `roles` config whose `cssVar`s match the
project's real tokens and whose `sample`s use the project's real copy, plus how to commit a
chosen font and the guardrails to respect (never ship the panel to production, never invent a
Google Fonts `spec`, don't treat a `localStorage` audition as committed config).

## Notes

- Variable-font width/weight axes (e.g. Archivo's `wdth`) only apply to fonts that expose them. A non-variable substitute previews the family shape but not the axis.
- The panel loads its own IBM Plex Mono for its chrome so it looks right regardless of the host page.

## License

MIT © iamkhayyam
