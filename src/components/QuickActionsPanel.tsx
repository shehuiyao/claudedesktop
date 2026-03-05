import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface QuickAction {
  label: string;
  command: string;
  icon: string;
  description: string;
  color: string;
}

interface QuickActionsPanelProps {
  workingDir: string;
  onClose: () => void;
  onSendCommand: (command: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  red: "var(--accent-red)",
  orange: "var(--accent-orange)",
  cyan: "var(--accent-cyan)",
  green: "var(--accent-green)",
  purple: "var(--accent-purple)",
  blue: "var(--accent-blue)",
};

export default function QuickActionsPanel({ workingDir, onClose, onSendCommand }: QuickActionsPanelProps) {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActions = useCallback(() => {
    invoke<QuickAction[]>("load_quick_actions", { workingDir })
      .then((data) => {
        setActions(data);
      })
      .catch(() => {
        setActions([]);
      })
      .finally(() => setLoading(false));
  }, [workingDir]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const handleEdit = useCallback(() => {
    invoke("reveal_quick_actions_config", { workingDir }).catch(() => {});
  }, [workingDir]);

  const handleAiRecommend = useCallback(() => {
    onSendCommand("请根据当前项目的技能列表，帮我推荐适合的快捷按钮配置，生成 .claude/quick-actions.json 文件");
  }, [onSendCommand]);

  return (
    <div className="w-56 border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col h-full overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] shrink-0">
        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Quick Actions
        </span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors duration-150 text-[10px]"
          title="关闭"
        >
          ✕
        </button>
      </div>

      {/* 按钮网格 */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs">
            加载中...
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs">
            暂无快捷操作
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {actions.map((action, idx) => {
              const accentColor = COLOR_MAP[action.color] || "var(--text-secondary)";
              return (
                <button
                  key={idx}
                  onClick={() => onSendCommand(action.command)}
                  className="flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] hover:border-current cursor-pointer transition-all duration-150 group"
                  style={{ color: accentColor }}
                  title={action.description}
                >
                  <span className="text-lg leading-none">{action.icon}</span>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate w-full text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex border-t border-[var(--border-subtle)] shrink-0">
        <button
          onClick={handleEdit}
          className="flex-1 text-[10px] py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors duration-150"
          title="在 Finder 中打开配置文件"
        >
          编辑配置
        </button>
        <div className="w-px bg-[var(--border-subtle)]" />
        <button
          onClick={handleAiRecommend}
          className="flex-1 text-[10px] py-1.5 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors duration-150"
          title="让 AI 根据项目技能推荐按钮配置"
        >
          AI 推荐
        </button>
      </div>
    </div>
  );
}
