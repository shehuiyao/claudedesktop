import { useState, useCallback } from "react";

interface InputBarProps {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function InputBar({ disabled, onSend }: InputBarProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } catch (err) {
      console.error("Failed to send input:", err);
    } finally {
      setSending(false);
    }
  }, [text, disabled, sending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-2">
        <span className="text-[var(--accent-green)]">&#10095;</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "No active session" : "Type a message..."}
          disabled={disabled || sending}
          className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || sending || !text.trim()}
          className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-blue)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}
