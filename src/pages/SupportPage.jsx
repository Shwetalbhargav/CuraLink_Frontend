import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";

export function SupportPage() {
  const [faqs, setFaqs] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.getSupportFaqs().then((data) => setFaqs(data.items || []));
    api.getSupportStatus().then(setStatus);
  }, []);

  return (
    <section className="page-section">
      <PageHeader eyebrow="Support" title="How can we assist your research?" description="Find platform documentation, service health, and support contact paths curated for research workflows." />
      <div className="two-column-grid">
        <div className="panel">
          <h3>Frequently Asked Questions</h3>
          <div className="list-stack">
            {faqs.map((faq) => (
              <div key={faq.id} className="list-card">
                <strong>{faq.question}</strong>
                <span>{faq.answer}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Service Health</h3>
          <div className="list-stack">
            <div className="trend-row"><span>Status</span><strong>{status?.serviceHealth || "Loading..."}</strong></div>
            <div className="trend-row"><span>Analysis Pipeline</span><strong>{status?.analysisPipeline || "-"}</strong></div>
            <div className="trend-row"><span>Mean Response</span><strong>{status?.responseTimeMs || "-"} ms</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

