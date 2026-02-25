import { useState, useRef, useCallback } from "react";

export type CliTool = "claude" | "gemini";

export interface Tab {
  id: string;
  label: string;
  workingDir: string;
  mode: "chat" | "terminal";
  yolo?: boolean;
  tool?: CliTool;
  status?: "idle" | "running" | "error" | "done";
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onReorderTabs?: (tabs: Tab[]) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onReorderTabs,
}: TabBarProps) {
  const [dragTabId, setDragTabId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<"left" | "right">("left");
  const dragImageRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDragTabId(tabId);
    e.dataTransfer.effectAllowed = "move";
    // Use transparent drag image
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    setDropTargetId(tabId);
    setDropSide(e.clientX < midX ? "left" : "right");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragTabId || !dropTargetId || dragTabId === dropTargetId || !onReorderTabs) {
      setDragTabId(null);
      setDropTargetId(null);
      return;
    }

    const reordered = [...tabs];
    const dragIndex = reordered.findIndex((t) => t.id === dragTabId);
    const dropIndex = reordered.findIndex((t) => t.id === dropTargetId);
    if (dragIndex === -1 || dropIndex === -1) return;

    const [dragged] = reordered.splice(dragIndex, 1);
    let insertIndex = reordered.findIndex((t) => t.id === dropTargetId);
    if (dropSide === "right") insertIndex += 1;
    reordered.splice(insertIndex, 0, dragged);

    onReorderTabs(reordered);
    setDragTabId(null);
    setDropTargetId(null);
  }, [dragTabId, dropTargetId, dropSide, tabs, onReorderTabs]);

  const handleDragEnd = useCallback(() => {
    setDragTabId(null);
    setDropTargetId(null);
  }, []);

  return (
    <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-x-auto">
      {/* Hidden drag image */}
      <div ref={dragImageRef} style={{ width: 1, height: 1, position: "fixed", top: -1, left: -1 }} />
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isDragging = tab.id === dragTabId;
        const isDropTarget = tab.id === dropTargetId && dragTabId !== null && dragTabId !== tab.id;
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer shrink-0 transition-colors duration-150 ${
              isActive
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            style={{
              opacity: isDragging ? 0.4 : 1,
              borderLeft: isDropTarget && dropSide === "left" ? "2px solid var(--accent-cyan)" : undefined,
              borderRight: isDropTarget && dropSide === "right" ? "2px solid var(--accent-cyan)" : undefined,
            }}
            onClick={() => onSelectTab(tab.id)}
          >
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-blue)]" />
            )}
            {/* Status dot */}
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
              tab.status === "running" ? "bg-[var(--accent-green)] animate-pulse" :
              tab.status === "error" ? "bg-[var(--accent-red)]" :
              tab.status === "done" ? "bg-[var(--accent-blue)]" :
              "bg-[var(--text-muted)]"
            }`} />
            <span className="truncate max-w-[120px]">{tab.label}</span>
            <button
              className={`ml-1 w-4 h-4 flex items-center justify-center rounded-sm text-[10px] leading-none cursor-pointer transition-all duration-150 ${
                isActive
                  ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  : "opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
            >
              &#x2715;
            </button>
          </div>
        );
      })}
      <button
        onClick={onNewTab}
        className="px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer shrink-0 transition-colors duration-150"
        title="New tab"
      >
        +
      </button>
    </div>
  );
}
