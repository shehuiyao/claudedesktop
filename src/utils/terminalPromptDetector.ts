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
  const hasConfirmCue =
    /\b(do you want to|are you sure|proceed|continue|confirm|manual approval|approval|permission|allow|deny|approve|reject|choose an option|select an option)\b/.test(
      text,
    );

  const hasYnInput =
    /[\(\[]\s*y(?:es)?\s*\/\s*n(?:o)?\s*[\)\]]/i.test(windowText) ||
    /\b[yY]\s*\/\s*[nN]\b/.test(windowText);

  const hasYesLikeOption = /(?:^|\s)(?:❯\s*)?\d+\.\s*(yes|proceed|continue|allow|approve)\b/.test(text);
  const hasNoLikeOption = /(?:^|\s)(?:❯\s*)?\d+\.\s*(no|cancel|deny|reject)\b/.test(text);
  const hasBinaryChoiceList = hasYesLikeOption && hasNoLikeOption;

  const hasPromptFooter = /\b(esc to cancel|tab to amend)\b/.test(text);

  if (hasConfirmCue && (hasYnInput || hasBinaryChoiceList)) return true;
  if (hasBinaryChoiceList && hasPromptFooter) return true;
  if (hasYnInput && hasConfirmCue) return true;

  return false;
}
