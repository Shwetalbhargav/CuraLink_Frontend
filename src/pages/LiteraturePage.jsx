import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { ResearchDetailModal } from "../components/ResearchDetailModal";

const initialFilters = {
  query: "triple negative breast cancer",
  disease: "breast cancer",
  source: "",
  sort: "relevance",
  dateFrom: "",
};

export function LiteraturePage() {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  async function runSearch(activeFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const data = await api.searchPublications({
        query: activeFilters.query,
        disease: activeFilters.disease,
        source: activeFilters.source || undefined,
        sort: activeFilters.sort,
        dateFrom: activeFilters.dateFrom || undefined,
        page: 1,
        limit: 8,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(filters);
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await runSearch(filters);
  }

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  const items = result?.items || [];
  const diagnostics = result?.retrievalMeta?.diagnostics || {};

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Library Discovery"
        title="Search & Literature Discovery"
        description="Inspect broad publication retrieval, ranking depth, and source attribution instead of only seeing a final shortlist."
      />

      <form onSubmit={handleSearch} className="panel research-filter-panel">
        <div className="research-filter-grid">
          <input
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="Search publications..."
          />
          <input
            value={filters.disease}
            onChange={(event) => updateFilter("disease", event.target.value)}
            placeholder="Disease context"
          />
          <select value={filters.source} onChange={(event) => updateFilter("source", event.target.value)}>
            <option value="">All sources</option>
            <option value="PubMed">PubMed</option>
            <option value="OpenAlex">OpenAlex</option>
          </select>
          <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
            <option value="relevance">Highest relevance</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <input
            value={filters.dateFrom}
            onChange={(event) => updateFilter("dateFrom", event.target.value)}
            placeholder="Published since year"
          />
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Searching..." : "Analyze"}
          </button>
        </div>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading publication results...</div> : null}

      {result ? (
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Candidates Retrieved</span>
            <strong className="metric-value">{result.retrievalMeta?.totals?.publications || 0}</strong>
            <span className="metric-hint">Broad pool before ranking</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Ranked Results</span>
            <strong className="metric-value">{result.total ?? items.length}</strong>
            <span className="metric-hint">Filtered publication shortlist</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Active Sources</span>
            <strong className="metric-value">
              {[diagnostics.openAlex?.count ? "OA" : "", diagnostics.pubMed?.count ? "PM" : ""]
                .filter(Boolean)
                .join(" + ") || "n/a"}
            </strong>
            <span className="metric-hint">OpenAlex and PubMed retrieval</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="panel research-diagnostics-panel">
          <div className="section-heading-row">
            <h3>Retrieval Diagnostics</h3>
            <span className="muted">
              {result.total ?? items.length} matches | page {result.page ?? 1}
            </span>
          </div>
          <div className="research-diagnostics-grid">
            <div className="list-card">
              <strong>OpenAlex</strong>
              <span>{diagnostics.openAlex?.count || 0} items</span>
              <span>{diagnostics.openAlex?.queries?.join(" | ") || "No query"}</span>
            </div>
            <div className="list-card">
              <strong>PubMed</strong>
              <span>{diagnostics.pubMed?.count || 0} items</span>
              <span>{diagnostics.pubMed?.queries?.join(" | ") || "No query"}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card-grid">
        {items.map((item, index) => (
          <article key={item.id || item.url || index} className="research-card research-card-detailed">
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
            <div className="research-card-authors">
              {item.authors?.length ? `Authors: ${item.authors.slice(0, 4).join(", ")}` : "Authors unavailable"}
            </div>
            <div className="pill-row">
              {(item.tags || []).map((tag) => (
                <span key={tag} className="data-pill">
                  {tag}
                </span>
              ))}
            </div>
            <div className="research-card-actions">
              <button type="button" className="ghost-button" onClick={() => setSelectedItem(item)}>
                View Details
              </button>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" className="primary-button research-inline-link">
                  Open Source
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && result && !items.length ? (
        <div className="empty-state">No publications matched this query.</div>
      ) : null}

      <ResearchDetailModal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || "Publication details"}
        subtitle={selectedItem?.source || "Publication"}
        summary={selectedItem?.abstract || selectedItem?.snippet || ""}
        meta={[
          { label: "Year", value: selectedItem?.publicationYear || "Unavailable" },
          { label: "Journal", value: selectedItem?.journal || "Unavailable" },
          { label: "Score", value: selectedItem?.score ?? "Unavailable" },
          { label: "Authors", value: selectedItem?.authors?.join(", ") || "Unavailable" },
        ]}
        sections={[
          {
            title: "Source Attribution",
            items: [
              { label: "Platform", value: selectedItem?.source || "Unavailable" },
              { label: "Snippet", value: selectedItem?.snippet || "Unavailable" },
            ],
          },
        ]}
        links={selectedItem?.url ? [{ label: "Open publication source", url: selectedItem.url }] : []}
      />
    </section>
  );
}
