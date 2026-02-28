import { useCallback, useRef } from "react";

interface SplitDividerProps {
  onRatioChange: (ratio: number) => void;
}

export default function SplitDivider({ onRatioChange }: SplitDividerProps) {
  const dragging = useRef(false);
  const dividerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;

      const contentArea = dividerRef.current?.parentElement?.parentElement;
      if (!contentArea) return;
      const rect = contentArea.getBoundingClientRect();

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        let ratio = (ev.clientX - rect.left) / rect.width;
        ratio = Math.max(0.25, Math.min(0.75, ratio));
        onRatioChange(ratio);
      };

      const handleMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [onRatioChange],
  );

  return (
    <div
      ref={dividerRef}
      onMouseDown={handleMouseDown}
      className="w-1 h-full shrink-0 cursor-col-resize bg-[var(--border-subtle)] hover:bg-[var(--accent-cyan)] transition-colors duration-150"
    />
  );
}
