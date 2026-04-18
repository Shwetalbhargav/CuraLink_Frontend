import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";

export function LibraryPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getLibraryItems().then((data) => setItems(data.items || [])).catch((err) => setError(err.message));
  }, []);

  return (
    <section className="page-section">
      <PageHeader eyebrow="Collaboration Library" title="Saved Research & Collaboration Library" description="Persist research items, organize them into folders, and prepare them for export and review." />
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="table-panel">
        <div className="table-header"><span>Title</span><span>Type</span><span>Status</span><span>Updated</span></div>
        {(items || []).map((item) => (
          <div key={item.itemId} className="table-row">
            <span>{item.title}</span>
            <span>{item.type}</span>
            <span>{item.status}</span>
            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        ))}
        {!items.length ? <div className="table-row muted">No saved items yet.</div> : null}
      </div>
    </section>
  );
}

