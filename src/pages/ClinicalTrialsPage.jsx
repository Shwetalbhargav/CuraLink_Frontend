import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { ResearchDetailModal } from "../components/ResearchDetailModal";

const initialFilters = {
  query: "immunotherapy",
  disease: "lung cancer",
  location: "Toronto, Canada",
  status: "",
  phase: "",
  recruitingOnly: true,
};

export function ClinicalTrialsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  async function runSearch(activeFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const data = await api.searchClinicalTrials({
        query: activeFilters.query,
        disease: activeFilters.disease,
        location: activeFilters.location,
        status: activeFilters.status || undefined,
        phase: activeFilters.phase || undefined,
        recruitingOnly: activeFilters.recruitingOnly,
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

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    await runSearch(filters);
  }

  const items = result?.items || [];
  const diagnostics = result?.retrievalMeta?.diagnostics || {};

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Clinical Trials"
        title="Clinical Correlation Workspace"
        description="Inspect geographically filtered trial retrieval, eligibility data, and ranking-ready trial cards."
      />

      <form onSubmit={handleSearch} className="panel research-filter-panel">
        <div className="research-filter-grid">
          <input value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} placeholder="Search trials..." />
          <input value={filters.disease} onChange={(event) => updateFilter("disease", event.target.value)} placeholder="Disease context" />
          <input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="Preferred location" />
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">Any status</option>
            <option value="RECRUITING">Recruiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="ACTIVE_NOT_RECRUITING">Active, not recruiting</option>
          </select>
          <input value={filters.phase} onChange={(event) => updateFilter("phase", event.target.value)} placeholder="Phase filter" />
          <label className="research-checkbox">
            <input
              type="checkbox"
              checked={filters.recruitingOnly}
              onChange={(event) => updateFilter("recruitingOnly", event.target.checked)}
            />
            <span>Recruiting only</span>
          </label>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Searching..." : "Search Trials"}
          </button>
        </div>
      </form>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading clinical trial results...</div> : null}

      {result ? (
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Trials Retrieved</span>
            <strong className="metric-value">{result.retrievalMeta?.totals?.clinicalTrials || 0}</strong>
            <span className="metric-hint">Broad trial pool before ranking</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Ranked Trials</span>
            <strong className="metric-value">{result.total ?? items.length}</strong>
            <span className="metric-hint">Filtered by intent and location</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Location Preference</span>
            <strong className="metric-value">{filters.location || "Any"}</strong>
            <span className="metric-hint">Applied to retrieval and ranking</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="panel research-diagnostics-panel">
          <div className="section-heading-row">
            <h3>Trial Retrieval Diagnostics</h3>
            <span className="muted">
              {result.total ?? items.length} matches | page {result.page ?? 1}
            </span>
          </div>
          <div className="research-diagnostics-grid">
            <div className="list-card">
              <strong>ClinicalTrials.gov</strong>
              <span>{diagnostics.clinicalTrials?.count || 0} items</span>
              <span>{diagnostics.clinicalTrials?.queries?.join(" | ") || "No query"}</span>
            </div>
            <div className="list-card">
              <strong>Applied Filters</strong>
              <span>Status: {result.appliedFilters?.status || "Any"}</span>
              <span>Phase: {result.appliedFilters?.phase || "Any"}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card-grid">
        {items.map((item, index) => (
          <article key={item.id || item.url || index} className="research-card research-card-detailed">
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
            <div className="research-card-authors">
              Eligibility: {item.eligibilityCriteria ? item.eligibilityCriteria.slice(0, 160) : "Unavailable"}
            </div>
            <div className="pill-row">
              {(item.tags || []).map((tag) => (
                <span key={tag} className="data-pill">
                  {tag}
                </span>
              ))}
              <span className="data-pill">Score {item.score ?? "n/a"}</span>
            </div>
            <div className="research-card-actions">
              <button type="button" className="ghost-button" onClick={() => setSelectedItem(item)}>
                View Trial
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
        <div className="empty-state">No trials matched this query.</div>
      ) : null}

      <ResearchDetailModal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || "Trial details"}
        subtitle={selectedItem?.source || "Clinical trial"}
        summary={selectedItem?.summary || ""}
        meta={[
          { label: "Status", value: selectedItem?.recruitingStatus || "Unavailable" },
          { label: "Phase", value: selectedItem?.phase || "Unavailable" },
          { label: "Study Type", value: selectedItem?.studyType || "Unavailable" },
          { label: "Location", value: selectedItem?.location || "Unavailable" },
          { label: "Contact", value: selectedItem?.contactInformation || "Unavailable" },
          { label: "Score", value: selectedItem?.score ?? "Unavailable" },
        ]}
        sections={[
          {
            title: "Eligibility Criteria",
            content: selectedItem?.eligibilityCriteria || "No eligibility criteria returned.",
          },
          {
            title: "Relevance Context",
            items: [
              { label: "Disease", value: selectedItem?.relevance?.disease || "Unavailable" },
              { label: "Topic", value: selectedItem?.relevance?.topic || "Unavailable" },
              { label: "Location Preference", value: selectedItem?.relevance?.locationPreference || "Unavailable" },
            ],
          },
        ]}
        links={selectedItem?.url ? [{ label: "Open trial source", url: selectedItem.url }] : []}
      />
    </section>
  );
}
