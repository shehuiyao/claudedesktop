import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

interface RuleFile {
  name: string;
  path: string;
  source: string;
}

function RevealButton({ path }: { path: string }) {
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await invoke("reveal_in_finder", { path });
        } catch (err) {
          console.error("Failed to reveal in Finder:", err);
        }
      }}
      className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors duration-150 opacity-80 hover:opacity-100"
      title="在 Finder 中显示"
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6 1h5.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V2.707l-4.146 4.147a.5.5 0 0 1-.708-.708L10.293 2H8a.5.5 0 0 1 0-1Z" />
        <path d="M1 5a2 2 0 0 1 2-2h3a.5.5 0 0 1 0 1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3a.5.5 0 0 1 1 0v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5Z" />
      </svg>
    </button>
  );
}

function TreeNode({ entry }: { entry: FileEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const toggle = useCallback(async () => {
    if (!entry.is_dir) return;
    if (!loaded) {
      try {
        const entries = await invoke<FileEntry[]>("list_directory", {
          path: entry.path,
        });
        setChildren(entries);
        setLoaded(true);
      } catch {
        setChildren([]);
        setLoaded(true);
      }
    }
    setExpanded((prev) => !prev);
  }, [entry.path, entry.is_dir, loaded]);

  return (
    <div>
      <div
        onClick={toggle}
        className={`group flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-sm transition-colors duration-100 ${
          entry.is_dir
            ? "text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        }`}
      >
        {entry.is_dir ? (
          <span className="w-3 text-center text-[10px] text-[var(--text-secondary)]">
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span>{entry.is_dir ? "\uD83D\uDCC1" : "\uD83D\uDCC4"}</span>
        <span className="truncate flex-1 min-w-0">{entry.name}</span>
        <RevealButton path={entry.path} />
      </div>
      {expanded && children.length > 0 && (
        <div className="pl-3">
          {children.map((child) => (
            <TreeNode key={child.path} entry={child} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreeProps {
  rootPath: string;
}

export default function FileTree({ rootPath }: FileTreeProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [ruleFiles, setRuleFiles] = useState<RuleFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rootPath) return;
    setError(null);
    invoke<FileEntry[]>("list_directory", { path: rootPath })
      .then(setEntries)
      .catch((e) => setError(String(e)));
    invoke<RuleFile[]>("list_rule_files", { projectPath: rootPath })
      .then(setRuleFiles)
      .catch(() => setRuleFiles([]));
  }, [rootPath]);

  return (
    <div className="w-56 border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col overflow-hidden relative">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={async () => {
            try {
              await invoke("reveal_in_finder", { path: rootPath });
            } catch (err) {
              console.error("Failed to reveal in Finder:", err);
            }
          }}
          className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors duration-150"
          title="在 Finder 中打开根目录"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 1h5.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V2.707l-4.146 4.147a.5.5 0 0 1-.708-.708L10.293 2H8a.5.5 0 0 1 0-1Z" />
            <path d="M1 5a2 2 0 0 1 2-2h3a.5.5 0 0 1 0 1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3a.5.5 0 0 1 1 0v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5Z" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {/* Rules 区块 */}
        {ruleFiles.length > 0 && (
          <div className="mb-1">
            <div className="px-3 py-1">
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Rules
              </span>
            </div>
            {ruleFiles.map((rule) => (
              <div
                key={rule.path}
                className="group flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-sm hover:bg-[var(--bg-hover)] transition-colors duration-100"
              >
                <span className="w-3" />
                <span className="text-[var(--accent-purple)]">
                  {rule.source === "project" ? "\u2699\uFE0F" : "\uD83D\uDD27"}
                </span>
                <span className="truncate flex-1 min-w-0 text-[var(--text-secondary)]">
                  {rule.name}
                </span>
                <RevealButton path={rule.path} />
              </div>
            ))}
            <div className="mx-2 my-1 border-b border-[var(--border-subtle)]" />
          </div>
        )}

        {/* 文件树 */}
        {error ? (
          <div className="px-3 py-2 text-xs text-[var(--accent-red)]">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">
            No files
          </div>
        ) : (
          <>
            <div className="px-3 py-1">
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Files
              </span>
            </div>
            {entries.map((entry) => (
              <TreeNode key={entry.path} entry={entry} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
