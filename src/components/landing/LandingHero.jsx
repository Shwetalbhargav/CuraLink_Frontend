import { Link } from "react-router-dom";

export function LandingHero({ promptHighlights = [] }) {
  return (
    <section className="landing-hero" id="product">
      <div className="landing-hero-copy">
        <span className="landing-kicker">Precision AI Synthesis</span>
        <h1>
          Accelerate Medical Discovery with <span>Evidence-Backed</span> AI.
        </h1>
        <p>
          Clinical Precision turns live clinical literature, active trials, and synthesis-ready evidence into a research workspace that starts useful from the first prompt.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/chat">Start Free Trial</Link>
          <Link className="ghost-button" to="/dashboard">Watch Demo</Link>
        </div>
        <div className="landing-prompt-row">
          {promptHighlights.slice(0, 3).map((item, index) => (
            <span key={`${item}-${index}`} className="landing-prompt-chip">{item}</span>
          ))}
        </div>
      </div>

      <div className="landing-hero-visual">
        <div className="landing-orb" />
        <div className="landing-hero-card">
          <div className="landing-hero-card-header">
            <span>Neural Synthesis Status</span>
            <strong>Active</strong>
          </div>
          <div className="signal-bars">
            <span style={{ width: "76%" }} />
            <span style={{ width: "54%" }} />
            <span style={{ width: "88%" }} />
          </div>
          <div className="landing-accuracy-card">
            <div className="landing-accuracy-icon">+</div>
            <div>
              <strong>98.4% Accuracy</strong>
              <p>Synthesis of multi-source medical evidence with citation-aware traceability.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}