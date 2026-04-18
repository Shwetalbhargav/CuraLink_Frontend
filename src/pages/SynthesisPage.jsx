import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";

export function SynthesisPage() {
  const [payload, setPayload] = useState({ disease: "obesity", query: "GLP-1 comparison" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSynthesis(activePayload = payload) {
    setLoading(true);
    setError("");

    try {
      const data = await api.synthesizeResearch({
        ...activePayload,
        template: "deep-synthesis",
        format: "ui-sections",
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSynthesis(payload);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await runSynthesis(payload);
  }

  const sections = result?.rendered?.sections || [];
  const sourceCards = result?.rendered?.sourceCards || [];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Synthesis Lab"
        title="Deep Synthesis & Insight View"
        description="Live synthesis using the backend compare-and-render flow with structured sections and source cards."
      />

      <form onSubmit={handleSubmit} className="search-bar-panel search-grid-panel">
        <input
          value={payload.disease}
          onChange={(event) => setPayload((previous) => ({ ...previous, disease: event.target.value }))}
          placeholder="Disease"
        />
        <input
          value={payload.query}
          onChange={(event) => setPayload((previous) => ({ ...previous, query: event.target.value }))}
          placeholder="Comparative query"
        />
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Synthesizing..." : "Synthesize"}
        </button>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Building synthesis from live backend data...</div> : null}

      {result ? (
        <>
          <div className="metrics-grid">
            <MetricCard label="Publications" value={result.retrievalMeta?.returned?.publications || 0} />
            <MetricCard label="Trials" value={result.retrievalMeta?.returned?.clinicalTrials || 0} />
            <MetricCard label="Source Cards" value={sourceCards.length} />
          </div>

          <div className="two-column-grid">
            <div className="panel">
              <div className="section-heading-row">
                <h3>{result.rendered?.headline || "Evidence synthesis"}</h3>
                <span className="muted">{payload.disease}</span>
              </div>
              <div className="list-stack">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id || section.title || sectionIndex} className="section-block compact-block">
                    <h4>{section.title || `Section ${sectionIndex + 1}`}</h4>
                    {section.content ? <p>{section.content}</p> : null}
                    {section.items?.length ? (
                      <div className="list-stack">
                        {section.items.map((item, itemIndex) => (
                          <div
                            className="list-card"
                            key={item.id || item.heading || item.title || itemIndex}
                          >
                            <strong>
                              {item.heading || item.title || item.status || `Item ${itemIndex + 1}`}
                            </strong>
                            <span>{item.summary || item.contact || item.content || "No detail returned."}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                {!sections.length ? (
                  <div className="empty-state">The backend returned no rendered sections for this synthesis.</div>
                ) : null}
              </div>
            </div>

            <div className="panel">
              <div className="section-heading-row">
                <h3>Referenced Sources</h3>
                <span className="muted">{sourceCards.length} cards</span>
              </div>
              <div className="list-stack">
                {sourceCards.map((source, index) => (
                  <div key={source.id || source.url || index} className="list-card">
                    <strong>{source.title || `Source ${index + 1}`}</strong>
                    <span>
                      {source.platform || source.source || "Research source"}
                      {source.year ? ` | ${source.year}` : ""}
                    </span>
                  </div>
                ))}
                {!sourceCards.length ? (
                  <div className="empty-state">No source cards were returned by the rendering endpoint.</div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}