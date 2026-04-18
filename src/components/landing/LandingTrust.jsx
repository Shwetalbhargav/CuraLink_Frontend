const testimonials = [
  {
    quote: "The speed at which Clinical Precision finds grounded research directions cuts hours off early-stage review.",
    author: "Dr. Elena Rodriguez",
    org: "Genomics Institute",
  },
  {
    quote: "The trial and publication views make it easier to spot which therapeutic stories deserve a deeper synthesis pass.",
    author: "Dr. Marcus Chen",
    org: "Global Health Alliance",
  },
];

export function LandingTrust() {
  return (
    <section className="landing-trust-section" id="institutions">
      <div className="landing-trust-copy">
        <h2>Trusted by Leading Institutions</h2>
        <p>
          Built for researchers who need a fast route from broad evidence retrieval to promptable clinical insight.
        </p>
        <div className="landing-logo-row">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="landing-testimonial-grid">
        {testimonials.map((item) => (
          <article key={item.author} className="testimonial-card">
            <div className="testimonial-quote-mark">"</div>
            <p>{item.quote}</p>
            <div>
              <strong>{item.author}</strong>
              <span>{item.org}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}