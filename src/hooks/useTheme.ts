import { useState, useEffect, useCallback } from "react";

type ThemeMode = "dark" | "light" | "system";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme-mode") as ThemeMode) || "dark";
  });

  const getSystemTheme = useCallback((): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const effectiveTheme = mode === "system" ? getSystemTheme() : mode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    localStorage.setItem("theme-mode", mode);
  }, [mode, effectiveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", getSystemTheme());
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, getSystemTheme]);

  return { mode, effectiveTheme, setMode };
}
