import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const navItems = [
  { id: "current", label: "Current Chat", marker: "[]", active: true },
  { id: "history", label: "History", marker: "()" },
  { id: "library", label: "Library", marker: "##" },
  { id: "insights", label: "Insights", marker: "!!" },
];

const footerItems = [
  { id: "archive", label: "Archive", marker: "AR" },
  { id: "support", label: "Support", marker: "?" },
];

const locationSuggestions = [
  "Toronto, Canada",
  "New York, USA",
  "California, USA",
  "Texas, USA",
  "Florida, USA",
  "London, UK",
];

function timestampLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createAssistantMessage(response) {
  const answer = response?.answer || {};
  const rendered = response?.rendered || {};
  const sources = rendered.sourceCards || response?.sources || [];
  const insights = answer.researchInsights || [];
  const content = sanitizeText(answer.summary || answer.conditionOverview || "Response received.");
  const secondary = sanitizeText(insights[0]?.summary || insights[0]?.content || "");
  const publications = response?.retrievalMeta?.returned?.publications ?? 0;
  const clinicalTrials = response?.retrievalMeta?.returned?.clinicalTrials ?? 0;

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    title: "Precision Analysis",
    paragraphs: [content, secondary].filter(Boolean),
    sources,
    retrievalMeta: response?.retrievalMeta || {},
    evidence: response?.rankedEvidence || { publications: [], clinicalTrials: [] },
    metrics: [
      { label: "Publications Reviewed", value: publications || sources.length || "n/a", tone: "secondary" },
      { label: "Clinical Trials Ranked", value: clinicalTrials || "n/a", tone: "primary" },
    ],
    timestamp: timestampLabel(),
  };
}

function buildWelcomeMessage() {
  return {
    id: "assistant-welcome",
    role: "assistant",
    title: "Precision Analysis",
    paragraphs: [
      "Enter a disease area, location, and research question. I will retrieve recent studies, clinical trials, and synthesis-ready evidence.",
    ],
    sources: [],
    retrievalMeta: {},
    evidence: { publications: [], clinicalTrials: [] },
    metrics: [],
    timestamp: "just now",
  };
}

function EvidenceSection({ title, items, emptyText }) {
  return (
    <div className="chat-evidence-section">
      <h4>{title}</h4>
      <div className="chat-evidence-list">
        {items.map((item, index) => (
          <article key={item.id || `${title}-${index}`} className="chat-evidence-item">
            <div className="chat-evidence-item-head">
              <strong>{item.title || `Result ${index + 1}`}</strong>
              <span className={`evidence-confidence evidence-confidence-${item.ranking?.confidence || "low"}`}>
                {item.ranking?.confidence || "low"}
              </span>
            </div>
            <p>{sanitizeText(item.snippet || item.summary || item.location || "No summary available.")}</p>
            <div className="chat-evidence-meta">
              <span>{item.platform || item.type}</span>
              {item.year ? <span>{item.year}</span> : null}
              {item.status ? <span>{item.status}</span> : null}
              {item.location ? <span>{item.location}</span> : null}
              {typeof item.score === "number" ? <span>score {item.score}</span> : null}
            </div>
            {item.ranking?.explanation ? <div className="chat-evidence-reason">{item.ranking.explanation}</div> : null}
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="chat-evidence-link">
                Open source
              </a>
            ) : null}
          </article>
        ))}
        {!items.length ? <div className="chat-evidence-empty">{emptyText}</div> : null}
      </div>
    </div>
  );
}

