import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { FontOption, TweakerRole, TypeTweakerProps } from './types';
import { defaultRoles } from './defaults';

/**
 * TypeTweaker — a draggable, dependency-free dev panel for auditioning fonts on
 * the live page. It rewrites CSS custom properties (--font-*) at :root, so any
 * design driven by those tokens re-skins instantly. Hover a candidate to preview,
 * click to commit, drag by the header to reposition. Selections + position persist
 * in localStorage. Self-contained styling — no Tailwind, no CSS import required.
 */

const STYLE_ID = 'type-tweaker-styles';
const FONTS_PRECONNECT_ID = 'type-tweaker-preconnect';
const loadedSpecs = new Set<string>();

const CSS = `
.tt-root, .tt-root * { box-sizing: border-box; }
.tt-fab {
  position: fixed; bottom: 24px; left: 24px; z-index: 2147483000;
  display: inline-flex; align-items: center; gap: 10px;
  background: #002147; color: #fff; border: none;
  padding: 12px 16px; cursor: pointer;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2em;
  box-shadow: 0 8px 24px rgba(0,33,71,0.28); transition: background .2s;
}
.tt-fab:hover { background: #0A3563; }
.tt-fab .tt-aa { font-size: 16px; font-weight: 700; line-height: 1; }
.tt-panel {
  position: fixed; bottom: 24px; left: 24px; z-index: 2147483000;
  width: 340px; max-width: calc(100vw - 48px); max-height: 75vh;
  display: flex; flex-direction: column;
  background: #D4ECD8; border: 2px solid #002147;
  box-shadow: 0 20px 50px rgba(0,33,71,0.35);
  font-family: "IBM Plex Mono", ui-monospace, monospace; color: #002147;
}
.tt-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #002147; color: #fff;
  cursor: grab; user-select: none; touch-action: none;
}
.tt-header:active { cursor: grabbing; }
.tt-title { display: flex; align-items: center; gap: 10px;
  font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2em; }
.tt-title .tt-grip { font-size: 15px; line-height: 1; opacity: .8; }
.tt-hbtns { display: flex; align-items: center; gap: 16px; }
.tt-ghost { background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.6); font-family: inherit;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; transition: color .2s; }
.tt-ghost:hover { color: var(--tt-accent, #FF4D12); }
.tt-close { font-size: 18px; line-height: 1; color: rgba(255,255,255,0.7); }
.tt-close:hover { color: #fff; }
.tt-tabs { display: flex; border-bottom: 2px solid #002147; }
.tt-tab { flex: 1; padding: 10px 4px; background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(0,33,71,0.5); transition: color .2s, background .2s; }
.tt-tab:hover { color: #002147; background: rgba(0,33,71,0.05); }
.tt-tab.is-active { background: #002147; color: #fff; }
.tt-dot { display: inline-block; width: 6px; height: 6px; border-radius: 999px;
  background: var(--tt-accent, #FF4D12); }
.tt-tab .tt-dot { width: 4px; height: 4px; margin-left: 4px; vertical-align: middle; }
.tt-list { overflow-y: auto; flex: 1; }
.tt-item { display: block; width: 100%; text-align: left; cursor: pointer;
  padding: 12px 16px; border: none; border-bottom: 1px solid rgba(0,33,71,0.1);
  background: none; transition: background .15s; font-family: inherit; }
.tt-item:hover, .tt-item.is-selected { background: rgba(0,33,71,0.05); }
.tt-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
.tt-name { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(0,33,71,0.5); }
.tt-sample { display: block; color: #002147; line-height: 1.15; }
.tt-footer { border-top: 2px solid #002147; padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between; background: #C8E4CC; gap: 12px; }
.tt-hint { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(0,33,71,0.4); line-height: 1.35; max-width: 55%; }
.tt-cta { background: #002147; color: #fff; border: none; cursor: pointer;
  font-family: inherit; font-size: 10px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.15em; padding: 8px 12px; transition: background .2s; white-space: nowrap; }
.tt-cta:hover { background: #0A3563; }
`;

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);

  if (!document.getElementById(FONTS_PRECONNECT_ID)) {
    const pre = document.createElement('link');
    pre.id = FONTS_PRECONNECT_ID;
    pre.rel = 'preconnect';
    pre.href = 'https://fonts.gstatic.com';
    pre.crossOrigin = 'anonymous';
    document.head.appendChild(pre);
    // Ensure the panel's own Plex Mono chrome renders even if the host omits it
    ensureSpec('IBM+Plex+Mono:wght@400;500;600');
  }
}

function ensureSpec(spec?: string) {
  if (typeof document === 'undefined' || !spec || loadedSpecs.has(spec)) return;
  loadedSpecs.add(spec);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  document.head.appendChild(link);
}

