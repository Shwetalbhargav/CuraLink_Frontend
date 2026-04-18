const processSteps = [
  { id: "01", title: "Define Context", description: "Start from a disease area, uploaded dataset, or exploratory treatment question." },
  { id: "02", title: "Neural Ingestion", description: "Retrieve publications and trial signals across current medical sources." },
  { id: "03", title: "Logic Synthesis", description: "Turn scattered evidence into high-signal reasoning and promptable summaries." },
  { id: "04", title: "Evidence Map", description: "Move into chat, dashboard, or synthesis views with traceable source anchors." },
];

export function LandingFeatureGrid() {
  return (
    <>
      <section className="landing-feature-section" id="solutions">
        <div className="landing-section-copy">
          <h2>Precision-Engineered for Science</h2>
          <p>
            The V1 workspace focuses on fast retrieval, synthesis support, and research collaboration patterns that matter immediately.
          </p>
        </div>

        <div className="landing-feature-grid">
          <article className="feature-card feature-card-large">
            <div className="feature-icon">DB</div>
            <h3>Rapid Retrieval</h3>
            <p>
              Query ranked publications and active trials through a unified research workflow instead of searching sources one by one.
            </p>
            <div className="feature-stats">
              <div><strong>200M+</strong><span>Abstracts</span></div>
              <div><strong>50ms</strong><span>Latency target</span></div>
              <div><strong>100%</strong><span>Traceability</span></div>
            </div>
          </article>

          <article className="feature-card feature-card-dark">
            <div className="feature-icon">AI</div>
            <h3>Insight Synthesis</h3>
            <p>
              Generate compare-ready insight blocks from backend synthesis output instead of generic summaries.
            </p>
            <div className="feature-inline-card">
              <strong>New Hypothesis Found</strong>
              <span>Potential metabolic pathway signal identified across recent obesity treatment studies.</span>
            </div>
          </article>

          <article className="feature-card feature-card-wide">
            <div className="feature-copy">
              <div className="feature-icon">CO</div>
              <h3>Collaborative Workspace</h3>
              <p>
                Organize live research outputs into promptable workspaces, saved libraries, and downstream synthesis views.
              </p>
            </div>
            <div className="feature-team-card">
              <div className="feature-avatars">
                <span>ER</span>
                <span>MC</span>
                <span>AL</span>
                <span>+12</span>
              </div>
              <div className="feature-note">Dr. Aris added a note to Metabolic Pathways V4</div>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-process-section">
        <div className="landing-section-copy centered">
          <h2>From Query to Insight</h2>
          <p>A workflow designed around quick prompt entry and evidence-backed follow-up analysis.</p>
        </div>
        <div className="landing-process-grid">
          {processSteps.map((step) => (
            <article key={step.id} className="process-card">
              <div className="process-badge">{step.id}</div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}