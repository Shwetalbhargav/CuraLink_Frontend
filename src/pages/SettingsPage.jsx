import { PageHeader } from "../components/PageHeader";

export function SettingsPage() {
  return (
    <section className="page-section">
      <PageHeader eyebrow="General Settings" title="Frontend-Only Settings View" description="This screen is intentionally frontend-only for MVP. Account, profile, and billing persistence are deferred." />
      <div className="two-column-grid">
        <div className="panel">
          <h3>Researcher Credentials</h3>
          <div className="form-stack">
            <input defaultValue="Dr. Elena Rodriguez" />
            <input defaultValue="0000-0002-1825-0097" />
            <input defaultValue="Computational Genomics & Oncology" />
          </div>
        </div>
        <div className="panel">
          <h3>Institutional Affiliation</h3>
          <div className="form-stack">
            <input defaultValue="St. Jude Children's Research Hospital" />
            <input defaultValue="Bioinformatics" />
            <input defaultValue="Senior Lead Investigator" />
          </div>
        </div>
      </div>
    </section>
  );
}

