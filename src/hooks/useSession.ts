import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface SessionMessage {
  role?: string;
  content?: unknown;
  msg_type?: string;
}

export function useSession(projectSlug: string | null, sessionId: string | null) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectSlug || !sessionId) {
      setMessages([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    invoke<SessionMessage[]>("get_session", {
      projectSlug,
      sessionId,
    })
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
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
  }, [projectSlug, sessionId]);

  return { messages, loading, error };
}
