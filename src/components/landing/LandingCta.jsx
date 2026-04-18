import { Link } from "react-router-dom";

export function LandingCta() {
  return (
    <section className="landing-cta-section">
      <div className="landing-cta-card">
        <h2>Ready to precision-scale your research?</h2>
        <p>
          Use the dashboard, chat, library discovery, and deep synthesis views as one connected research workflow.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/dashboard">Request Institutional Access</Link>
          <Link className="ghost-button" to="/support">Speak to a Specialist</Link>
        </div>
      </div>
    </section>
  );
}