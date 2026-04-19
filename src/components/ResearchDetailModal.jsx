export function ResearchDetailModal({
  open,
  title,
  subtitle,
  summary,
  meta = [],
  sections = [],
  links = [],
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="research-detail-modal-backdrop" onClick={onClose}>
      <div className="research-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="research-detail-modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <span>{subtitle}</span> : null}
          </div>
          <button type="button" className="research-detail-modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="research-detail-modal-content">
          {summary ? <p className="research-detail-summary">{summary}</p> : null}

          {meta.length ? (
            <div className="research-detail-meta-grid">
              {meta.map((item) => (
                <div key={item.label} className="research-detail-meta-item">
                  <strong>{item.label}</strong>
                  <span>{item.value || "Unavailable"}</span>
                </div>
              ))}
            </div>
          ) : null}

          {sections.map((section) => (
            <div key={section.title} className="research-detail-section">
              <h4>{section.title}</h4>
              {section.content ? <p>{section.content}</p> : null}
              {section.items?.length ? (
                <div className="research-detail-section-items">
                  {section.items.map((item, index) => (
                    <div key={item.label || item.heading || index} className="research-detail-section-item">
                      <strong>{item.label || item.heading || item.title || `Item ${index + 1}`}</strong>
                      <span>{item.value || item.summary || item.content || item.detail || "Unavailable"}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {links.length ? (
            <div className="research-detail-links">
              {links.map((link) =>
                link.url ? (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="research-detail-link"
                  >
                    {link.label}
                  </a>
                ) : null
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
