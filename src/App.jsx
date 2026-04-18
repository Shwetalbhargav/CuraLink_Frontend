import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ChatPage } from "./pages/ChatPage";
import { LiteraturePage } from "./pages/LiteraturePage";
import { ClinicalTrialsPage } from "./pages/ClinicalTrialsPage";
import { SynthesisPage } from "./pages/SynthesisPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SupportPage } from "./pages/SupportPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/clinical-trials" element={<ClinicalTrialsPage />} />
        <Route path="/literature" element={<LiteraturePage />} />
        <Route path="/synthesis" element={<SynthesisPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}