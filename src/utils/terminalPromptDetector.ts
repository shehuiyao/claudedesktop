const ANSI_PATTERN = /\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07]*(?:\x07|\x1b\\)|\x1b[P^_].*?\x1b\\|\x1b[@-_]/g;

export function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, "");
}

export function normalizeTerminalText(input: string): string {
  return stripAnsi(input)
    .replace(/\r/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

export function isClaudeConfirmationPrompt(windowText: string): boolean {
  if (!windowText) return false;

  const text = windowText.toLowerCase();
  const hasDoYouWant = /\bdo you want to\b/.test(text);
  const hasYesOption = /(?:^|\s)(?:❯\s*)?\d+\.\s*yes\b/.test(text);
  const hasNoOption = /(?:^|\s)(?:❯\s*)?\d+\.\s*no\b/.test(text);
  const hasYesNoList = hasYesOption && hasNoOption;
  const hasYnInput = /[\(\[]\s*y\s*\/\s*n\s*[\)\]]/i.test(windowText);
  const hasConfirmContext = /\b(confirm|approval|permission|allow)\b/.test(text);

  if (hasDoYouWant && (hasYesNoList || hasYnInput)) return true;
  if (hasYesNoList && (hasDoYouWant || hasConfirmContext)) return true;
  if (hasYnInput && (hasDoYouWant || hasConfirmContext)) return true;

  return false;
}
