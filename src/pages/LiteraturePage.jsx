import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";

export function LiteraturePage() {
  const [query, setQuery] = useState("triple negative breast cancer");
  const [disease, setDisease] = useState("breast cancer");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSearch(activeQuery = query, activeDisease = disease) {
    setLoading(true);
    setError("");

    try {
      const data = await api.searchPublications({
        query: activeQuery,
        disease: activeDisease,
        page: 1,
        limit: 6,
        sort: "relevance",
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
        eyebrow="Library Discovery"
        title="Search & Literature Discovery"
        description="Live publication search against the backend with ranked papers, metadata, and filter-aware result summaries."
      />

      <form onSubmit={handleSearch} className="search-bar-panel search-grid-panel">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search publications..."
        />
        <input
          value={disease}
          onChange={(event) => setDisease(event.target.value)}
          placeholder="Disease context"
        />
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Searching..." : "Analyze"}
        </button>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading publication results...</div> : null}

      {result ? (
        <div className="panel">
          <div className="section-heading-row">
            <h3>Results</h3>
            <span className="muted">
              {result.total ?? items.length} matches | page {result.page ?? 1}
            </span>
          </div>
          <div className="pill-row">
            <span className="data-pill">Limit {result.limit ?? items.length}</span>
            <span className="data-pill">Has more: {result.hasMore ? "Yes" : "No"}</span>
            {result.appliedFilters?.sort ? (
              <span className="data-pill">Sort: {result.appliedFilters.sort}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="card-grid">
        {items.map((item, index) => (
          <article key={item.id || item.url || index} className="research-card">
            <div className="card-meta">
              <span>{item.source || "Publication"}</span>
              <strong>{item.publicationYear || "n/a"}</strong>
            </div>
            <h3>{item.title || "Untitled paper"}</h3>
            <p>{item.snippet || item.abstract || "No abstract was returned."}</p>
            <div className="meta-row meta-wrap">
              <span>{item.journal || "Journal unavailable"}</span>
              <span>Score: {item.score ?? "n/a"}</span>
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
        <div className="empty-state">No publications matched this query.</div>
      ) : null}
    </section>
  );
}