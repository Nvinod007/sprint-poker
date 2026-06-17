import type { VoteValue } from "@/lib/types";

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.platform);
}

/** Human-readable shortcut label for tooltips. */
export function formatShortcut(keys: string): string {
  const parts = keys.split("+").map((p) => p.trim());
  if (isMac()) {
    return parts
      .map((part) => {
        if (part === "Mod") return "⌘";
        if (part === "Shift") return "⇧";
        if (part === "Alt") return "⌥";
        return part.length === 1 ? part.toUpperCase() : part;
      })
      .join("");
  }
  return parts
    .map((part) => {
      if (part === "Mod") return "Ctrl";
      return part;
    })
    .join("+");
}

/** Match keyboard event against shortcut like "Mod+Shift+C". */
export function matchShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+").map((p) => p.trim());
  const needsMod = parts.includes("Mod");
  const needsShift = parts.includes("Shift");
  const needsAlt = parts.includes("Alt");
  const keyPart = parts.find(
    (p) => p !== "Mod" && p !== "Shift" && p !== "Alt",
  );
  if (!keyPart) return false;

  const mod = isMac() ? event.metaKey : event.ctrlKey;
  if (needsMod !== mod) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;

  return event.key.toLowerCase() === keyPart.toLowerCase();
}

export const SHORTCUTS = {
  copyLink: "Mod+Shift+C",
  shareRoom: "Mod+Shift+S",
  leaveRoom: "Mod+Shift+L",
  toggleTheme: "Mod+Shift+D",
  revealVotes: "R",
  newRound: "N",
  editStory: "E",
  editRoomName: "Mod+Shift+E",
} as const;

/** Single-key vote bindings (when not typing in an input). */
export const VOTE_KEY_MAP: Record<string, VoteValue> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "5": "5",
  "8": "8",
  "4": "13",
  "6": "21",
  "?": "?",
  b: "☕",
};

export function voteShortcutLabel(value: VoteValue): string | null {
  const entry = Object.entries(VOTE_KEY_MAP).find(([, v]) => v === value);
  if (!entry) return null;
  const [key] = entry;
  return key === "b" ? "B" : key.toUpperCase();
}

export function voteFromKeyboardKey(key: string): VoteValue | null {
  return VOTE_KEY_MAP[key.toLowerCase()] ?? null;
}
