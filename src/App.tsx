import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import TerminalPanel from "./components/Terminal";
import StatusBar from "./components/StatusBar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            activeSessionId={activeSessionId}
            onSelectSession={(projectSlug: string, sessionId: string) => {
              setActiveProject(projectSlug);
              setActiveSessionId(sessionId);
            }}
            onNewSession={() => {
              setActiveSessionId(null);
              setActiveProject(null);
            }}
          />
        )}
        <ChatArea
          sessionId={activeSessionId}
          projectSlug={activeProject}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      {showTerminal && <TerminalPanel />}
      <div className="flex">
        <StatusBar />
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="px-2 py-1 text-xs border-t border-l border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          {showTerminal ? "Hide Terminal" : "Show Terminal"}
        </button>
      </div>
    </div>
  );
}

export default App;
