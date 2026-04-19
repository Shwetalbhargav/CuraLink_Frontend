const DEFAULT_API_BASE_URL = "https://curalink-backend-q8ik.onrender.com/api/v1";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

function getErrorMessage(data, status) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return data?.message || data?.error || `Request failed: ${status}`;
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(`Unable to reach backend at ${API_BASE_URL}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  return data;
}

async function getLandingSignals() {
  const [publicationsResult, trialsResult, synthesisResult] = await Promise.allSettled([
    request("/publications/search", {
      method: "POST",
      body: JSON.stringify({
        query: "latest treatment advances",
        disease: "oncology",
        page: 1,
        limit: 3,
        sort: "latest",
      }),
    }),
    request("/clinical-trials/search", {
      method: "POST",
      body: JSON.stringify({
        query: "latest therapy",
        disease: "cancer",
        page: 1,
        limit: 3,
        recruitingOnly: true,
      }),
    }),
    request("/research/synthesize", {
      method: "POST",
      body: JSON.stringify({
        disease: "precision medicine",
        query: "latest treatment breakthroughs and promising clinical directions",
        template: "chat-card",
        format: "ui-sections",
      }),
    }),
  ]);

  return {
    publications: publicationsResult.status === "fulfilled" ? publicationsResult.value?.items || [] : [],
    clinicalTrials: trialsResult.status === "fulfilled" ? trialsResult.value?.items || [] : [],
    synthesis: synthesisResult.status === "fulfilled" ? synthesisResult.value : null,
    errors: [publicationsResult, trialsResult, synthesisResult]
      .filter((item) => item.status === "rejected")
      .map((item) => item.reason?.message || "Request failed"),
  };
}

export const api = {
  getDashboardOverview: () => request("/dashboard/overview"),
  getLandingSignals,
  getLibraryItems: () => request("/library"),
  getSupportFaqs: () => request("/support/faqs"),
  getSupportStatus: () => request("/support/status"),
  createChatSession: (payload = {}) =>
    request("/chat/session", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getChatHistory: (sessionId) => request(`/chat/session/${sessionId}/history`),
  sendChatMessage: (payload) =>
    request("/chat/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  searchPublications: (payload) =>
    request("/publications/search", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  searchClinicalTrials: (payload) =>
    request("/clinical-trials/search", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  synthesizeResearch: (payload) =>
    request("/research/synthesize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  compareResearch: (payload) =>
    request("/research/compare", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export { API_BASE_URL, DEFAULT_API_BASE_URL };
