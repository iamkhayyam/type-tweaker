import type { CSSProperties } from 'react';

export type FontOption = {
  /** Family name as it appears in CSS, e.g. "Great Vibes" */
  name: string;
  /**
   * Google Fonts css2 `family` spec, e.g. "Great+Vibes" or
   * "Space+Grotesk:wght@400;700". Used to lazily inject the font.
   * Omit to treat the font as already available (system font or self-hosted).
   */
  spec?: string;
};

export type TweakerRole = {
  /** Stable id for this role (used for storage + tab keys) */
  key: string;
  /** Tab label, e.g. "Script" */
  label: string;
  /** CSS custom property this role rewrites on :root, e.g. "--font-script" */
  cssVar: string;
  /** Generic fallback family appended after the chosen font */
  fallback: string;
  /** Preview text shown for each candidate */
  sample: string;
  /** Name of the font currently shipped for this role (the "reset" target) */
  default: string;
  /** Candidate fonts to audition */
  fonts: FontOption[];
  /** Optional style overrides for the per-item sample line */
  sampleStyle?: CSSProperties;
};

export type TypeTweakerProps = {
  /** Role + font configuration. Defaults to a display/body/script/mono/serif set. */
  roles?: TweakerRole[];
  /** localStorage namespace for selections + panel position. */
  storageKey?: string;
  /** Accent color used for active states and the "dirty" dot. */
  accent?: string;
  /** Start with the panel open. */
  defaultOpen?: boolean;
  /**
   * Auto-inject Google Fonts stylesheets for candidate `spec`s.
   * Set false if you self-host and only want the token swap. Default true.
   */
  loadGoogleFonts?: boolean;
};
