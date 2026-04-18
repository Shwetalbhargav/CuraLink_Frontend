import { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError("");

      try {
        const overview = await api.getDashboardOverview();
        if (!cancelled) {
          setData(overview);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = data?.summary || {};
  const recentQueries = data?.recentQueries || [];
  const trending = data?.trending || [];
  const activeProjects = data?.activeProjects || data?.projects || [];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Research Terminal"
        title="Intelligence Accelerated"
        description="Live workspace metrics, recent clinical questions, and backend-fed research signals."
      />

      <div className="info-banner">
        <strong>Backend</strong>
        <span>{API_BASE_URL}</span>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-card">Loading dashboard data...</div> : null}

      {!loading ? (
        <>
          <div className="metrics-grid">
            <MetricCard label="Conversations" value={summary.conversations ?? 0} />
            <MetricCard label="Library Items" value={summary.libraryItems ?? 0} />
            <MetricCard label="Datasets" value={summary.datasets ?? 0} />
          </div>

          <div className="two-column-grid">
            <div className="panel">
              <div className="section-heading-row">
                <h3>Recent Queries</h3>
                <span className="muted">{recentQueries.length} tracked</span>
              </div>
              <div className="list-stack">
                {recentQueries.map((item, index) => (
                  <div
                    key={item.conversationId || item.id || `${item.title}-${index}`}
                    className="list-card"
                  >
                    <strong>{item.title || "Untitled conversation"}</strong>
                    <span>{item.summary || item.disease || "General research"}</span>
                  </div>
                ))}
                {!recentQueries.length ? (
                  <div className="empty-state">No recent queries returned by the backend yet.</div>
                ) : null}
              </div>
            </div>

            <div className="panel">
              <div className="section-heading-row">
                <h3>Trending Research</h3>
                <span className="muted">Signal feed</span>
              </div>
              <div className="list-stack">
                {trending.map((item, index) => (
                  <div key={item.label || `${index}`} className="trend-row trend-card">
                    <span>{item.label || item.topic || "Research topic"}</span>
                    <strong>{item.count ?? item.value ?? 0}</strong>
                  </div>
                ))}
                {!trending.length ? (
                  <div className="empty-state">No trend signals are available yet.</div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-heading-row">
              <h3>Active Projects</h3>
              <span className="muted">Derived from workspace overview</span>
            </div>
            <div className="card-grid compact-grid">
              {activeProjects.map((item, index) => (
                <article key={item.id || item.name || index} className="research-card">
                  <div className="card-meta">
                    <span>{item.status || "Active"}</span>
                    <strong>{item.updatedAt || item.updated || "Live"}</strong>
                  </div>
                  <h3>{item.name || item.title || `Project ${index + 1}`}</h3>
                  <p>{item.summary || item.description || "No project summary returned yet."}</p>
                </article>
              ))}
              {!activeProjects.length ? (
                <div className="empty-state">No active projects were returned by the backend.</div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}