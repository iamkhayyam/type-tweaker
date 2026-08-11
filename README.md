# type-tweaker

A draggable, dependency-free dev panel for auditioning fonts **live on the page**. It hot-swaps CSS custom properties (`--font-*`) at `:root`, so any design driven by font tokens re-skins instantly. Hover a candidate to preview, click to commit, drag by the header to reposition. No Tailwind, no CSS import, no build step required to try it.

Extracted from the build of *The Polyrhythmatics*, where it was used to pick calligraphy against a Swiss grotesk grid.

![role tabs: Display · Body · Script · Mono · Serif — each candidate rendered in its own face](#)

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

## Features

- **Live preview** — hover any candidate to see it on the real page; the menu renders each name in its own face.
- **Draggable** — grab the header; position is clamped to the viewport and persisted.
- **Persistence** — selections and position survive reloads via `localStorage`.
- **Copy stack** — exports your picks plus a ready-to-paste Google Fonts `<link>` URL.
- **Reset** — reverts every role to its `default`.
- **Self-contained styling** — injects its own scoped stylesheet; no Tailwind or CSS import.
- **Tree-shakeable** — gate with `import.meta.env.DEV` and it drops out of production bundles.

## Notes

- Variable-font width/weight axes (e.g. Archivo's `wdth`) only apply to fonts that expose them. A non-variable substitute previews the family shape but not the axis.
- The panel loads its own IBM Plex Mono for its chrome so it looks right regardless of the host page.

## License

MIT © iamkhayyam
