import { lazy, Suspense } from "react";
import type { ChatMessage } from "../hooks/useSession";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MarkdownContent = lazy(() => import("./MarkdownContent"));

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content } = message;

  if (!content.trim()) return null;

  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--accent-blue)]/90 text-white"
            : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <div className="prose-invert [&_pre]:bg-[var(--bg-primary)] [&_pre]:rounded [&_pre]:p-2 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-[var(--accent-green)] [&_code]:text-xs [&_a]:text-[var(--accent-blue)]">
            <Suspense fallback={<span className="whitespace-pre-wrap">{content}</span>}>
              <MarkdownContent>{content}</MarkdownContent>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