export function TypeTweaker({
  roles = defaultRoles,
  storageKey = 'type-tweaker',
  accent = '#FF4D12',
  defaultOpen = false,
  loadGoogleFonts = true,
}: TypeTweakerProps) {
  const posKey = `${storageKey}:pos`;
  const selKey = `${storageKey}:selections`;

  const roleByKey = (key: string) => roles.find(r => r.key === key)!;
  const defaultFor = (role: TweakerRole) => role.default;

  const readStored = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(selKey) || '{}');
    } catch {
      return {};
    }
  };
  const readPos = (): { x: number; y: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(posKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [open, setOpen] = useState(defaultOpen);
  const [activeRole, setActiveRole] = useState<string>(roles[0]?.key);
  const [selections, setSelections] = useState<Record<string, string>>(readStored);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(readPos);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;

  const loadSpec = (font: FontOption) => {
    if (loadGoogleFonts) ensureSpec(font.spec);
  };

  const applyFont = (roleKey: string, name: string) => {
    if (typeof document === 'undefined') return;
    const role = roleByKey(roleKey);
    if (name === defaultFor(role)) {
      document.documentElement.style.removeProperty(role.cssVar);
    } else {
      document.documentElement.style.setProperty(role.cssVar, `"${name}", ${role.fallback}`);
    }
  };

  // Inject stylesheet + re-apply persisted picks on mount
  useEffect(() => {
    injectStyles();
    const stored = readStored();
    Object.keys(stored).forEach(roleKey => {
      const role = roles.find(r => r.key === roleKey);
      const font = role?.fonts.find(f => f.name === stored[roleKey]);
      if (role && font) {
        loadSpec(font);
        applyFont(roleKey, font.name);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Load every candidate for the open role so each renders in its own face
  useEffect(() => {
    if (open) roleByKey(activeRole).fonts.forEach(loadSpec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeRole]);

  const clampPos = (p: { x: number; y: number }, w: number, h: number) => {
    const maxX = Math.max(8, window.innerWidth - w - 8);
    const maxY = Math.max(8, window.innerHeight - h - 8);
    return { x: Math.min(Math.max(8, p.x), maxX), y: Math.min(Math.max(8, p.y), maxY) };
  };

  const onDragStart = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    const el = panelRef.current;
    if (!d || !el) return;
    d.moved = true;
    setPos(clampPos({ x: e.clientX - d.dx, y: e.clientY - d.dy }, el.offsetWidth, el.offsetHeight));
  };
  const onDragEnd = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (d?.moved && pos) localStorage.setItem(posKey, JSON.stringify(pos));
  };

  useEffect(() => {
    if (!pos) return;
    const onResize = () => {
      const el = panelRef.current;
      if (el) setPos(p => (p ? clampPos(p, el.offsetWidth, el.offsetHeight) : p));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  const currentFor = (roleKey: string) => selections[roleKey] ?? defaultFor(roleByKey(roleKey));

  const select = (roleKey: string, name: string) => {
    const next = { ...selectionsRef.current };
    if (name === defaultFor(roleByKey(roleKey))) delete next[roleKey];
    else next[roleKey] = name;
    setSelections(next);
    localStorage.setItem(selKey, JSON.stringify(next));
    applyFont(roleKey, name);
  };
  const preview = (roleKey: string, font: FontOption) => {
    loadSpec(font);
    applyFont(roleKey, font.name);
  };
  const endPreview = (roleKey: string) => applyFont(roleKey, currentFor(roleKey));

  const resetAll = () => {
    roles.forEach(r => applyFont(r.key, defaultFor(r)));
    setSelections({});
    localStorage.removeItem(selKey);
  };

  const copyStack = async () => {
    const lines = roles.map(r => `${r.label}: ${currentFor(r.key)}`);
    const specs = roles
      .map(r => roleByKey(r.key).fonts.find(f => f.name === currentFor(r.key)))
      .filter((f): f is FontOption => !!f && !!f.spec)
      .map(f => f.spec as string);
    const url = specs.length
      ? `https://fonts.googleapis.com/css2?${[...new Set(specs)].map(s => `family=${s}`).join('&')}&display=swap`
      : '(all system / self-hosted fonts)';
    try {
      await navigator.clipboard.writeText(`${lines.join('\n')}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const dirty = Object.keys(selections).length > 0;
  const accentVar = { '--tt-accent': accent } as CSSProperties;
  const posStyle: CSSProperties | undefined = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : undefined;

  if (!open) {
    return (
      <div className="tt-root">
        <button
          className="tt-fab"
          style={{ ...accentVar, ...posStyle }}
          title="Type tweaker"
          onClick={() => setOpen(true)}
        >
          <span className="tt-aa">Aa</span>
          Type
          {dirty && <span className="tt-dot" />}
        </button>
      </div>
    );
  }

  const role = roleByKey(activeRole);

  return (
    <div className="tt-root">
      <div className="tt-panel" ref={panelRef} style={{ ...accentVar, ...posStyle }}>
        <div className="tt-header" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd}>
          <span className="tt-title">
            <span className="tt-grip" aria-hidden="true">⠿</span>
            Type Tweaker
          </span>
          <span className="tt-hbtns">
            <button className="tt-ghost" onClick={resetAll}>Reset</button>
            <button className="tt-ghost tt-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          </span>
        </div>

        <div className="tt-tabs">
          {roles.map(r => (
            <button
              key={r.key}
              className={`tt-tab${activeRole === r.key ? ' is-active' : ''}`}
              onClick={() => setActiveRole(r.key)}
            >
              {r.label}
              {selections[r.key] && <span className="tt-dot" />}
            </button>
          ))}
        </div>

        <div className="tt-list" onMouseLeave={() => endPreview(activeRole)}>
          {role.fonts.map(font => {
            const isSelected = currentFor(activeRole) === font.name;
            const isDefault = defaultFor(role) === font.name;
            return (
              <button
                key={font.name}
                className={`tt-item${isSelected ? ' is-selected' : ''}`}
                onClick={() => select(activeRole, font.name)}
                onMouseEnter={() => preview(activeRole, font)}
              >
                <span className="tt-meta">
                  <span className="tt-name">
                    {font.name}
                    {isDefault && ' · current'}
                  </span>
                  {isSelected && <span className="tt-dot" />}
                </span>
                <span
                  className="tt-sample"
                  style={{ fontFamily: `"${font.name}", ${role.fallback}`, ...role.sampleStyle }}
                >
                  {role.sample}
                </span>
              </button>
            );
          })}
        </div>

        <div className="tt-footer">
          <span className="tt-hint">Hover previews · click selects.</span>
          <button className="tt-cta" onClick={copyStack}>
            {copied ? '✓ Copied' : 'Copy stack'}
          </button>
        </div>
      </div>
    </div>
  );
}