export function ChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [location, setLocation] = useState("");
  const [disease, setDisease] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([buildWelcomeMessage()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const threadRef = useRef(null);

  useEffect(() => {
    const node = threadRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading]);

  async function submitStructuredQuery({ patientNameValue, locationValue, diseaseValue, queryValue }) {
    const trimmedQuery = queryValue.trim();
    const trimmedLocation = locationValue.trim();
    const trimmedDisease = diseaseValue.trim();
    const trimmedPatientName = patientNameValue.trim();

    if (!trimmedLocation || !trimmedDisease || !trimmedQuery) {
      setError("Location, disease, and research question are required.");
      return;
    }

    setError("");
    setLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuery,
      timestamp: timestampLabel(),
    };

    try {
      let activeSessionId = sessionId;
      let activeConversationId = conversationId;

      if (!activeSessionId) {
        const session = await api.createChatSession({
          patientName: trimmedPatientName,
          disease: trimmedDisease,
          location: trimmedLocation,
          intent: "general-medical-research",
          title: `${trimmedDisease} research session`,
        });
        activeSessionId = session.sessionId || "";
        activeConversationId = session.conversationId || "";
        setSessionId(activeSessionId);
        setConversationId(activeConversationId);
      }

      setMessages((previous) => [...previous, userMessage]);

      const data = await api.sendChatMessage({
        sessionId: activeSessionId,
        patientName: trimmedPatientName,
        disease: trimmedDisease,
        location: trimmedLocation,
        message: trimmedQuery,
      });

      const assistantMessage = createAssistantMessage(data);
      setConversationId(data.conversationId || activeConversationId);
      setMessages((previous) => [...previous, assistantMessage]);
      setHasStarted(true);
      setPatientName(trimmedPatientName);
      setLocation(trimmedLocation);
      setDisease(trimmedDisease);
      setMessage("");
    } catch (err) {
      setMessages((previous) => previous.filter((item) => item.id !== userMessage.id));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleIntakeSubmit(event) {
    event.preventDefault();
    await submitStructuredQuery({
      patientNameValue: patientName,
      locationValue: location,
      diseaseValue: disease,
      queryValue: message,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    if (!hasStarted) {
      await handleIntakeSubmit(event);
      return;
    }

    await submitStructuredQuery({
      patientNameValue: patientName,
      locationValue: location,
      diseaseValue: disease,
      queryValue: trimmedMessage,
    });
  }

  const threadMessages = useMemo(
    () => messages.filter((item) => item.role === "user" || item.role === "assistant"),
    [messages]
  );

  return (
    <section className="chat-window-page">
      <header className="chat-window-topbar">
        <div className="chat-window-brand-row">
          <h1>Clinical Precision</h1>
          <nav>
            <a href="#">Studies</a>
            <a href="#">Abstracts</a>
            <a href="#">Protocol</a>
          </nav>
        </div>
        <div className="chat-window-topbar-actions">
          <button type="button" className="chat-window-icon-button">!</button>
          <button type="button" className="chat-window-icon-button">*</button>
          <div className="chat-window-avatar">AI</div>
        </div>
      </header>

      <div className="chat-window-layout">
        <aside className="chat-window-sidebar">
          <div className="chat-window-sidebar-brand">
            <div className="chat-window-sidebar-logo">AI</div>
            <div>
              <strong>Precision AI</strong>
              <span>Clinical Assistant</span>
            </div>
          </div>

          <nav className="chat-window-side-nav">
            {navItems.map((item) => (
              <button key={item.id} type="button" className={item.active ? "chat-window-side-item active" : "chat-window-side-item"}>
                <span className="side-item-marker">{item.marker}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button type="button" className="chat-window-new-session">New Research Session</button>

          <div className="chat-window-side-footer">
            {footerItems.map((item) => (
              <button key={item.id} type="button" className="chat-window-side-footer-item">
                <span className="side-item-marker">{item.marker}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-window-main">
          <div className="chat-window-persona">
            <div className="chat-window-persona-icon-wrap">
              <div className="chat-window-persona-icon">AI</div>
            </div>
            <h2>Precision AI</h2>
            <div className="chat-window-status-pill">
              <span className="status-dot" />
              <span>{loading ? "Validating Source Stack" : hasStarted ? "Synthesizing Complex Data" : "Ready for Structured Intake"}</span>
            </div>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          {!hasStarted ? (
            <form className="chat-intake-card" onSubmit={handleIntakeSubmit}>
              <div className="chat-window-analysis-kicker">
                <span className="analysis-dot" />
                <span>Structured Intake</span>
              </div>
              <div className="chat-intake-grid">
                <label className="chat-intake-field">
                  <span>Patient Name (optional)</span>
                  <input value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="John Smith" />
                </label>
                <label className="chat-intake-field">
                  <span>Location</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Toronto, Canada" list="location-suggestions" />
                </label>
                <label className="chat-intake-field">
                  <span>Disease of Interest</span>
                  <input value={disease} onChange={(event) => setDisease(event.target.value)} placeholder="Parkinson's disease" />
                </label>
                <label className="chat-intake-field chat-intake-field-wide">
                  <span>What would you like to enquire about?</span>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Deep Brain Stimulation" rows={3} />
                </label>
              </div>
              <datalist id="location-suggestions">
                {locationSuggestions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <div className="chat-intake-hint">
                The system will expand your query intelligently, for example: <strong>Deep Brain Stimulation + Parkinson's disease</strong>
              </div>
              <button type="submit" className="chat-intake-submit" disabled={loading || !location.trim() || !disease.trim() || !message.trim()}>
                {loading ? "Starting Research..." : "Start Conversation"}
              </button>
            </form>
          ) : null}

          <div className="chat-window-thread" ref={threadRef}>
            {threadMessages.map((item) =>
              item.role === "user" ? (
                <div key={item.id} className="chat-window-user-row">
                  <div className="chat-window-user-bubble">{item.content}</div>
                  <span className="chat-window-meta">Researcher | {item.timestamp}</span>
                </div>
              ) : (
                <div key={item.id} className="chat-window-assistant-row">
                  <div className="chat-window-assistant-card">
                    <div className="chat-window-analysis-kicker">
                      <span className="analysis-dot" />
                      <span>{item.title}</span>
                    </div>

                    <div className="chat-window-analysis-copy">
                      {item.paragraphs.map((paragraph, index) => (
                        <p key={`${item.id}-${index}`}>{paragraph}</p>
                      ))}
                    </div>

                    {item.metrics?.length ? (
                      <div className="chat-window-metrics-grid">
                        {item.metrics.map((metric) => (
                          <div key={metric.label} className={metric.tone === "primary" ? "chat-window-metric-card primary" : "chat-window-metric-card"}>
                            <div className="metric-card-label">{metric.label}</div>
                            <div className="metric-card-value">{metric.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <details className="chat-report-panel" open>
                      <summary>Open Research Report</summary>
                      <div className="chat-report-grid">
                        <EvidenceSection
                          title="Ranked Publications"
                          items={item.evidence?.publications || []}
                          emptyText="No ranked publications were returned for this answer."
                        />
                        <EvidenceSection
                          title="Ranked Clinical Trials"
                          items={item.evidence?.clinicalTrials || []}
                          emptyText="No ranked clinical trials were returned for this answer."
                        />
                      </div>
                    </details>

                    {item.sources?.length ? (
                      <div className="chat-window-citations">
                        {item.sources.slice(0, 4).map((source, index) => (
                          <button key={source.id || source.url || index} type="button" className="chat-window-citation-chip">
                            <span>DOC</span>
                            <span>{source.title || `Source ${index + 1}`}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="chat-window-meta">Precision AI | {item.timestamp}</span>
                </div>
              )
            )}

            {loading && hasStarted ? (
              <div className="chat-window-typing-row">
                <div className="chat-window-typing-pill">
                  <div className="typing-dots compact">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Validating source 4...</span>
                </div>
              </div>
            ) : null}
          </div>

          {hasStarted ? (
            <div className="chat-window-context-banner">
              <span><strong>Disease:</strong> {disease}</span>
              <span><strong>Location:</strong> {location}</span>
              {patientName ? <span><strong>Patient:</strong> {patientName}</span> : null}
            </div>
          ) : null}

          <div className="chat-window-composer-zone">
            <form className="chat-window-composer" onSubmit={handleSubmit}>
              <button type="button" className="composer-icon-button">+</button>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={hasStarted ? "Ask a follow-up question..." : "Enter the research question to start the conversation..."}
                rows={1}
                disabled={loading}
                className="chat-window-composer-input"
              />
              <button type="button" className="composer-icon-button">M</button>
              <button type="submit" className="chat-window-send-button" disabled={loading || !message.trim() || (!hasStarted && (!location.trim() || !disease.trim()))}>
                &gt;
              </button>
            </form>

            <div className="chat-window-actions">
              <button type="button">Summarize Findings</button>
              <button type="button">Export to Protocol</button>
              <button type="button">Share Citation</button>
            </div>

            <div className="chat-window-aux-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/literature">Library Discovery</Link>
              <Link to="/clinical-trials">Clinical Trials</Link>
              <span>Session {sessionId || "pending"}</span>
              <span>Conversation {conversationId || "pending"}</span>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}