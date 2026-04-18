import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";

export function ClinicalTrialsPage() {
  const [query, setQuery] = useState("immunotherapy");
  const [disease, setDisease] = useState("lung cancer");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(activeQuery = query, activeDisease = disease) {
    setLoading(true);
    setError("");

    try {
      const data = await api.searchClinicalTrials({
        query: activeQuery,
        disease: activeDisease,
        recruitingOnly: true,
        page: 1,
        limit: 6,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(query, disease);
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await runSearch();
  }

  const items = result?.items || [];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Clinical Trials"
        title="Clinical Correlation Workspace"
        description="Live recruiting-trial search with backend filters, normalized metadata, and compare-ready result cards."
      />

      <form onSubmit={handleSearch} className="search-bar-panel search-grid-panel">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search trials..." />
        <input value={disease} onChange={(event) => setDisease(event.target.value)} placeholder="Disease context" />
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Searching..." : "Search Trials"}
        </button>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading clinical trial results...</div> : null}

      {result ? (
        <div className="panel">
          <div className="section-heading-row">
            <h3>Trial Feed</h3>
            <span className="muted">
              {result.total ?? items.length} matches | page {result.page ?? 1}
            </span>
          </div>
          <div className="pill-row">
            <span className="data-pill">Has more: {result.hasMore ? "Yes" : "No"}</span>
            {result.appliedFilters?.status ? (
              <span className="data-pill">Status: {result.appliedFilters.status}</span>
            ) : null}
            {result.appliedFilters?.phase ? (
              <span className="data-pill">Phase: {result.appliedFilters.phase}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="card-grid">
        {items.map((item, index) => (
          <article key={item.id || item.url || index} className="research-card">
            <div className="card-meta">
              <span>{item.recruitingStatus || "Unknown status"}</span>
              <strong>{item.phase || "Trial"}</strong>
            </div>
            <h3>{item.title || "Untitled trial"}</h3>
            <p>{item.summary || "No trial summary was returned."}</p>
            <div className="meta-row meta-wrap">
              <span>{item.location || "Location unavailable"}</span>
              <span>{item.studyType || "Study type unavailable"}</span>
            </div>
            <div className="pill-row">
              {(item.tags || []).map((tag) => (
                <span key={tag} className="data-pill">
                  {tag}
                </span>
              ))}
              {item.saveSupported ? <span className="data-pill">Save supported</span> : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && result && !items.length ? (
        <div className="empty-state">No trials matched this query.</div>
      ) : null}
    </section>
  );
}