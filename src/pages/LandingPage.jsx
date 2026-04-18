import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatureGrid } from "../components/landing/LandingFeatureGrid";
import { LandingSignals } from "../components/landing/LandingSignals";
import { LandingTrust } from "../components/landing/LandingTrust";
import { LandingCta } from "../components/landing/LandingCta";
import { LandingFooter } from "../components/landing/LandingFooter";

function extractPromptHighlights(signals) {
  const publicationHighlights = (signals?.publications || [])
    .slice(0, 2)
    .map((item) => item.title)
    .filter(Boolean);

  const trialHighlights = (signals?.clinicalTrials || [])
    .slice(0, 1)
    .map((item) => item.title)
    .filter(Boolean);

  const synthesisHighlights = (signals?.synthesis?.rendered?.sections || [])
    .flatMap((section) => (section.items || []).map((item) => item.heading || item.title || item.summary))
    .filter(Boolean)
    .slice(0, 2);

  return [...publicationHighlights, ...trialHighlights, ...synthesisHighlights].slice(0, 5);
}

export function LandingPage() {
  const [signals, setSignals] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSignals() {
      setLoading(true);
      setError("");

      try {
        const data = await api.getLandingSignals();
        if (!cancelled) {
          setSignals(data);
          if (data.errors?.length) {
            setError(data.errors[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSignals();

    return () => {
      cancelled = true;
    };
  }, []);

  const promptHighlights = useMemo(() => extractPromptHighlights(signals), [signals]);

  return (
    <div className="landing-page landing-page-rich">
      <LandingHeader />
      <LandingHero promptHighlights={promptHighlights} />
      <LandingFeatureGrid />
      <LandingSignals
        loading={loading}
        error={error}
        signals={signals}
        promptHighlights={promptHighlights}
      />
      <LandingTrust />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}