import { Link } from "react-router-dom";

export function LandingHeader() {
  return (
    <header className="landing-topbar">
      <div className="landing-brand-row">
        <span className="landing-brand-mark">Clinical Precision</span>
        <nav className="landing-nav">
          <a href="#product">Product</a>
          <a href="#signals">Signals</a>
          <a href="#solutions">Solutions</a>
          <a href="#institutions">Institutions</a>
        </nav>
      </div>
      <div className="landing-topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">o</button>
        <button className="icon-button" type="button" aria-label="Settings">*</button>
        <Link className="primary-button" to="/dashboard">New Analysis</Link>
      </div>
    </header>
  );
}