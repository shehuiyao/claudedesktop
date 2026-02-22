import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SessionMessage } from "../hooks/useSession";

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block && typeof block === "object" && "text" in block) {
          return String((block as { text: unknown }).text);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text: unknown }).text);
  }
  return "";
}

interface MessageBubbleProps {
  message: SessionMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const role = message.role ?? "unknown";
  const text = extractText(message.content);

  if (!text.trim()) return null;

  const isUser = role === "human" || role === "user";
  const isAssistant = role === "assistant";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--accent-blue)] text-white"
            : isAssistant
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs italic"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <div className="prose-invert [&_pre]:bg-[var(--bg-primary)] [&_pre]:rounded [&_pre]:p-2 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-[var(--accent-green)] [&_code]:text-xs [&_a]:text-[var(--accent-blue)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
