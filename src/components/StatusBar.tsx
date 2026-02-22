import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function StatusBar() {
  const [claudeInstalled, setClaudeInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    invoke<boolean>("check_claude_installed")
      .then(setClaudeInstalled)
      .catch(() => setClaudeInstalled(false));
  }, []);

  return (
    <div className="flex items-center justify-between px-3 py-1 text-xs border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
      <div className="flex items-center gap-3">
        <span>
          {claudeInstalled === null
            ? "claude: checking..."
            : claudeInstalled
              ? "claude: installed"
              : "claude: not found"}
        </span>
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            claudeInstalled ? "bg-[var(--accent-green)]" : claudeInstalled === false ? "bg-[var(--accent-red)]" : "bg-[var(--text-secondary)]"
          }`}
        />
      </div>
      <div>Claude Code Desktop v0.1.0</div>
    </div>
  );
}
