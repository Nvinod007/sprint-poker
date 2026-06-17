const LEGACY_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;
const SLUG_CODE_PATTERN = /^[A-Z][A-Z0-9]*-[A-Z][A-Z0-9]*$/;
const WORD_CODE_PATTERN = /^[A-Z]{4,6}$/;

export function normalizeRoomCode(code: string): string {
  return code.trim().replace(/\s+/g, "-").toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  const normalized = normalizeRoomCode(code);
  return (
    WORD_CODE_PATTERN.test(normalized) ||
    LEGACY_CODE_PATTERN.test(normalized) ||
    SLUG_CODE_PATTERN.test(normalized)
  );
}
