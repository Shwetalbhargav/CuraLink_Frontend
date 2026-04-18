import { Link } from "react-router-dom";

function SourceColumn({ title, items, renderMeta }) {
  return (
    <article className="signal-column">
      <div className="signal-column-header">
        <h3>{title}</h3>
        <span>{items.length} items</span>
      </div>
      <div className="signal-list">
        {items.map((item, index) => (
          <div key={item.id || item.url || index} className="signal-card">
            <strong>{item.title || `Item ${index + 1}`}</strong>
            <p>{item.summary || item.snippet || item.abstract || "No detail returned."}</p>
            <span>{renderMeta(item)}</span>
          </div>
        ))}
        {!items.length ? <div className="empty-state compact-empty">No live items available yet.</div> : null}
      </div>
    </article>
  );
}

export function LandingSignals({ loading, error, signals, promptHighlights = [] }) {
  const publications = signals?.publications || [];
  const clinicalTrials = signals?.clinicalTrials || [];
  const synthesisSections = signals?.synthesis?.rendered?.sections || [];
  const synthesisHeadline = signals?.synthesis?.rendered?.headline || "Live Evidence Pulse";

  return (
    <section className="landing-signals-section" id="signals">
      <div className="landing-signals-copy">
        <div>
          <span className="landing-kicker">Live Research Signals</span>
          <h2>Fresh prompts from publications, trials, and synthesis</h2>
          <p>
            Surface recent clinical movement without promoting any single sponsor or vendor. Use these as prompt starters for chat and synthesis.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" to="/chat">Open Chat</Link>
          <Link className="ghost-button" to="/clinical-trials">Explore Trials</Link>
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading live research signals...</div> : null}

      {!loading ? (
        <div className="landing-signals-grid">
          <SourceColumn
            title="Latest Medical Research"
            items={publications}
            renderMeta={(item) => `${item.source || "Publication"} | ${item.publicationYear || "n/a"}`}
          />
          <SourceColumn
            title="Clinical Trial Momentum"
            items={clinicalTrials}
            renderMeta={(item) => `${item.recruitingStatus || "Unknown status"} | ${item.phase || "Trial"}`}
          />
          <article className="signal-column signal-column-accent">
            <div className="signal-column-header">
              <h3>{synthesisHeadline}</h3>
              <span>Synthesis</span>
            </div>
            <div className="signal-synthesis-panel">
              <div className="signal-prompt-list">
                {promptHighlights.map((item, index) => (
                  <button key={`${item}-${index}`} className="signal-prompt-button" type="button">
                    {item}
                  </button>
                ))}
                {!promptHighlights.length ? (
                  <div className="empty-state compact-empty">No prompt highlights were returned yet.</div>
                ) : null}
              </div>
              <div className="signal-synthesis-notes">
                {(synthesisSections || []).slice(0, 2).map((section, index) => (
                  <div key={section.id || index} className="signal-note-card">
                    <strong>{section.title || `Section ${index + 1}`}</strong>
                    <p>{section.content || section.items?.[0]?.summary || "No synthesis note returned."}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}