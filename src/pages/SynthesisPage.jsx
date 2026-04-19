import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";
import { ResearchDetailModal } from "../components/ResearchDetailModal";

function formatEvidenceReason(item) {
  if (item.ranking?.explanation) {
    return item.ranking.explanation;
  }

  return "No ranking explanation returned.";
}

export function SynthesisPage() {
  const [payload, setPayload] = useState({
    disease: "obesity",
    query: "GLP-1 comparison",
    location: "Toronto, Canada",
  });
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  async function runSynthesis(activePayload = payload) {
    setLoading(true);
    setError("");

    try {
      const [synthesisData, comparisonData] = await Promise.all([
        api.synthesizeResearch({
          ...activePayload,
          template: "deep-synthesis",
          format: "ui-sections",
        }),
        api.compareResearch({
          ...activePayload,
          template: "deep-synthesis",
        }),
      ]);

      setResult(synthesisData);
      setComparison(comparisonData);
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
  const evidence = result?.evidence || { publications: [], clinicalTrials: [] };
  const comparisonItems = comparison?.comparison?.selectedItems || [];
  const comparisonMatrix = comparison?.comparison?.matrix || [];

  const highlightedSources = useMemo(
    () => [...evidence.publications.slice(0, 4), ...evidence.clinicalTrials.slice(0, 3)],
    [evidence]
  );

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Synthesis Lab"
        title="Deep Synthesis & Insight View"
        description="Inspect backend-generated synthesis sections together with ranked evidence, comparison output, and source attribution."
      />

      <form onSubmit={handleSubmit} className="panel research-filter-panel">
        <div className="research-filter-grid">
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
          <input
            value={payload.location}
            onChange={(event) => setPayload((previous) => ({ ...previous, location: event.target.value }))}
            placeholder="Location preference"
          />
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Synthesizing..." : "Synthesize"}
          </button>
        </div>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Building synthesis from live backend data...</div> : null}

      {result ? (
        <>
          <div className="metrics-grid">
            <MetricCard label="Publication Pool" value={result.retrievalMeta?.totals?.publications || 0} hint="Broad retrieval before ranking" />
            <MetricCard label="Trial Pool" value={result.retrievalMeta?.totals?.clinicalTrials || 0} hint="ClinicalTrials.gov retrieval depth" />
            <MetricCard label="Source Cards" value={sourceCards.length} hint="Rendered source attribution cards" />
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
                          <div className="list-card" key={item.id || item.heading || item.title || itemIndex}>
                            <strong>{item.heading || item.title || item.status || `Item ${itemIndex + 1}`}</strong>
                            <span>{item.summary || item.contact || item.content || item.location || "No detail returned."}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="section-heading-row">
                <h3>Comparison Highlights</h3>
                <span className="muted">{comparisonItems.length} selected</span>
              </div>
              <div className="list-stack">
                {comparisonItems.map((item, index) => (
                  <div key={item.id || index} className="list-card">
                    <strong>{item.title}</strong>
                    <span>
                      {item.platform || item.type}
                      {item.year ? ` | ${item.year}` : ""}
                      {typeof item.score === "number" ? ` | score ${item.score}` : ""}
                    </span>
                    <button type="button" className="ghost-button compact-action-button" onClick={() => setSelectedItem(item)}>
                      Inspect
                    </button>
                  </div>
                ))}
                {!comparisonItems.length ? (
                  <div className="empty-state">No comparison items were returned.</div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="two-column-grid">
            <div className="panel">
              <div className="section-heading-row">
                <h3>Ranked Publications</h3>
                <span className="muted">{evidence.publications?.length || 0} ranked</span>
              </div>
              <div className="list-stack">
                {(evidence.publications || []).map((item, index) => (
                  <div key={item.sourceId || index} className="list-card">
                    <strong>{item.title}</strong>
                    <span>
                      {item.platform}
                      {item.year ? ` | ${item.year}` : ""}
                      {typeof item.score === "number" ? ` | score ${item.score}` : ""}
                    </span>
                    <span>{formatEvidenceReason(item)}</span>
                    <div className="pill-row">
                      <span className="data-pill">{item.ranking?.confidence || "low"}</span>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="ghost-button compact-inline-link">
                          Open Source
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="section-heading-row">
                <h3>Ranked Clinical Trials</h3>
                <span className="muted">{evidence.clinicalTrials?.length || 0} ranked</span>
              </div>
              <div className="list-stack">
                {(evidence.clinicalTrials || []).map((item, index) => (
                  <div key={item.sourceId || index} className="list-card">
                    <strong>{item.title}</strong>
                    <span>
                      {item.status || "Unknown"}
                      {item.location ? ` | ${item.location}` : ""}
                      {typeof item.score === "number" ? ` | score ${item.score}` : ""}
                    </span>
                    <span>{formatEvidenceReason(item)}</span>
                    <div className="pill-row">
                      <span className="data-pill">{item.ranking?.confidence || "low"}</span>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="ghost-button compact-inline-link">
                          Open Source
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-heading-row">
              <h3>Referenced Sources</h3>
              <span className="muted">{sourceCards.length} cards</span>
            </div>
            <div className="card-grid compact-grid">
              {sourceCards.map((source, index) => (
                <div key={source.id || source.url || index} className="research-card">
                  <div className="card-meta">
                    <span>{source.platform || "Research source"}</span>
                    <strong>{source.year || "n/a"}</strong>
                  </div>
                  <h3>{source.title || `Source ${index + 1}`}</h3>
                  <p>{source.snippet || "No snippet returned."}</p>
                  <div className="research-card-actions">
                    <button type="button" className="ghost-button" onClick={() => setSelectedItem(source)}>
                      View Card
                    </button>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="primary-button research-inline-link">
                        Open Source
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {comparisonMatrix.length ? (
            <div className="panel">
              <div className="section-heading-row">
                <h3>Comparison Matrix</h3>
                <span className="muted">Backend compare output</span>
              </div>
              <div className="list-stack">
                {comparisonMatrix.map((item, index) => (
                  <div key={item.id || index} className="list-card">
                    <strong>{item.title}</strong>
                    <span>
                      {item.source || item.type}
                      {item.publicationYear ? ` | ${item.publicationYear}` : ""}
                      {item.status ? ` | ${item.status}` : ""}
                      {item.location ? ` | ${item.location}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <ResearchDetailModal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || "Evidence details"}
        subtitle={selectedItem?.platform || selectedItem?.source || selectedItem?.type || "Evidence item"}
        summary={selectedItem?.summary || selectedItem?.snippet || ""}
        meta={[
          { label: "Year", value: selectedItem?.year || selectedItem?.publicationYear || "Unavailable" },
          { label: "Score", value: selectedItem?.score ?? "Unavailable" },
          { label: "Status", value: selectedItem?.status || "Unavailable" },
          { label: "Location", value: selectedItem?.location || "Unavailable" },
        ]}
        sections={[
          {
            title: "Ranking Explanation",
            content: selectedItem?.ranking?.explanation || "No ranking explanation returned.",
          },
        ]}
        links={selectedItem?.url ? [{ label: "Open source", url: selectedItem.url }] : []}
      />
    </section>
  );
}
