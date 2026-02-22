import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface SessionMessage {
  role?: string;
  content?: unknown;
  msg_type?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function parseSessionMessages(raw: SessionMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (const msg of raw) {
    if (!msg.role || (msg.role !== "user" && msg.role !== "assistant")) continue;
    let text = "";
    if (typeof msg.content === "string") {
      text = msg.content;
    } else if (Array.isArray(msg.content)) {
      text = (msg.content as { type?: string; text?: string }[])
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text!)
        .join("\n");
    }
    if (text) {
      result.push({
        role: msg.role as "user" | "assistant",
        content: text,
        timestamp: Date.now(),
      });
    }
  }
  return result;
}

export function useSession(
  projectSlug: string | null,
  sessionId: string | null,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [workingDir, setWorkingDir] = useState("");
  const pendingOutput = useRef("");
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushOutput = useCallback(() => {
    if (pendingOutput.current) {
      const text = pendingOutput.current;
      pendingOutput.current = "";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + text },
          ];
        }
        return [
          ...prev,
          { role: "assistant", content: text, timestamp: Date.now() },
        ];
      });
    }
    flushTimer.current = null;
  }, []);

  // Listen for PTY events when a live session is active
  useEffect(() => {
    if (!isLive) return;

    const unlisteners: UnlistenFn[] = [];

    listen<string>("pty-output", (event) => {
      pendingOutput.current += event.payload;
      if (!flushTimer.current) {
        flushTimer.current = setTimeout(flushOutput, 50);
      }
    }).then((u) => unlisteners.push(u));

    listen("pty-exit", () => {
      flushOutput();
      setIsLive(false);
    }).then((u) => unlisteners.push(u));

    return () => {
      unlisteners.forEach((u) => u());
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [isLive, flushOutput]);

  // Load historical session when projectSlug/sessionId change
  useEffect(() => {
    if (!projectSlug || !sessionId) {
      if (!isLive) {
        setMessages([]);
        setError(null);
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsLive(false);

    invoke<SessionMessage[]>("get_session", { projectSlug, sessionId })
      .then((data) => {
        if (!cancelled) {
          setMessages(parseSessionMessages(data));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectSlug, sessionId, isLive]);

  const startLiveSession = useCallback(
    async (dir: string) => {
      if (isLive) return;
      setMessages([]);
      setError(null);
      setWorkingDir(dir);
      setIsLive(true);
      try {
        await invoke("start_session", {
          workingDir: dir,
          args: ["--chat"],
        });
      } catch (e) {
        setIsLive(false);
        setError(String(e));
        setMessages([
          {
            role: "assistant",
            content: `Error starting session: ${e}`,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [isLive],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!isLive || !text.trim()) return;
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: Date.now() },
      ]);
      try {
        await invoke("send_input", { data: text + "\n" });
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${e}`,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [isLive],
  );

  return {
    messages,
    loading,
    error,
    isLive,
    workingDir,
    startLiveSession,
    sendMessage,
  };
}
