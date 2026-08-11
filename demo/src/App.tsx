import { TypeTweaker } from '../../src';

export function App() {
  return (
    <>
      <div className="bg" aria-hidden="true" />

      <div className="wrap">
        <header className="topbar">
          <span className="brand">
            <span className="aa">Aa</span>
            Type&nbsp;Tweaker
          </span>
          <a href="https://github.com/iamkhayyam/type-tweaker" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </header>

        <section className="hero">
          <span className="kicker">
            <span className="rule" />
            React · zero-dependency · v0.1
            <span className="dot" />
          </span>

          <h1 className="display">Audition your<br />type, live.</h1>
          <div className="script">no rebuilds, no guesswork</div>

          <p className="lead">
            Type Tweaker is a draggable dev panel that hot-swaps your{' '}
            <b>CSS font variables</b> at <b>:root</b>. Hover a candidate to preview it on
            the real page, click to commit, drag the panel anywhere. Everything you see
            on this page is wired to those tokens — <b>so try it.</b>
          </p>

          <span className="hint">
            <span className="arrow">←</span>
            Open the panel · hover a font · watch this page change
          </span>
        </section>

        <div className="seclabel"><span className="n">01</span> Live specimen <span className="rule" /></div>

        <div className="grid">
          <div className="cell">
            <div className="var">Display <em>--font-display</em></div>
            <div className="spec-display">Grotesk backbone</div>
          </div>
          <div className="cell">
            <div className="var">Script <em>--font-script</em></div>
            <div className="spec-script">a Renaissance</div>
          </div>
          <div className="cell">
            <div className="var">Serif <em>--font-serif</em></div>
            <div className="spec-serif">It will be assembled.</div>
          </div>
          <div className="cell">
            <div className="var">Mono <em>--font-mono</em></div>
            <div className="spec-mono">3 : 4 : 5 : 7</div>
          </div>
          <div className="cell wide">
            <div className="var">Body <em>--font-sans</em></div>
            <p className="spec-body">
              The whole page reads from five custom properties. Type Tweaker never touches
              your components — it only rewrites the tokens on the document root, so a single
              hover re-skins the headline, this paragraph, the numerals, and the signature all
              at once. When you land on a combination you like, hit <b>Copy stack</b> for the
              names plus a ready-to-paste Google Fonts link.
            </p>
          </div>
        </div>

        <div className="seclabel"><span className="n">02</span> Drop it in <span className="rule" /></div>

        <pre className="code">
{`npm install type-tweaker`}
        </pre>

        <pre className="code" style={{ marginTop: 16 }}>
<span dangerouslySetInnerHTML={{ __html:
`<span class="k">import</span> { TypeTweaker } <span class="k">from</span> <span class="s">'type-tweaker'</span>;

<span class="k">export default function</span> App() {
  <span class="k">return</span> (
    &lt;&gt;
      {<span class="c">/* your app */</span>}
      {import.meta.env.DEV && &lt;<span class="k">TypeTweaker</span> /&gt;}
    &lt;/&gt;
  );
}` }} />
        </pre>

        <div className="features">
          <div className="feature">
            <h3>Live preview</h3>
            <p>Hover any candidate to see it on the real page. The menu renders each name in its own face.</p>
          </div>
          <div className="feature">
            <h3>Draggable</h3>
            <p>Grab the header and move it out of your way. Position is clamped and persisted across reloads.</p>
          </div>
          <div className="feature">
            <h3>Config-driven</h3>
            <p>Bind any tabs to any CSS variables with your own font lists. Ships a sensible default set.</p>
          </div>
          <div className="feature">
            <h3>Self-contained</h3>
            <p>Injects its own scoped styles. No Tailwind, no CSS import, no global leakage.</p>
          </div>
          <div className="feature">
            <h3>Copy stack</h3>
            <p>Export your picks plus a ready-to-paste Google Fonts URL when you commit to a combination.</p>
          </div>
          <div className="feature">
            <h3>Tree-shaken</h3>
            <p>Gate it behind <code>import.meta.env.DEV</code> and it drops clean out of production bundles.</p>
          </div>
        </div>

        <footer>
          <span>MIT © iamkhayyam</span>
          <span>
            Extracted from <a href="#" onClick={e => e.preventDefault()}>The Polyrhythmatics</a> · built with itself
          </span>
        </footer>
      </div>

      {/* The star of the show — open by default so visitors see it immediately */}
      <TypeTweaker defaultOpen storageKey="type-tweaker-demo" />
    </>
  );
}
