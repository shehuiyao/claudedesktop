import { useEffect, useRef } from "react";
import { useSession } from "../hooks/useSession";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

interface ChatAreaProps {
  sessionId: string | null;
  projectSlug: string | null;
  onToggleSidebar: () => void;
}

export default function ChatArea({ sessionId, projectSlug, onToggleSidebar }: ChatAreaProps) {
  const { messages, loading, error } = useSession(projectSlug, sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSession = sessionId !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <button
          onClick={onToggleSidebar}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
        >
          [=]
        </button>
        <span className="text-xs text-[var(--text-secondary)]">
          {sessionId ? `session: ${sessionId.slice(0, 8)}...` : "no session"}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasSession && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-[var(--text-secondary)]">
              <div className="text-lg mb-2">Claude Code Desktop</div>
              <div className="text-sm">Start a new session or select one from the sidebar</div>
            </div>
          </div>
        )}

        {hasSession && loading && (
          <div className="text-center text-[var(--text-secondary)] text-sm py-4">
            Loading session...
          </div>
        )}

        {hasSession && error && (
          <div className="text-center text-[var(--accent-red)] text-sm py-4">
            Error: {error}
          </div>
        )}

        {hasSession && !loading && messages.length === 0 && !error && (
          <div className="text-center text-[var(--text-secondary)] text-sm py-4">
            No messages in this session
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <InputBar disabled={!hasSession} />
    </div>
  );
}
